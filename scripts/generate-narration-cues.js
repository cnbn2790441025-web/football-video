#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { sameTeam, assetSlug } = require("./team-resolver");

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

function findPlayerMentions(captions, registry, match, diagnostics, playerNameMapping) {
  const cues = [];
  const players = Object.entries(registry.players || {});
  const mappingEntries = Array.isArray(playerNameMapping?.entries)
    ? playerNameMapping.entries : [];
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
      if (!name) continue;

      const mappingEntry = mappingEntries.find(entry =>
        entry?.source && normalize(entry.source) === name
      );
      const variants = [...new Set([
        name,
        normalize(mappingEntry?.target || ""),
        ...(Array.isArray(mappingEntry?.aliases) ? mappingEntry.aliases.map(normalize) : [])
      ].filter(Boolean))];

      // Match the English registry name, Myanmar target, or approved Myanmar aliases.
      // The match must begin inside this caption, even if the name continues into
      // the next two captions.
      const matchedVariant = variants.find(variant => {
        const isMyanmar = /\p{Script=Myanmar}/u.test(variant);

        if (isMyanmar) {
          // Ignore spaces for Myanmar aliases split across SRT captions.
          const compactVariant = variant.replace(/\s+/g, "");
          const compactJoined = joined.replace(/\s+/g, "");
          const compactCurrent = currentText.replace(/\s+/g, "");
          const position = compactJoined.indexOf(compactVariant);

          return position >= 0 && position < compactCurrent.length;
        }

        const position = joined.indexOf(variant);
        if (position < 0 || position >= currentText.length) return false;
        return (` ${joined} `).includes(` ${variant} `);
      });
      if (!matchedVariant) continue;

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
    patterns: [/wing overload/, /wide overload/, /overload on the wing/, /တောင်ပံ.*အရေအတွက်/, /တောင်ပံ.*တိုက်စစ်/, /ဘေးတောင်ပံ.*တိုက်စစ်/, /တောင်ပံကစား/],
    subtitle: "Create wide numbers • combine on the flank",
  },
  {
    type: "high-press",
    patterns: [/high press/, /high pressing/, /press high/, /ဖိအားမြင့်/, /အမြင့်ပိုင်း.*ဖိအား/, /ရှေ့တန်းက.*ဖိအား/, /ရှေ့ကနေ.*ဖိအား/],
    subtitle: "Press high • close passing lanes",
  },
  {
    type: "low-block",
    patterns: [/low block/, /compact defensive block/, /deep defensive block/, /ခံစစ်.*ကျစ်ကျစ်လျစ်လျစ်/, /ခံစစ်.*ပိတ်ဆို့/, /ခံစစ်တုံ့ပြန်မှု/, /ခံစစ်.*ပြန်လည်စုဖွဲ့/, /နိမ့်နိမ့်.*ခံစစ်/],
    subtitle: "Stay compact • protect central space",
  },
  {
    type: "counter",
    patterns: [/counter attack/, /counter attacking/, /quick transition/, /fast transition/, /တန်ပြန်တိုက်စစ်/, /အမြန်တန်ပြန်/, /တန်ပြန်တိုက်ခိုက်/, /အကူးအပြောင်း.*မြန်/],
    subtitle: "Win possession • attack open space",
  },
  {
    type: "midfield",
    patterns: [/midfield battle/, /midfield control/, /control the midfield/, /ကွင်းလယ်တိုက်ပွဲ/, /ကွင်းလယ်.*အသာ/, /ကွင်းလယ်.*ထိန်းချုပ်/, /ကွင်းလယ်.*စိုးမိုး/],
    subtitle: "Possession • pressure • transitions",
  },
  {
    type: "defensive-stability",
    patterns: [/defensive stability/i, /ခံစစ်ပိုင်း.*တည်ငြိမ်မှု/, /ခံစစ်.*တည်ငြိမ်မှု/, /ခံစစ်တည်ငြိမ်/],
    subtitle: "Stay organized • protect the defensive line",
  },
  {
    type: "ball-retention",
    patterns: [/ball retention/i, /retain possession/i, /keep possession/i, /ဘောလုံးထိန်းသိမ်းနိုင်မှု/, /ဘောလုံးထိန်း\s*သိမ်းနိုင်မှု/, /ဘောလုံးထိန်းသိမ်း/],
    subtitle: "Keep the ball • maintain controlled possession",
  },
  {
    type: "finishing",
    patterns: [/finishing/i, /clinical finishing/i, /ဂိုးဧရိယာအတွင်း\s*အဆုံးသတ်နိုင်မှု/, /အဆုံးသတ်နိုင်မှု/, /ဂိုးသွင်းအဆုံးသတ်/],
    subtitle: "Create the chance • finish the attack",
  },
  {
    type: "passing",
    patterns: [/passing lanes/i, /passing network/i, /ball distribution/i, /ဘောလုံး\s*ပေးပို့မှု/, /ပေးပို့မှု/],
    subtitle: "Find passing lanes • move the ball forward",
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
  const captionMap = [];
  let fullText = "";

  // Join normalized captions while retaining the caption index for every character.
  captions.forEach((caption, index) => {
    if (index > 0) {
      fullText += " ";
      captionMap.push(index);
    }

    const text = normalize(caption.text);
    fullText += text;
    for (let j = 0; j < text.length; j++) captionMap.push(index);
  });

  for (const rule of TACTICAL_RULES) {
    const firstMatch = rule.patterns
      .map(pattern => pattern.exec(fullText))
      .filter(Boolean)
      .sort((a, b) => a.index - b.index)[0];

    if (!firstMatch || seen.has(rule.type)) continue;

    const captionPosition = captionMap[firstMatch.index];
    if (captionPosition === undefined) continue;

    seen.add(rule.type);
    cues.push({
      captionIndex: captionPosition + 1,
      kind: "tactical",
      type: rule.type,
      title: `${match.homeShort || "HOME"} vs ${match.awayShort || "AWAY"} · ${rule.type.toUpperCase().replace(/-/g, " ")}`,
      subtitle: rule.subtitle,
    });
  }

  return cues.sort((a, b) => a.captionIndex - b.captionIndex);
}

function detectResults(captions, match, results, mapping, teamNameMapping) {
  const cues = [];
  if (!results) return cues;

  const recentFormPattern = /(နောက်ဆုံး(?:ငါး|၅|5|five)ပွဲ|last\s*(?:five|5))/i;
  const headToHeadPattern = /(ထိပ်တိုက်|တွေ့ဆုံမှု|head\s*to\s*head|h2h)/i;
  const entries = Array.isArray(teamNameMapping?.entries) ? teamNameMapping.entries : [];

  for (const side of ["home", "away"]) {
    const data = results[side];
    if (!data || data.available !== true || data.count !== 5 ||
        !Array.isArray(data.matches) || data.matches.length !== 5) {
      console.log("RESULTS OMITTED: " + side + " team does not have five complete matches");
      continue;
    }

    const ready = data.matches.every(item =>
      item.opponentName && Number.isFinite(item.selectedScore) &&
      Number.isFinite(item.opponentScore) && ["W", "D", "L"].includes(item.result)
    );
    if (!ready) {
      console.log("RESULTS OMITTED: " + side + " team match data incomplete");
      continue;
    }

    const teamName = side === "home" ? match.homeTeam : match.awayTeam;
    const shortName = side === "home" ? match.homeShort : match.awayShort;
    const entry = entries.find(item =>
      item?.source && [teamName, shortName].some(name => name && sameTeam(name, item.source))
    );
    const aliases = [entry?.target, ...(entry?.aliases || [])]
      .filter(Boolean).map(normalize);

    if (!aliases.length) {
      console.log("RESULTS NOT FOUND: " + side + " team mapping");
      continue;
    }

    let occurrence = null;
    for (let i = 0; i < captions.length; i++) {
      const text = captions[i].text;
      const phrase = recentFormPattern.exec(text);
      recentFormPattern.lastIndex = 0;
      if (!phrase) continue;

      const beforePhrase = normalize(text.slice(0, phrase.index));
      if (!aliases.some(alias => beforePhrase.includes(alias))) continue;

      const context = captions.slice(Math.max(0, i - 2), i + 1)
        .map(c => c.text).join(" ");
      if (headToHeadPattern.test(context)) continue;

      occurrence = {
        captionIndex: i + 1,
        startSeconds: captions[i].start,
        endSeconds: captions[i].end
      };
      break;
    }

    if (!occurrence) {
      console.log("RESULTS NOT FOUND: " + side + " team-specific recent-form mention");
      continue;
    }

    cues.push({
      captionIndex: occurrence.captionIndex,
      kind: "results",
      team: side,
      spokenTeamName: entry.target,
      startSeconds: occurrence.startSeconds,
      endSeconds: occurrence.endSeconds
    });
    console.log("RESULTS: " + teamName + " (" + side + ")");
  }

  return cues;
}
function detectEndingCues(captions) {
  const cues = [];
  let predictionAdded = false;

  captions.forEach((caption, index) => {
    const text = normalize(caption.text);

    if (!predictionAdded &&
      /(ခန့်မှန်းထား|ခန့်မှန်းချက်|ခန့်မှန်းရလဒ်|prediction|predict)/i.test(text)) {
      cues.push({ captionIndex: index + 1, kind: "prediction" });
      predictionAdded = true;
    }

  });

  return cues;
}

try {
  const absoluteMatchPath = path.resolve(matchPath);
  const match = readJson(absoluteMatchPath);
  const mappingPath = absoluteMatchPath.replace(/\.json$/i, ".mapping.json");
  const mapping = fs.existsSync(mappingPath) ? readJson(mappingPath) : null;
  const registry = readJson(path.resolve("data/player-registry.json"));
  const playerNameMappingPath = path.resolve("data/player-name-mapping.json");
  const playerNameMapping = fs.existsSync(playerNameMappingPath)
    ? readJson(playerNameMappingPath) : null;
  const teamNameMappingPath = path.resolve("data/team-name-mapping.json");
const teamNameMapping = fs.existsSync(teamNameMappingPath)
  ? readJson(teamNameMappingPath) : null;
const subtitlePath = findSubtitle(match);
  const captions = parseSrt(fs.readFileSync(subtitlePath, "utf8"));
    const resultsPath = absoluteMatchPath.replace(/\.json$/i, ".results.json");
    const results = fs.existsSync(resultsPath) ? readJson(resultsPath) : null;

  if (!captions.length) throw new Error("No valid SRT captions found.");

  const diagnostics = [];
  const generatedCues = [
    ...findPlayerMentions(captions, registry, match, diagnostics, playerNameMapping),
    ...detectTactical(captions, match),
    ...detectResults(captions, match, results, mapping, teamNameMapping),
    ...detectEndingCues(captions),
  ];

  const recentFormCaptionIndexes = new Set(
    generatedCues
      .filter(cue => cue.kind === "results")
      .map(cue => cue.captionIndex)
  );

  const cues = generatedCues
    .filter(cue =>
      cue.kind !== "tactical" || !recentFormCaptionIndexes.has(cue.captionIndex)
    )
    .sort((a, b) => a.captionIndex - b.captionIndex);

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
