const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const TEMPLATE_FILE = path.join(ROOT, "templates/match-template.json");
const MATCH_DIR = path.join(ROOT, "matches");
const REGISTRY_FILE = path.join(ROOT, "data/player-registry.json");
const playerRegistry = JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf8"));

const { teamSlug, assetSlug, sameTeam } = require("./team-resolver");

function slug(name) {
  return teamSlug(name);
}

function existingAsset(relative) {
  if (!relative) return null;
  const full = path.join(ROOT, "public", "assets", relative);
  return fs.existsSync(full) && fs.statSync(full).isFile()
    ? `assets/${relative}`
    : null;
}

function findTeamAsset(directory, teamName) {
  const dir = path.join(ROOT, "public", "assets", directory);
  if (!fs.existsSync(dir)) return null;

  const extensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
  const target = assetSlug(teamName);
  const files = fs.readdirSync(dir)
    .filter(file => extensions.has(path.extname(file).toLowerCase()))
    .sort();

  const match = files.find(file => {
    const base = path.basename(file, path.extname(file));
    return assetSlug(base) === target;
  });

  return match ? existingAsset(`${directory}/${match}`) : null;
}


function findPlayerEntry(teamName) {
  const players = playerRegistry.players || {};
  const defaults = playerRegistry.teamDefaults || {};

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

  if (matches.length === 0) return null;
  const [id, entry] = matches[0];
  return { id, ...entry };
}

function teamAssets(teamName) {
  const logo = findTeamAsset("logos", teamName);
  const playerEntry = findPlayerEntry(teamName);

  return {
    logo,
    player: playerEntry ? existingAsset(playerEntry.image) : null,
    name: playerEntry?.name || "",
    role: playerEntry?.role || "",
    trait: playerEntry?.trait || ""
  };
}

function findExistingMatch(home, away) {
  for (const file of fs.readdirSync(MATCH_DIR).filter(f => f.endsWith(".json"))) {
    try {
      const data = JSON.parse(
        fs.readFileSync(path.join(MATCH_DIR, file), "utf8")
      );
      if (
        sameTeam(data.homeTeam, home) &&
        sameTeam(data.awayTeam, away)
      ) return data;
    } catch {}
  }
  return null;
}

function existingPublicFile(file) {
  return file && fs.existsSync(path.join(ROOT, file)) &&
    fs.statSync(path.join(ROOT, file)).isFile()
    ? file : "";
}

async function main() {
  const [date, homeInput, awayInput, predictionInput, audioInput, subtitleInput] = process.argv.slice(2);

  if (!date || !homeInput || !awayInput) {
    throw new Error(
      'အသုံးပြုပုံ: node scripts/create-match-json.js YYYY-MM-DD "Home Team" "Away Team" "Prediction" "public/audio.mp3" "public/subtitles.srt"'
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw new Error("ပွဲရက်ကို YYYY-MM-DD ပုံစံနဲ့ ထည့်ပါ။");
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error("FOOTBALL_DATA_API_KEY မတွေ့ပါ။");
  }

  if (!fs.existsSync(TEMPLATE_FILE)) {
    throw new Error("templates/match-template.json မတွေ့ပါ။");
  }

  const url = new URL(
    "https://api.football-data.org/v4/competitions/PL/matches"
  );
  url.searchParams.set("dateFrom", date);
  url.searchParams.set("dateTo", date);

  const response = await fetch(url, {
    headers: { "X-Auth-Token": apiKey }
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
    throw new Error(`JSON ဖိုင်ရှိပြီးသားဖြစ်လို့ overwrite မလုပ်ပါ: ${path.relative(ROOT, outputFile)}`);
  }

  const template = JSON.parse(fs.readFileSync(TEMPLATE_FILE, "utf8"));
  const homeAssets = teamAssets(home);
  const awayAssets = teamAssets(away);
  const oldMatch = null; // Do not reuse assets from an older fixture.
  const dt = new Date(match.utcDate);

  const format = (zone, options) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: zone, ...options
    }).format(dt);

  // Audio/subtitles must be supplied explicitly for this fixture.
  const audioFile = (audioInput || "").trim();
  const subtitleFile = (subtitleInput || "").trim();

  const data = {
    ...template,
    homeTeam: home,
    awayTeam: away,
    homeShort: match.homeTeam.tla || "",
    awayShort: match.awayTeam.tla || "",
    matchDate: format("Europe/London", {
      day: "2-digit", month: "long", year: "numeric"
    }),
    matchDay: format("Europe/London", { weekday: "long" }),
    kickoffUK: format("Europe/London", {
      hour: "2-digit", minute: "2-digit", hour12: false
    }),
    kickoffMyanmar: format("Asia/Yangon", {
      hour: "2-digit", minute: "2-digit", hour12: false
    }),
    utcDate: match.utcDate,
    status: match.status,
    stadium: match.venue || "Stadium TBC",
    homeLogo: homeAssets.logo || "",
    awayLogo: awayAssets.logo || "",
    homePlayer: homeAssets.player || "",
    awayPlayer: awayAssets.player || "",
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

  const optionalAssets = [
    ["homeLogo", data.homeLogo],
    ["awayLogo", data.awayLogo],
    ["homePlayer", data.homePlayer],
    ["awayPlayer", data.awayPlayer],
    ["audioFile", data.audioFile],
    ["subtitleFile", data.subtitleFile]
  ];

  console.log("\nAsset စစ်ဆေးချက်:");
  for (const [key, value] of optionalAssets) {
    const full = value
      ? (value.startsWith("assets/")
          ? path.join(ROOT, "public", value)
          : path.join(ROOT, value))
      : "";
    const ok = Boolean(value) && fs.existsSync(full) && fs.statSync(full).isFile();
    console.log(`${ok ? "OK" : "MISSING"} ${key}: ${value || "(မရွေးရသေးပါ)"}`);
    if (!ok) data[key] = "";
  }

  if (!data.prediction) {
    console.log("WARNING prediction: ကိုယ်တိုင်ဖြည့်ရန်လိုပါသည်။");
  }

  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2) + "\n");
  console.log("JSON ဖန်တီးပြီးပါပြီ:", path.relative(ROOT, outputFile));
  console.log(`ပွဲ: ${home} vs ${away}`);
  console.log(`UK: ${data.kickoffUK} | Myanmar: ${data.kickoffMyanmar}`);
}

main().catch(err => {
  console.error("ERROR:", err.message);
  process.exitCode = 1;
});
