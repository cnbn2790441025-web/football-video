#!/usr/bin/env python3
import argparse
import csv
import importlib.util
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BASE_SCRIPT = ROOT / "scripts" / "test-myanmar-ctc-alignment.py"
OUTPUT_ROOT = ROOT / "ctc-mixed-test-output"


def load_base():
    spec = importlib.util.spec_from_file_location("ctc_base", BASE_SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load base script: {BASE_SCRIPT}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def apply_replacements(text, replacements):
    ordered = sorted(
        replacements,
        key=lambda item: len(item["source"]),
        reverse=True,
    )

    pattern = re.compile(
        "|".join(re.escape(item["source"]) for item in ordered),
        re.IGNORECASE,
    )

    source_map = []
    for i in range(len(text)):
        source_map.append((i, i + 1))

    output = []
    output_map = []
    replacement_log = []
    cursor = 0

    for match in pattern.finditer(text):
        if match.start() < cursor:
            continue

        output.extend(text[cursor:match.start()])
        output_map.extend(source_map[cursor:match.start()])

        original = text[match.start():match.end()]
        selected = next(
            item for item in ordered
            if item["source"].casefold() == original.casefold()
        )

        target = selected["target"]
        output.extend(target)
        output_map.extend(
            [(match.start(), match.end())] * len(target)
        )

        replacement_log.append({
            "source_found": original,
            "target": target,
            "source_start": match.start(),
            "source_end": match.end(),
        })

        cursor = match.end()

    output.extend(text[cursor:])
    output_map.extend(source_map[cursor:])

    return "".join(output), output_map, replacement_log


def write_json(path, data):
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("match_key")
    parser.add_argument(
        "--mapping",
        default="experiments/myanmar-ctc-mixed/arsenal-hull-city.mapping.json",
    )
    parser.add_argument("--model-dir")
    args = parser.parse_args()

    base = load_base()

    mapping_path = ROOT / args.mapping
    mapping = json.loads(mapping_path.read_text(encoding="utf-8"))

    if mapping.get("match_key") != args.match_key:
        raise ValueError("Mapping match_key does not match requested match.")

    match_key = args.match_key
    srt_path = ROOT / "public" / "assets" / "srt" / f"{match_key}.srt"
    audio_path = ROOT / "public" / "assets" / "mp3" / f"{match_key}.mp3"

    if not srt_path.is_file():
        raise FileNotFoundError(srt_path)

    if not audio_path.is_file():
        raise FileNotFoundError(audio_path)

    captions = base.read_srt(srt_path)
    original_text, source_spans = base.combine(captions)

    transformed_text, char_map, replacement_log = apply_replacements(
        original_text,
        mapping.get("replacements", []),
    )

    latin_words = sorted(set(
        re.findall(r"[A-Za-z]+(?:['’-][A-Za-z]+)*", transformed_text)
    ))

    runs = base.runs(transformed_text)

    vocab_path = None
    model_dir = args.model_dir

    if model_dir:
        model_dir = Path(model_dir)
        vocab_path = model_dir / "vocab.json"
    else:
        vocab_path = None

    vocab = None
    tokenizer_results = []
    unsupported_runs = []

    if vocab_path and vocab_path.is_file():
        vocab = json.loads(vocab_path.read_text(encoding="utf-8"))
    else:
        try:
            from huggingface_hub import snapshot_download
            model_folder = Path(snapshot_download(repo_id=base.REPO))
            vocab_path = model_folder / "vocab.json"
            vocab = json.loads(vocab_path.read_text(encoding="utf-8"))
            model_dir = model_folder
        except Exception as exc:
            raise RuntimeError(
                "Cannot load model vocabulary. Provide --model-dir."
            ) from exc

    trie = base.trie_for(vocab)

    for run in runs:
        tokens = base.tokenize(run["text"], trie)

        if tokens is None:
            unsupported_runs.append({
                "start": run["a"],
                "end": run["b"],
                "text": run["text"],
            })
        else:
            tokenizer_results.append({
                "run": run,
                "tokens": tokens,
            })

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    output_dir = OUTPUT_ROOT / f"{match_key}-{timestamp}"
    output_dir.mkdir(parents=True, exist_ok=False)

    result = {
        "match_key": match_key,
        "original_srt": str(srt_path.relative_to(ROOT)),
        "audio": str(audio_path.relative_to(ROOT)),
        "original_text": original_text,
        "transformed_text": transformed_text,
        "replacements": replacement_log,
        "remaining_latin_words": latin_words,
        "unsupported_myanmar_runs": unsupported_runs,
        "tokenization": [],
        "aligned_tokens": [],
        "caption_results": [],
        "alignment_status": "BLOCKED",
    }

    token_rows = []

    for item in tokenizer_results:
        run = item["run"]

        for token in item["tokens"]:
            positions = run["positions"][token["a"]:token["b"]]

            if not positions:
                continue

            transformed_a = min(positions)
            transformed_b = max(positions) + 1

            mapped = char_map[transformed_a:transformed_b]
            source_a = min(pair[0] for pair in mapped)
            source_b = max(pair[1] for pair in mapped)

            caption_ids = base.source_captions(
                source_a,
                source_b,
                source_spans,
            )

            row = {
                "token": token["text"],
                "token_id": token["id"],
                "transformed_start": transformed_a,
                "transformed_end": transformed_b,
                "source_start": source_a,
                "source_end": source_b,
                "caption_ids": caption_ids,
                "start": min(
                    (span["start"] for span in source_spans
                     if span["caption"] in caption_ids),
                    default=None,
                ),
                "end": max(
                    (span["end"] for span in source_spans
                     if span["caption"] in caption_ids),
                    default=None,
                ),
            }

            token_rows.append(row)

    result["tokenization"] = token_rows

    caption_rows = []
    for caption in captions:
        caption_rows.append({
            "caption": caption["index"],
            "start": caption["start"],
            "end": caption["end"],
            "text": caption["text"],
            "tokens": [
                row["token"]
                for row in token_rows
                if caption["index"] in row["caption_ids"]
            ],
        })

    result["caption_results"] = caption_rows

    write_json(output_dir / "result.json", result)

    with (output_dir / "tokens.csv").open(
        "w", newline="", encoding="utf-8-sig"
    ) as file:
        fields = [
            "token", "token_id",
            "transformed_start", "transformed_end",
            "source_start", "source_end",
            "caption_ids", "start", "end",
        ]
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()

        for row in token_rows:
            csv_row = dict(row)
            csv_row["caption_ids"] = ",".join(
                str(x) for x in row["caption_ids"]
            )
            writer.writerow(csv_row)

    (output_dir / "transformed.txt").write_text(
        transformed_text,
        encoding="utf-8",
    )

    if latin_words or unsupported_runs or not token_rows:
        result["alignment_status"] = "BLOCKED"
        result["block_reason"] = (
            "Remaining Latin words, unsupported Myanmar runs, or no tokenizable Myanmar tokens."
        )
        write_json(output_dir / "result.json", result)

        print("ALIGNMENT BLOCKED")
        print("Remaining Latin words:", latin_words)
        print("Unsupported Myanmar runs:", len(unsupported_runs))
        print("Output:", output_dir)
        return 2

    print("All Myanmar runs tokenized.")
    print("Replacement count:", len(replacement_log))
    print("Token count:", len(token_rows))
    print("Output:", output_dir)

    model, cmvn, mel = base.load_bundle(
        Path(model_dir),
        len(vocab),
    )

    waveform = base.audio_load(audio_path)
    log_probs = base.log_probs_for(
        model,
        cmvn,
        mel,
        waveform,
    )

    all_ids = [
        row["token_id"]
        for row in token_rows
    ]

    frame_spans, score = base.viterbi(log_probs, all_ids)

    aligned = []
    for row, frame in zip(token_rows, frame_spans):
        first, last, token_score = frame

        aligned.append({
            **row,
            "first_frame": first,
            "last_frame": last,
            "start_seconds": first * base.FRAME_SEC,
            "end_seconds": (last + 1) * base.FRAME_SEC,
            "mean_log_probability": token_score,
        })

    result["aligned_tokens"] = aligned
    result["alignment_status"] = "COMPLETED"
    result["mean_frame_score"] = score

    write_json(output_dir / "result.json", result)

    with (output_dir / "aligned-tokens.csv").open(
        "w", newline="", encoding="utf-8-sig"
    ) as file:
        fields = list(aligned[0].keys()) if aligned else []
        writer = csv.DictWriter(file, fieldnames=fields)
        if fields:
            writer.writeheader()
            writer.writerows(aligned)

    print("ALIGNMENT COMPLETED")
    print("Aligned tokens:", len(aligned))
    print("Mean frame score:", score)
    print("Output:", output_dir)


if __name__ == "__main__":
    sys.exit(main())