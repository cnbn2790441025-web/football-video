import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import stable_whisper


def to_seconds(value):
    hours, minutes, remainder = value.replace(",", ".").split(":")
    seconds, milliseconds = remainder.split(".")
    return (
        int(hours) * 3600
        + int(minutes) * 60
        + int(seconds)
        + int(milliseconds) / 1000
    )


def read_srt(path):
    content = path.read_text(encoding="utf-8-sig")
    blocks = re.split(r"\r?\n\s*\r?\n", content.strip())
    captions = []

    for block in blocks:
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        timing_index = next(
            (i for i, line in enumerate(lines) if "-->" in line), None
        )

        if timing_index is None:
            continue

        match = re.match(
            r"(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*"
            r"(\d{2}:\d{2}:\d{2}[,.]\d{3})",
            lines[timing_index],
        )

        if not match:
            raise ValueError(f"Invalid SRT timestamp: {lines[timing_index]}")

        text = " ".join(lines[timing_index + 1:]).strip()
        if not text:
            continue

        start = to_seconds(match.group(1))
        end = to_seconds(match.group(2))

        if end <= start:
            raise ValueError(f"Invalid caption duration: {lines[timing_index]}")

        captions.append({
            "index": len(captions) + 1,
            "start": start,
            "end": end,
            "text": text,
        })

    if not captions:
        raise ValueError("No valid captions found in SRT.")

    return captions


def fmt_time(value):
    return "N/A" if value is None else f"{value:.3f}"


def main():
    if len(sys.argv) != 2:
        raise SystemExit(
            "Usage: python scripts/test-word-alignment.py MATCH_KEY"
        )

    key = sys.argv[1]
    if not re.fullmatch(r"[a-zA-Z0-9_-]+", key):
        raise ValueError("Invalid match key.")

    audio = Path(f"public/assets/mp3/{key}.mp3")
    srt = Path(f"public/assets/srt/{key}.srt")
    output = Path("alignment-test-output")
    output.mkdir(exist_ok=True)

    if not audio.is_file() or not srt.is_file():
        raise FileNotFoundError(f"Missing input: {audio} or {srt}")

    captions = read_srt(srt)

    print(f"Audio: {audio}")
    print(f"SRT: {srt}")
    print(f"Original captions: {len(captions)}")
    print("Loading multilingual Whisper base model on CPU...")

    model = stable_whisper.load_model("base", device="cpu")
    padding = 0.25
    aligned_captions = []

    with tempfile.TemporaryDirectory(prefix="caption-alignment-") as temp:
        temp_dir = Path(temp)

        for caption in captions:
            index = caption["index"]
            clip_start = max(0.0, caption["start"] - padding)
            clip_end = caption["end"] + padding
            clip_duration = clip_end - clip_start
            clip_path = temp_dir / f"caption-{index:02d}.wav"

            print(
                f"\nCaption {index}/{len(captions)}: "
                f"{caption['start']:.3f}-{caption['end']:.3f}"
            )

            subprocess.run(
                [
                    "ffmpeg",
                    "-hide_banner",
                    "-loglevel", "error",
                    "-y",
                    "-i", str(audio),
                    "-ss", f"{clip_start:.3f}",
                    "-t", f"{clip_duration:.3f}",
                    "-vn",
                    "-ac", "1",
                    "-ar", "16000",
                    str(clip_path),
                ],
                check=True,
            )

            local_segment = {
                "start": caption["start"] - clip_start,
                "end": caption["end"] - clip_start,
                "text": caption["text"],
            }

            result = model.align_words(
                str(clip_path),
                [local_segment],
                language="my",
                verbose=False,
            )

            tokens = []

            for segment in getattr(result, "segments", []) or []:
                for word in getattr(segment, "words", []) or []:
                    local_start = (
                        float(word.start) if word.start is not None else None
                    )
                    local_end = (
                        float(word.end) if word.end is not None else None
                    )

                    absolute_start = (
                        clip_start + local_start
                        if local_start is not None else None
                    )
                    absolute_end = (
                        clip_start + local_end
                        if local_end is not None else None
                    )

                    tokens.append({
                        "text": word.word,
                        "start": absolute_start,
                        "end": absolute_end,
                        "zero_duration": (
                            absolute_start is not None
                            and absolute_end is not None
                            and absolute_end <= absolute_start
                        ),
                    })

            aligned_captions.append({
                "index": index,
                "original_start": caption["start"],
                "original_end": caption["end"],
                "text": caption["text"],
                "tokens": tokens,
            })

    json_path = output / f"{key}.alignment.json"
    report_path = output / f"{key}.alignment.txt"

    payload = {
        "match_key": key,
        "audio": str(audio),
        "srt": str(srt),
        "method": "caption-by-caption alignment with original SRT time bounds",
        "context_padding_seconds": padding,
        "captions": aligned_captions,
    }

    json_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    token_count = 0
    zero_duration_count = 0

    with report_path.open("w", encoding="utf-8") as report:
        for caption in aligned_captions:
            heading = (
                f"\nCAPTION {caption['index']} "
                f"(SRT: {caption['original_start']:.3f}-"
                f"{caption['original_end']:.3f})\n"
                f"{caption['text']}\n"
            )
            report.write(heading)
            print(heading.rstrip())

            for token in caption["tokens"]:
                line = (
                    f"{fmt_time(token['start'])}\t"
                    f"{fmt_time(token['end'])}\t"
                    f"{token['text']}\n"
                )
                report.write(line)
                print(line.rstrip())

                token_count += 1
                if token["zero_duration"]:
                    zero_duration_count += 1

    print(f"\nOriginal captions: {len(captions)}")
    print(f"Aligned captions: {len(aligned_captions)}")
    print(f"Aligned tokens: {token_count}")
    print(f"Zero-duration tokens: {zero_duration_count}")
    print(f"Alignment JSON: {json_path}")
    print(f"Alignment report: {report_path}")


if __name__ == "__main__":
    main()
