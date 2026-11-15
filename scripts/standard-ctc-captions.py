#!/usr/bin/env python3
import argparse
import importlib.util
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE_SCRIPT = ROOT / "scripts" / "test-myanmar-ctc-alignment.py"

def load_base():
    spec = importlib.util.spec_from_file_location("ctc_base", BASE_SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load CTC base: {BASE_SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def apply_replacements(text, replacements):
    if not replacements:
        return text, [(i, i + 1) for i in range(len(text))], []

    for item in replacements:
        if not item.get("source") or not item.get("target"):
            raise ValueError("Every mapping replacement needs source and target.")

    ordered = sorted(replacements, key=lambda x: len(x["source"]), reverse=True)
    pattern = re.compile("|".join(re.escape(x["source"]) for x in ordered), re.IGNORECASE)
    output, output_map, log = [], [], []
    cursor = 0

    for match in pattern.finditer(text):
        if match.start() < cursor:
            continue
        output.extend(text[cursor:match.start()])
        output_map.extend((i, i + 1) for i in range(cursor, match.start()))
        original = text[match.start():match.end()]
        selected = next(x for x in ordered if x["source"].casefold() == original.casefold())
        target = selected["target"]
        output.extend(target)
        output_map.extend([(match.start(), match.end())] * len(target))
        log.append({"source_found": original, "target": target})
        cursor = match.end()

    output.extend(text[cursor:])
    output_map.extend((i, i + 1) for i in range(cursor, len(text)))
    return "".join(output), output_map, log

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--match-key", required=True)
    parser.add_argument("--audio", required=True)
    parser.add_argument("--srt", required=True)
    parser.add_argument("--mapping", default="")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    audio_path = ROOT / args.audio
    srt_path = ROOT / args.srt
    output_path = ROOT / args.output

    for path in (audio_path, srt_path):
        if not path.is_file():
            raise FileNotFoundError(path)

    mapping = {"replacements": []}
    if args.mapping:
        mapping_path = ROOT / args.mapping
        if not mapping_path.is_file():
            raise FileNotFoundError(mapping_path)
        mapping = json.loads(mapping_path.read_text(encoding="utf-8"))
        if mapping.get("match_key") != args.match_key:
            raise ValueError("Mapping match_key does not match selected match.")

    base = load_base()
    captions = base.read_srt(srt_path)
    original_text, source_spans = base.combine(captions)
    transformed_text, char_map, replacement_log = apply_replacements(
        original_text, mapping.get("replacements", [])
    )

    latin_words = sorted(set(re.findall(r"[A-Za-z]+(?:['’-][A-Za-z]+)*", transformed_text)))
    unsupported_runs = []
    vocab_folder = None

    from huggingface_hub import snapshot_download
    vocab_folder = Path(snapshot_download(repo_id=base.REPO, allow_patterns=["model.py", "model.safetensors", "vocab.json", "cmvn.json", "preprocessor_config.json"]))
    vocab = json.loads((vocab_folder / "vocab.json").read_text(encoding="utf-8"))
    trie = base.trie_for(vocab)

    token_rows = []
    for run in base.runs(transformed_text):
        tokens = base.tokenize(run["text"], trie)
        if tokens is None:
            unsupported_runs.append(run["text"])
            continue

        for token in tokens:
            positions = run["positions"][token["a"]:token["b"]]
            if not positions:
                continue
            a, b = min(positions), max(positions) + 1
            mapped = char_map[a:b]
            source_a = min(x[0] for x in mapped)
            source_b = max(x[1] for x in mapped)
            token_rows.append({
                "token": token["text"],
                "token_id": token["id"],
                "transformed_start": a,
                "transformed_end": b,
                "caption_ids": base.source_captions(source_a, source_b, source_spans),
            })

    if latin_words or unsupported_runs or not token_rows:
        raise ValueError(
            f"CTC blocked. Remaining Latin={latin_words}; "
            f"unsupported Myanmar runs={unsupported_runs}; tokens={len(token_rows)}"
        )

    print("Loading Myanmar CTC model...")
    model, cmvn, mel = base.load_bundle(vocab_folder, len(vocab))
    waveform = base.audio_load(audio_path)
    log_probs = base.log_probs_for(model, cmvn, mel, waveform)
    frame_spans, score = base.viterbi(
        log_probs, [row["token_id"] for row in token_rows]
    )

    aligned = []
    for row, frame in zip(token_rows, frame_spans):
        first, last, token_score = frame
        aligned.append({
            **row,
            "start_seconds": first * base.FRAME_SEC,
            "end_seconds": (last + 1) * base.FRAME_SEC,
            "mean_log_probability": token_score,
        })

    output_captions = []
    for caption in captions:
        span = next(s for s in source_spans if s["caption"] == caption["index"])
        selected = [
            i for i, (a, b) in enumerate(char_map)
            if a < span["b"] and b > span["a"]
        ]
        caption_text = "".join(transformed_text[i] for i in selected)
        words = []

        for match in re.finditer(r"\S+", caption_text):
            local_a, local_b = match.span()
            global_positions = selected[local_a:local_b]
            if not global_positions:
                continue
            word_a, word_b = min(global_positions), max(global_positions) + 1
            word_tokens = [
                token for token in aligned
                if token["transformed_start"] < word_b
                and token["transformed_end"] > word_a
                and caption["index"] in token["caption_ids"]
            ]
            if not word_tokens:
                raise ValueError(
                    f"Missing CTC timing for caption {caption['index']} "
                    f"word: {match.group()}"
                )
            words.append({
                "text": match.group(),
                "start": min(t["start_seconds"] for t in word_tokens),
                "end": max(t["end_seconds"] for t in word_tokens),
            })

        if not words:
            raise ValueError(f"No timed words in caption {caption['index']}")

        output_captions.append({
            "start": caption["start"],
            "end": caption["end"],
            "text": caption_text,
            "words": words,
        })

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(output_captions, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print("ALIGNMENT COMPLETED")
    print("Match:", args.match_key)
    print("Captions:", len(output_captions))
    print("Aligned tokens:", len(aligned))
    print("Replacement count:", len(replacement_log))
    print("Mean frame score:", score)
    print("Output:", output_path)

if __name__ == "__main__":
    main()
