import os
import re
import sys
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
            "start": start,
            "end": end,
            "text": text,
        })

    if not captions:
        raise ValueError("No valid captions found in SRT.")

    return captions


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/test-word-alignment.py MATCH_KEY")

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
    print(f"Captions loaded: {len(captions)}")
    print("Loading multilingual Whisper base model on CPU...")

    model = stable_whisper.load_model("base", device="cpu")

    print("Aligning each SRT caption within its original time range...")
    result = model.align_words(
        str(audio),
        captions,
        language="my",
        verbose=True,
    )

    json_path = output / f"{key}.alignment.json"
    result.save_as_json(str(json_path))

    report_path = output / f"{key}.alignment.txt"
    word_count = 0

    with report_path.open("w", encoding="utf-8") as report:
        for index, segment in enumerate(result.segments, 1):
            heading = (
                f"\nCAPTION {index}: "
                f"{segment.start:.3f} - {segment.end:.3f}\n"
            )
            report.write(heading)
            print(heading.rstrip())

            for word in getattr(segment, "words", []) or []:
                line = (
                    f"{word.start:.3f}\t{word.end:.3f}\t"
                    f"{word.word}\n"
                )
                report.write(line)
                print(line.rstrip())
                word_count += 1

    print(f"\nAligned segments: {len(result.segments)}")
    print(f"Aligned words/tokens: {word_count}")
    print(f"Alignment JSON: {json_path}")
    print(f"Alignment report: {report_path}")


if __name__ == "__main__":
    main()
