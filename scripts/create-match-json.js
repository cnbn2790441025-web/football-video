const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const TEMPLATE_FILE = path.join(ROOT, "templates/match-template.json");
const MATCH_DIR = path.join(ROOT, "matches");
const REGISTRY_FILE = path.join(ROOT, "data/player-registry.json");

const { teamSlug, assetSlug, sameTeam } = require("./team-resolver");

function slug(name) {
  return teamSlug(name);
}

function requireFile(file, label) {
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    throw new Error(`${label} မတွေ့ပါ: ${file || "(မရွေးရသေးပါ)"}`);
  }
  return file;
}

function safeProjectFile(input, label, extension) {
  const value = (input || "").trim();

  if (!value) {
    throw new Error(`${label} path မထည့်ရသေးပါ။`);
  }

  const full = path.resolve(ROOT, value);
  const relative = path.relative(ROOT, full);

  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} path သည် project အပြင်ဘက်သို့ ရောက်နေပါသည်: ${value}`);
  }

  if (extension && path.extname(full).toLowerCase() !== extension) {
    throw new Error(`${label} ဖိုင် extension သည် ${extension} ဖြစ်ရပါမည်: ${value}`);
  }

  requireFile(full, label);
  return relative.split(path.sep).join("/");
}

function existingAsset(relative) {
  if (!relative) return null;

  const normalized = String(relative).replace(/\\/g, "/");
  const full = path.resolve(ROOT, "public", "assets", normalized);
  const base = path.resolve(ROOT, "public", "assets");
  const rel = path.relative(base, full);

  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
    return null;
  }

  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
    return null;
  }

  return `assets/${normalized}`;
}

function findTeamAsset(directory, teamName) {
  const dir = path.join(ROOT, "public", "assets", directory);
  if (!fs.existsSync(dir)) return null;

  const extensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
  const target = assetSlug(teamName);

  const files = fs.readdirSync(dir)
    .filter(file => extensions.has(path.extname(file).toLowerCase()))
    .sort();

  const matches = files.filter(file => {
    const base = path.basename(file, path.extname(file));
    return assetSlug(base) === target;
  });

  if (matches.length > 1) {
    throw new Error(
      `Logo ဖိုင်တူညီမှုများစွာ တွေ့ပါသည်: ${teamName} — ${matches.join(", ")}`
    );
  }

  return matches.length === 1
    ? existingAsset(`${directory}/${matches[0]}`)
    : null;
}

function findPlayerEntry(teamName, registry) {
  const players = registry.players || {};
  const defaults = registry.teamDefaults || {};

  const defaultId = Object.entries(defaults)
    .find(([teamKey]) => sameTeam(teamKey, teamName))?.[1];

  if (defaultId) {
    const entry = players[defaultId];

    if (!entry) {
      throw new Error(`Player registry default မတွေ့ပါ: ${defaultId}`);
    }

    if (!sameTeam(entry.team || "", teamName)) {
      throw new Error(`Player default Team မကိုက်ညီပါ: ${defaultId}`);
    }

    if (!entry.image || !existingAsset(entry.image)) {
      throw new Error(`Default Player ပုံမတွေ့ပါ: ${defaultId}`);
    }

    return { id: defaultId, ...entry };
  }

  const matches = Object.entries(players)
    .filter(([, entry]) => sameTeam(entry.team || "", teamName))
    .filter(([, entry]) => entry.image && existingAsset(entry.image))
    .sort(([a], [b]) => a.localeCompare(b));

  if (matches.length > 1) {
    throw new Error(
      `Player အများကြီးရှိပြီး teamDefaults မသတ်မှတ်ရသေးပါ: ${teamName} — ${matches.map(([id]) => id).join(", ")}`
    );
  }

  if (matches.length === 0) {
    throw new Error(`Player registry ထဲမှာ ${teamName} အတွက် Player မရှိပါ။`);
  }

  const [id, entry] = matches[0];
  return { id, ...entry };
}

function teamAssets(teamName, registry) {
  const logo = findTeamAsset("logos", teamName);
  const playerEntry = findPlayerEntry(teamName, registry);

  if (!logo) {
    throw new Error(`${teamName} အတွက် Logo မတွေ့ပါ။`);
  }

  return {
    logo,
    player: existingAsset(playerEntry.image),
    name: playerEntry.name || "",
    role: playerEntry.role || "",
    trait: playerEntry.trait || ""
  };
}

async function main() {
  const [
    date,
    homeInput,
    awayInput,
    predictionInput,
    audioInput,
    subtitleInput
  ] = process.argv.slice(2);

  if (!date || !homeInput || !awayInput) {
    throw new Error(
      'အသုံးပြုပုံ: node scripts/create-match-json.js YYYY-MM-DD "Home Team" "Away Team" "Prediction" "public/audio.mp3" "public/subtitles.srt"'
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("ပွဲရက်ကို YYYY-MM-DD ပုံစံနဲ့ ထည့်ပါ။");
  }

  const dateCheck = new Date(`${date}T00:00:00Z`);
  if (
    Number.isNaN(dateCheck.getTime()) ||
    dateCheck.toISOString().slice(0, 10) !== date
  ) {
    throw new Error("မှန်ကန်တဲ့ calendar date မဟုတ်ပါ။");
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error("FOOTBALL_DATA_API_KEY မတွေ့ပါ။");
  }

  requireFile(TEMPLATE_FILE, "Match template");
  requireFile(REGISTRY_FILE, "Player registry");

  if (!fs.existsSync(MATCH_DIR)) {
    throw new Error("matches folder မတွေ့ပါ။");
  }

  const audioFile = safeProjectFile(audioInput, "Narration MP3", ".mp3");
  const subtitleFile = safeProjectFile(subtitleInput, "Subtitle SRT", ".srt");

  const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf8"));
  const template = JSON.parse(fs.readFileSync(TEMPLATE_FILE, "utf8"));

  const url = new URL(
    "https://api.football-data.org/v4/competitions/PL/matches"
  );
  url.searchParams.set("dateFrom", date);
  url.searchParams.set("dateTo", date);

  const response = await fetch(url, {
    headers: { "X-Auth-Token": apiKey },
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Football Data API error: HTTP ${response.status} - ${errorBody.slice(0, 500)}`
    );
  }

  const result = await response.json();

  const match = (result.matches || []).find(m =>
    sameTeam(m.homeTeam.name, homeInput) &&
    sameTeam(m.awayTeam.name, awayInput)
  );

  if (!match) {
    const available = (result.matches || [])
      .map(m => `${m.homeTeam.name} vs ${m.awayTeam.name}`)
      .join("\n");

    throw new Error(
      `ပွဲမတွေ့ပါ: ${date} — ${homeInput} vs ${awayInput}\n` +
      `အဲဒီရက်မှာ ရနိုင်တဲ့ပွဲများ:\n${available || "(ပွဲမရှိပါ)"}`
    );
  }

  const home = match.homeTeam.name;
  const away = match.awayTeam.name;
  const outputFile = path.join(MATCH_DIR, `${slug(home)}-${slug(away)}.json`);

  if (fs.existsSync(outputFile)) {
    throw new Error(
      `JSON ဖိုင်ရှိပြီးသားဖြစ်လို့ overwrite မလုပ်ပါ: ${path.relative(ROOT, outputFile)}`
    );
  }

  const homeAssets = teamAssets(home, registry);
  const awayAssets = teamAssets(away, registry);

  const dt = new Date(match.utcDate);
  if (Number.isNaN(dt.getTime())) {
    throw new Error(`API မှ utcDate မမှန်ပါ: ${match.utcDate}`);
  }

  const format = (zone, options) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      ...options
    }).format(dt);

  const data = {
    ...template,
    homeTeam: home,
    awayTeam: away,
    homeShort: match.homeTeam.tla || "",
    awayShort: match.awayTeam.tla || "",
    matchDate: format("Europe/London", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }),
    matchDay: format("Europe/London", { weekday: "long" }),
    kickoffUK: format("Europe/London", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }),
    kickoffMyanmar: format("Asia/Yangon", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }),
    utcDate: match.utcDate,
    status: match.status,
    stadium: match.venue || "Stadium TBC",
    homeLogo: homeAssets.logo,
    awayLogo: awayAssets.logo,
    homePlayer: homeAssets.player,
    awayPlayer: awayAssets.player,
    homePlayerName: homeAssets.name,
    awayPlayerName: awayAssets.name,
    homePlayerRole: homeAssets.role,
    awayPlayerRole: awayAssets.role,
    homePlayerTrait: homeAssets.trait,
    awayPlayerTrait: awayAssets.trait,
    prediction: (predictionInput || "").trim(),
    audioFile,
    subtitleFile
  };

  const requiredAssets = [
    ["homeLogo", data.homeLogo],
    ["awayLogo", data.awayLogo],
    ["homePlayer", data.homePlayer],
    ["awayPlayer", data.awayPlayer],
    ["audioFile", data.audioFile],
    ["subtitleFile", data.subtitleFile]
  ];

  console.log("\nAsset စစ်ဆေးချက်:");

  for (const [key, value] of requiredAssets) {
    const full = key === "homeLogo" || key === "awayLogo" ||
      key === "homePlayer" || key === "awayPlayer"
      ? path.join(ROOT, "public", value)
      : path.join(ROOT, value);

    requireFile(full, key);
    console.log(`OK ${key}: ${value}`);
  }

  if (!data.prediction) {
    console.log("WARNING prediction: ကိုယ်တိုင်ဖြည့်ရန်လိုပါသည်။");
  }

  const tempFile = `${outputFile}.tmp`;
  try {
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2) + "\n", {
      flag: "wx"
    });
    fs.renameSync(tempFile, outputFile);
  } catch (error) {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    throw error;
  }

  console.log("\nJSON ဖန်တီးပြီးပါပြီ:", path.relative(ROOT, outputFile));
  console.log(`ပွဲ: ${home} vs ${away}`);
  console.log(`UK: ${data.kickoffUK} | Myanmar: ${data.kickoffMyanmar}`);
}

main().catch(err => {
  console.error("ERROR:", err.message);
  process.exitCode = 1;
});
