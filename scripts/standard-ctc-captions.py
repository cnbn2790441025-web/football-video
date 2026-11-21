#!/usr/bin/env python3
import argparse
import importlib.util
import json
import re
import unicodedata
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


def srt_seconds(value):
    h, m, tail = value.replace(",", ".").split(":")
    sec, ms = tail.split(".")
    return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000


def is_myanmar(ch):
    n = ord(ch)
    return (
        (0x1000 <= n <= 0x109F and ch not in "၊။")
        or 0xA9E0 <= n <= 0xA9FF
        or 0xAA60 <= n <= 0xAA7F
    )


def read_srt_fallback(path):
    content = path.read_text(encoding="utf-8-sig").strip()
    blocks = re.split(r"\r?\n\s*\r?\n", content)
    captions = []

    for block in blocks:
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        ti = next((i for i, line in enumerate(lines) if "-->" in line), None)
        if ti is None:
            continue

        match = re.match(
            r"(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*"
            r"(\d{2}:\d{2}:\d{2}[,.]\d{3})",
            lines[ti],
        )
        if not match:
            raise ValueError(f"Bad SRT timestamp: {lines[ti]}")

        parts = []
        for line in lines[ti + 1:]:
            if parts:
                a, b = parts[-1][-1], line[0]
                parts.append("" if is_myanmar(a) and is_myanmar(b) else " ")
            parts.append(line)

        caption_text = "".join(parts).strip()
        if not caption_text:
            continue

        start = srt_seconds(match.group(1))
        end = srt_seconds(match.group(2))
        if end <= start:
            raise ValueError(f"Bad caption duration: {lines[ti]}")

        captions.append({
            "index": len(captions) + 1,
            "start": start,
            "end": end,
            "text": caption_text,
        })

    if not captions:
        raise ValueError("No valid SRT captions")
    return captions


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


def normalize_with_map(text, char_map):
    output = []
    output_map = []
    cluster = []
    cluster_map = []

    def flush():
        if not cluster:
            return
        normalized = unicodedata.normalize("NFC", "".join(cluster))
        if cluster_map:
            source_span = (
                min(x[0] for x in cluster_map),
                max(x[1] for x in cluster_map),
            )
            output.extend(normalized)
            output_map.extend([source_span] * len(normalized))
        cluster.clear()
        cluster_map.clear()

    for ch, span in zip(text, char_map):
        if cluster and unicodedata.category(ch).startswith("M"):
            cluster.append(ch)
            cluster_map.append(span)
        else:
            flush()
            cluster.append(ch)
            cluster_map.append(span)

    flush()
    return "".join(output), output_map


def word_groups(text):
    matches = list(re.finditer(r"\S+", text))
    groups = []
    i = 0

    while i < len(matches):
        match = matches[i]
        if re.fullmatch(r"[။၊,;:!?…—–\-]+", match.group()):
            if i + 1 < len(matches):
                groups.append((match.start(), matches[i + 1].end()))
                i += 2
                continue
            elif groups:
                groups[-1] = (groups[-1][0], match.end())
                i += 1
                continue
        groups.append(match.span())
        i += 1

    return groups


def write_fallback(captions, output_path, reason):
    output_captions = []

    for caption in captions:
        text = caption.get("text", "")
        groups = word_groups(text)
        duration = max(0.0, float(caption["end"]) - float(caption["start"]))
        total = sum(max(1, b - a) for a, b in groups)
        words = []

        cursor = float(caption["start"])
        consumed = 0

        for index, (a, b) in enumerate(groups):
            weight = max(1, b - a)
            consumed += weight
            end = (
                float(caption["end"])
                if index == len(groups) - 1
                else float(caption["start"]) + duration * consumed / total
            )
            words.append({
                "text": text[a:b],
                "start": cursor,
                "end": max(cursor, end),
            })
            cursor = end

        output_captions.append({
            "start": caption["start"],
            "end": caption["end"],
            "text": text,
            "words": words,
        })

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(output_captions, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("CTC FALLBACK USED")
    print("Reason:", reason)
    print("Captions:", len(output_captions))
    print("Output:", output_path)


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

    captions = read_srt_fallback(srt_path)

    try:
        base = load_base()
        original_text, source_spans = base.combine(captions)
        transformed_text, char_map, replacement_log = apply_replacements(
            original_text, mapping.get("replacements", [])
        )
        transformed_text, char_map = normalize_with_map(transformed_text, char_map)
        latin_words = sorted(set(re.findall(
            r"[A-Za-z]+(?:['’-][A-Za-z]+)*", transformed_text
        )))
        unsupported_runs = []

        from huggingface_hub import snapshot_download
        vocab_folder = Path(snapshot_download(
            repo_id=base.REPO,
            allow_patterns=[
                "model.py", "model.safetensors", "vocab.json",
                "cmvn.json", "preprocessor_config.json"
            ],
        ))
        vocab = json.loads(
            (vocab_folder / "vocab.json").read_text(encoding="utf-8")
        )
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
                    "caption_ids": base.source_captions(
                        source_a, source_b, source_spans
                    ),
                })

        if latin_words or unsupported_runs or not token_rows:
            reason = (
                f"Unsupported text; Latin={latin_words}; "
                f"unsupported runs={unsupported_runs}; tokens={len(token_rows)}"
            )
            write_fallback(captions, output_path, reason)
            return

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

    except Exception as exc:
        write_fallback(
            captions, output_path,
            f"{type(exc).__name__}: {exc}",
        )
        return

    output_captions = []
    for caption in captions:
        span = next(s for s in source_spans if s["caption"] == caption["index"])
        selected = [
            i for i, (a, b) in enumerate(char_map)
            if a < span["b"] and b > span["a"]
        ]
        caption_text = "".join(transformed_text[i] for i in selected)
        words = []

        groups = word_groups(caption_text)

        for local_a, local_b in groups:
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
            if word_tokens:
                word_start = min(t["start_seconds"] for t in word_tokens)
                word_end = max(t["end_seconds"] for t in word_tokens)
            else:
                caption_groups = groups
                total_weight = sum(max(1, y - x) for x, y in caption_groups)
                prior_weight = sum(
                    max(1, y - x)
                    for x, y in caption_groups
                    if y <= local_a
                )
                current_weight = max(1, local_b - local_a)
                duration = max(0.0, caption["end"] - caption["start"])
                word_start = caption["start"] + duration * prior_weight / total_weight
                word_end = caption["start"] + duration * (
                    prior_weight + current_weight
                ) / total_weight
                print(
                    "WORD TIMING FALLBACK:",
                    caption["index"],
                    caption_text[local_a:local_b],
                )

            words.append({
                "text": caption_text[local_a:local_b],
                "start": word_start,
                "end": word_end,
            })

        if not words:
            write_fallback(
                captions, output_path,
                f"No timed words in caption {caption['index']}",
            )
            return

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
