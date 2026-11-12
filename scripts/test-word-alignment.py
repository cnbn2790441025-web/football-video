import json
import re
import subprocess
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

        text_lines = lines[timing_index + 1:]
        text_parts = []

        for line in text_lines:
            if text_parts:
                previous = text_parts[-1][-1]
                current = line[0]

                previous_is_myanmar = (
                    "\u1000" <= previous <= "\u109f"
                    and previous not in "\u104a\u104b"
                )
                current_is_myanmar = (
                    "\u1000" <= current <= "\u109f"
                    and current not in "\u104a\u104b"
                )

                separator = (
                    "" if previous_is_myanmar and current_is_myanmar
                    else " "
                )
                text_parts.append(separator)

            text_parts.append(line)

        text = "".join(text_parts).strip()
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

    syllable_pattern = re.compile(
        r"[\u1000-\u1021](?:\u1039[\u1000-\u1021])?"
        r"[\u103B-\u103E]*[\u102B-\u1032\u1036]*"
        r"(?:[\u1000-\u1021](?:\u103A[\u1037\u1038]*|[\u1037\u1038]+\u103A?))?"
        r"[\u103A\u1037\u1038]*"
        r"|[\u1021-\u102A][\u102B-\u1032\u1036]*[\u103A\u1037\u1038]*"
    )

    combined_text = ""
    caption_spans = []

    for caption in captions:
        current = caption["text"].strip()
        if not current:
            continue

        if combined_text:
            previous_char = combined_text[-1]
            current_char = current[0]

            previous_is_myanmar = "\u1000" <= previous_char <= "\u109f"
            current_is_myanmar = "\u1000" <= current_char <= "\u109f"

            if current_char in "။၊!?.,:;":
                separator = ""
            elif previous_char in "။၊!?.,:;":
                separator = " "
            elif previous_is_myanmar and current_is_myanmar:
                separator = ""
            else:
                separator = " "

            combined_text += separator

        text_start = len(combined_text)
        combined_text += current

        caption_spans.append({
            "text_start": text_start,
            "text_end": len(combined_text),
            "start": float(caption["start"]),
            "end": float(caption["end"]),
        })

    duration_result = subprocess.run(
        [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(audio),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    audio_duration = float(duration_result.stdout.strip())

    def estimate_time(char_position):
        for span in caption_spans:
            if span["text_start"] <= char_position < span["text_end"]:
                text_length = max(
                    1, span["text_end"] - span["text_start"]
                )
                ratio = (
                    char_position - span["text_start"]
                ) / text_length
                ratio = max(0.0, min(1.0, ratio))

                return (
                    span["start"]
                    + ratio * (span["end"] - span["start"])
                )

        if char_position < caption_spans[0]["text_start"]:
            return caption_spans[0]["start"]

        return caption_spans[-1]["end"]

    units = []
    cursor = 0

    for match in syllable_pattern.finditer(combined_text):
        gap = combined_text[cursor:match.start()]

        for gap_match in re.finditer(r"\S+", gap):
            units.append({
                "text": gap_match.group(),
                "char_start": cursor + gap_match.start(),
                "char_end": cursor + gap_match.end(),
            })

        units.append({
            "text": match.group(),
            "char_start": match.start(),
            "char_end": match.end(),
        })

        cursor = match.end()

    remaining = combined_text[cursor:]

    for gap_match in re.finditer(r"\S+", remaining):
        units.append({
            "text": gap_match.group(),
            "char_start": cursor + gap_match.start(),
            "char_end": cursor + gap_match.end(),
        })

    if not units or not caption_spans:
        raise ValueError("No alignment text or caption timing information found.")

    for unit in units:
        unit["estimated_start"] = estimate_time(unit["char_start"])
        unit["estimated_end"] = estimate_time(
            max(unit["char_start"], unit["char_end"] - 1)
        )

    MAX_UNITS_PER_CHUNK = 65
    chunks = [
        units[offset:offset + MAX_UNITS_PER_CHUNK]
        for offset in range(0, len(units), MAX_UNITS_PER_CHUNK)
    ]

    # Use one shared boundary between adjacent chunks to prevent overlap.
    chunk_boundaries = [0.0]

    for index in range(len(chunks) - 1):
        previous_end = chunks[index][-1]["estimated_end"]
        next_start = chunks[index + 1][0]["estimated_start"]
        boundary = (previous_end + next_start) / 2

        boundary = max(
            chunk_boundaries[-1],
            min(audio_duration, boundary),
        )
        chunk_boundaries.append(boundary)

    chunk_boundaries.append(audio_duration)
    alignment_segments = []

    for index, chunk_units in enumerate(chunks):
        chunk_start = chunk_boundaries[index]
        chunk_end = chunk_boundaries[index + 1]

        if chunk_end <= chunk_start:
            raise ValueError(
                f"Invalid chunk timing for chunk {index + 1}: "
                f"{chunk_start:.3f}-{chunk_end:.3f}s"
            )

        chunk_text = " ".join(
            unit["text"] for unit in chunk_units
        )

        alignment_segments.append({
            "start": chunk_start,
            "end": chunk_end,
            "text": chunk_text,
        })

    print(f"Audio: {audio}")
    print(f"SRT: {srt}")
    print(f"Original captions: {len(captions)}")
    print(f"Alignment units: {len(units)}")
    print(f"Alignment chunks: {len(alignment_segments)}")

    for number, segment in enumerate(alignment_segments, start=1):
        segment["end"] = min(segment["end"], audio_duration)
        print(
            f"Chunk {number}: "
            f"{segment['start']:.2f}-{segment['end']:.2f}s, "
            f"{len(segment['text'].split())} units, "
            f"{len(segment['text'])} characters"
        )

    print(f"Audio duration: {audio_duration:.3f}s")
    print("Aligning the complete audio in grouped chunks...")

    result = model.align_words(
        str(audio),
        alignment_segments,
        language="my",
        verbose=False,
    )

    all_tokens = []

    for segment in getattr(result, "segments", []) or []:
        for word in getattr(segment, "words", []) or []:
            local_start = (
                float(word.start) if word.start is not None else None
            )
            local_end = (
                float(word.end) if word.end is not None else None
            )

            all_tokens.append({
                "text": word.word,
                "start": local_start,
                "end": local_end,
                "zero_duration": (
                    local_start is not None
                    and local_end is not None
                    and local_end <= local_start
                ),
            })

    grouped_tokens = {
        caption["index"]: [] for caption in captions
    }
    unassigned_tokens = 0

    for token in all_tokens:
        token_start = token["start"]
        token_end = token["end"]

        if token_start is None or token_end is None:
            unassigned_tokens += 1
            continue

        midpoint = (token_start + token_end) / 2

        matching_captions = [
            caption
            for caption in captions
            if caption["start"] <= midpoint <= caption["end"]
        ]

        if not matching_captions:
            unassigned_tokens += 1
            continue

        target_caption = min(
            matching_captions,
            key=lambda caption: caption["end"] - caption["start"],
        )

        grouped_tokens[target_caption["index"]].append(token)

    aligned_captions = []

    for caption in captions:
        tokens = grouped_tokens[caption["index"]]

        aligned_captions.append({
            "index": caption["index"],
            "original_start": caption["start"],
            "original_end": caption["end"],
            "text": caption["text"],
            "alignment_text": " ".join(
                token["text"] for token in tokens
            ),
            "tokens": tokens,
        })

    json_path = output / f"{key}.alignment.json"
    report_path = output / f"{key}.alignment.txt"

    payload = {
        "match_key": key,
        "audio": str(audio),
        "srt": str(srt),
        "method": "full-audio syllable alignment mapped to original SRT captions by token midpoint",
        "audio_duration_seconds": audio_duration,
        "unassigned_tokens": unassigned_tokens,
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
