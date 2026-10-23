import fs from "node:fs";

const [input, output] = process.argv.slice(2);

if (!input || !output) {
  console.error("Usage: node scripts/srt-to-json.mjs input.srt output.json");
  process.exit(1);
}

const content = fs.readFileSync(input, "utf8").replace(/^\uFEFF/, "");

const blocks = content
  .trim()
  .split(/\r?\n\s*\r?\n/)
  .map((block) => {
    const lines = block.split(/\r?\n/);
    const timeLine = lines.find((line) => line.includes("-->"));

    if (!timeLine) return null;

    const match = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    );

    if (!match) return null;

    const seconds = (h, m, s, ms) =>
      Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;

    const text = lines
      .slice(lines.indexOf(timeLine) + 1)
      .join(" ")
      .replace(/<[^>]*>/g, "")
      .trim();

    if (!text) return null;

    return {
      start: seconds(...match.slice(1, 5)),
      end: seconds(...match.slice(5, 9)),
      text,
    };
  })
  .filter(Boolean);

if (blocks.length === 0) {
  console.error(`No valid subtitle blocks found in ${input}`);
  process.exit(1);
}

fs.writeFileSync(output, JSON.stringify(blocks, null, 2) + "\n");
console.log(`Converted ${blocks.length} subtitle blocks: ${output}`);
