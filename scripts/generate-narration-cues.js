#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { sameTeam } = require("./team-resolver");

const matchPath = process.argv[2];
const outputPath = process.argv[3];

if (!matchPath) {
  console.error("Usage: node scripts/generate-narration-cues.js matches/MATCH.json [output.json]");
  process.exit(1);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(?<=[\p{Script=Myanmar}\p{M}])\s+(?=[\p{Script=Myanmar}\p{M}])/gu, "");
}

function parseSrt(content) {
  const blocks = content.replace(/^\uFEFF/, "").split(/\r?\n\s*\r?\n/);
  const captions = [];

  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    const timeIndex = lines.findIndex(line => line.includes("-->"));
    if (timeIndex < 0) continue;

    const match = lines[timeIndex].match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    );
    if (!match) continue;

    const seconds = (h, m, s, ms) =>
      Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;

    const text = lines.slice(timeIndex + 1).join(" ")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    captions.push({
      start: seconds(...match.slice(1, 5)),
      end: seconds(...match.slice(5, 9)),
      text,
    });
  }

  return captions;
}

function findSubtitle(match) {
  const candidates = [
    match.subtitleFile,
    match.subtitleFile && path.join("public", match.subtitleFile.replace(/^public\//, "")),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(`SRT file not found: ${match.subtitleFile || "(subtitleFile missing)"}`);
}

function teamForPlayer(player, match) {
  if (sameTeam(player.team, match.homeTeam)) return "home";
  if (sameTeam(player.team, match.awayTeam)) return "away";
  return null;
}

function findPlayerMentions(captions, registry, match, diagnostics) {
  const cues = [];
  const players = Object.entries(registry.players || {});
  const seen = new Set();

  for (let i = 0; i < captions.length; i++) {
    const currentText = normalize(captions[i].text);
    const joined = normalize(
      captions.slice(i, Math.min(i + 3, captions.length))
        .map(c => c.text)
        .join(" ")
    );

    for (const [id, player] of players) {
      const team = teamForPlayer(player, match);
      if (!team || !player.name) continue;

      const name = normalize(player.name);
      const firstNamePart = name.split(" ")[0];

      // Anchor the cue to the caption where the player's name begins.
      if (!name || !currentText.split(" ").includes(firstNamePart)) continue;
      if (!(` ${joined} `).includes(` ${name} `)) continue;

      const key = `${team}:${name}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const matches = players.filter(([, candidate]) =>
        teamForPlayer(candidate, match) === team &&
        normalize(candidate.name) === name
      );

      const uniqueImages = [...new Set(matches.map(([, candidate]) => candidate.image).filter(Boolean))];

      if (matches.length > 1 && uniqueImages.length !== 1) {
        diagnostics.push({
          type: "ambiguous-player",
          name: player.name,
          team,
          entries: matches.map(([entryId]) => entryId),
        });
        continue;
      }

      const selected = matches.find(([, candidate]) => candidate.image);
      if (!selected) {
        diagnostics.push({ type: "missing-player-image", name: player.name, team });
        continue;
      }

      const [selectedId, selectedPlayer] = selected;
      const relativeImage = String(selectedPlayer.image).replace(/\\/g, "/");
      const image = relativeImage.startsWith("assets/")
        ? relativeImage
        : `assets/${relativeImage.replace(/^public\//, "")}`;

      const diskPath = path.join("public", image);
      if (!fs.existsSync(diskPath)) {
        diagnostics.push({
          type: "missing-player-asset",
          name: player.name,
          team,
          image: diskPath,
        });
        continue;
      }

      cues.push({
        captionIndex: i + 1,
        kind: "player",
        team,
        name: selectedPlayer.name,
        image,
        role: selectedPlayer.role || "",
        offsetSeconds: 0,
      });

      console.log(`PLAYER: ${selectedPlayer.name} (${team}) [${selectedId}]`);
    }
  }

  return cues;
}

const TACTICAL_RULES = [
  {
    type: "wing-overload",
    patterns: [/wing overload/, /wide overload/, /တောင်ပံ.*အရေအတွက်/, /တောင်ပံ.*တိုက်စစ်/],
    subtitle: "Create wide numbers • combine on the flank",
  },
  {
    type: "high-press",
    patterns: [/high press/, /high pressing/, /ဖိအားမြင့်/, /အမြင့်ပိုင်း.*ဖိအား/],
    subtitle: "Press high • close passing lanes",
  },
  {
    type: "low-block",
    patterns: [/low block/, /compact defensive block/, /ခံစစ်.*ကျစ်ကျစ်လျစ်လျစ်/, /ခံစစ်.*ပိတ်ဆို့/],
    subtitle: "Stay compact • protect central space",
  },
  {
    type: "counter",
    patterns: [/counter attack/, /counter attacking/, /တန်ပြန်တိုက်စစ်/],
    subtitle: "Win possession • attack open space",
  },
  {
    type: "midfield",
    patterns: [/midfield battle/, /ကွင်းလယ်တိုက်ပွဲ/, /ကွင်းလယ်.*အသာ/],
    subtitle: "Possession • pressure • transitions",
  },
  {
    type: "press",
    patterns: [/pressing/, /press/, /ဖိအားပေး/, /တိုက်စစ်ဖိအား/],
    subtitle: "Close passing lanes • force play wide",
  },
  {
    type: "attack",
    patterns: [/attacking pattern/, /တိုက်စစ်ပုံစံ/, /တိုက်စစ်.*အဓိက/],
    subtitle: "Create chances • exploit attacking space",
  },
];

function detectTactical(captions, match) {
  const cues = [];
  const seen = new Set();

  captions.forEach((caption, index) => {
    const text = normalize(caption.text);
    for (const rule of TACTICAL_RULES) {
      if (!rule.patterns.some(pattern => pattern.test(text))) continue;
      if (seen.has(rule.type)) break;
      seen.add(rule.type);

      cues.push({
        captionIndex: index + 1,
        kind: "tactical",
        type: rule.type,
        title: `${match.homeShort || "HOME"} vs ${match.awayShort || "AWAY"} · ${rule.type.toUpperCase().replace(/-/g, " ")}`,
        subtitle: rule.subtitle,
      });
      break;
    }
  });

  return cues;
}

function detectEndingCues(captions) {
  const cues = [];
  let predictionAdded = false;
  let outroAdded = false;

  captions.forEach((caption, index) => {
    const text = normalize(caption.text);

    if (!predictionAdded &&
      /(ခန့်မှန်းထား|ခန့်မှန်းချက်|prediction|predict)/i.test(text)) {
      cues.push({ captionIndex: index + 1, kind: "prediction" });
      predictionAdded = true;
    }

    if (!outroAdded &&
      /(comment|ကွန်မင့်|ဘယ်အသင်းနိုင်မယ်ထင်လဲ|ခန့်မှန်းပေးကြပါဦး|သင့်ရဲ့ခန့်မှန်းချက်)/i.test(text)) {
      cues.push({ captionIndex: index + 1, kind: "outro" });
      outroAdded = true;
    }
  });

  return cues;
}

try {
  const absoluteMatchPath = path.resolve(matchPath);
  const match = readJson(absoluteMatchPath);
  const registry = readJson(path.resolve("data/player-registry.json"));
  const subtitlePath = findSubtitle(match);
  const captions = parseSrt(fs.readFileSync(subtitlePath, "utf8"));

  if (!captions.length) throw new Error("No valid SRT captions found.");

  const diagnostics = [];
  const cues = [
    ...findPlayerMentions(captions, registry, match, diagnostics),
    ...detectTactical(captions, match),
    ...detectEndingCues(captions),
  ].sort((a, b) => a.captionIndex - b.captionIndex);

  const destination = outputPath
    ? path.resolve(outputPath)
    : absoluteMatchPath.replace(/\.json$/i, ".cues.json");

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(cues, null, 2)}\n`);

  console.log(`\nSRT: ${subtitlePath}`);
  console.log(`Captions: ${captions.length}`);
  console.log(`Generated cues: ${cues.length}`);
  console.log(`Output: ${destination}`);

  if (diagnostics.length) {
    console.log("\nPLAYER DIAGNOSTICS:");
    for (const item of diagnostics) console.log(JSON.stringify(item));
    throw new Error("Player diagnostics found. Fix missing or ambiguous player assets before rendering.");
  }
} catch (error) {
  console.error(`CUE GENERATION FAILED: ${error.message}`);
  process.exit(1);
}
