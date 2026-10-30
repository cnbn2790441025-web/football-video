const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const TEMPLATE_FILE = path.join(ROOT, "templates/match-template.json");
const MATCH_DIR = path.join(ROOT, "matches");

function normalize(name = "") {
  return name.toLowerCase()
    .replace(/\b(afc|fc)\b/g, "")
    .replace(/\band\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const aliases = {
  "brighton": "brighton hove albion",
  "brighton hove albion": "brighton hove albion",
  "man utd": "manchester united",
  "man united": "manchester united",
  "manchester united": "manchester united",
  "bournemouth": "bournemouth",
  "afc bournemouth": "bournemouth",
  "spurs": "tottenham hotspur",
  "tottenham": "tottenham hotspur",
  "west ham": "west ham united",
  "wolves": "wolverhampton wanderers",
  "palace": "crystal palace"
};

function canonical(name) {
  const n = normalize(name);
  return aliases[n] || n;
}

function slug(name) {
  const n = canonical(name);
  const slugs = {
    "manchester united": "manutd",
    "brighton hove albion": "brighton",
    "tottenham hotspur": "tottenham",
    "newcastle united": "newcastle",
    "west ham united": "west-ham",
    "nottingham forest": "nottingham-forest",
    "crystal palace": "crystal-palace",
    "wolverhampton wanderers": "wolves",
    "bournemouth": "bournemouth"
  };
  return slugs[n] || n.replace(/\s+/g, "-");
}

function existingAsset(relative) {
  if (!relative) return null;
  const full = path.join(ROOT, "public", "assets", relative);
  return fs.existsSync(full) && fs.statSync(full).isFile()
    ? `assets/${relative}`
    : null;
}

const teamMap = {
  "arsenal": {
    logo: "logos/arsenal.png",
    player: "players/saka.png",
    name: "Bukayo Saka",
    role: "WINGER / ATTACKER",
    trait: "DRIBBLING / CHANCE CREATION"
  },
  "everton": {
    logo: "logos/everton.png",
    player: "players/thierno.png",
    name: "Thierno Barry",
    role: "FORWARD",
    trait: "MOVEMENT / FINISHING"
  },
  "liverpool": {
    logo: "logos/liverpool.png",
    player: "players/virgil.png",
    name: "Virgil van Dijk",
    role: "CAPTAIN / DEFENDER",
    trait: "LEADERSHIP / DEFENSIVE STRENGTH"
  },
  "brighton hove albion": {
    logo: "logos/brighton.png",
    player: "players/grob.png",
    name: "Pascal Groß",
    role: "MIDFIELDER / PLAYMAKER",
    trait: "VISION / PASSING"
  },
  "manchester united": {
    logo: "logos/manutd.png",
    player: "players/bruno.png",
    name: "Bruno Fernandes",
    role: "CAPTAIN / PLAYMAKER",
    trait: "VISION / PASSING"
  },
  "chelsea": {
    logo: "logos/chelsea.png",
    player: "players/palmer.png",
    name: "Cole Palmer",
    role: "ATTACKING MIDFIELDER",
    trait: "CREATIVITY / FINISHING"
  },
  "bournemouth": {
    logo: "logos/bournemouth.png",
    player: "players/evanilson.png",
    name: "Evanilson",
    role: "FORWARD",
    trait: "MOVEMENT / FINISHING"
  },
  "leeds united": {
    logo: "logos/leeds.png",
    player: "players/leeds-player-2.png",
    name: "Brenden Aaronson",
    role: "ATTACKING MIDFIELDER",
    trait: "ENERGY / PRESSING"
  }
};

function findTeamAsset(directory, teamName) {
  const wanted = canonical(teamName);
  const dir = path.join(ROOT, "public", "assets", directory);

  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir)
    .filter(file => /\.png$/i.test(file))
    .sort();

  const match = files.find(file => {
    const base = path.basename(file, path.extname(file));
    return canonical(base) === wanted;
  });

  return match ? existingAsset(directory + "/" + match) : null;
}

function teamAssets(teamName) {
  const key = canonical(teamName);
  const entry = teamMap[key];

  const logo = (entry && existingAsset(entry.logo))
    || findTeamAsset("logos", teamName);

  const player = entry ? existingAsset(entry.player) : null;

  return {
    logo,
    player,
    name: entry && existingAsset(entry.player) ? entry.name : "",
    role: entry && existingAsset(entry.player) ? entry.role : "",
    trait: entry && existingAsset(entry.player) ? entry.trait : ""
  };
}

function findExistingMatch(home, away) {
  for (const file of fs.readdirSync(MATCH_DIR).filter(f => f.endsWith(".json"))) {
    try {
      const data = JSON.parse(
        fs.readFileSync(path.join(MATCH_DIR, file), "utf8")
      );
      if (
        canonical(data.homeTeam) === canonical(home) &&
        canonical(data.awayTeam) === canonical(away)
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
  const homeWanted = canonical(homeInput);
  const awayWanted = canonical(awayInput);

  const match = (result.matches || []).find(m =>
    canonical(m.homeTeam.name) === homeWanted &&
    canonical(m.awayTeam.name) === awayWanted
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
    homeShort: ({
        "arsenal": "ARS", "everton": "EVE", "liverpool": "LIV",
        "brighton hove albion": "BHA", "manchester united": "MUN",
        "bournemouth": "BOU", "leeds united": "LEE",
        "crystal palace": "CRY", "newcastle united": "NEW",
        "brentford": "BRE", "sunderland": "SUN", "hull city": "HUL",
        "chelsea": "CHE", "aston villa": "AVL", "fulham": "FUL",
        "ipswich town": "IPS", "nottingham forest": "NFO",
        "tottenham hotspur": "TOT", "west ham united": "WHU",
        "wolverhampton wanderers": "WOL", "coventry city": "COV"
      })[canonical(home)] || "",
    awayShort: ({
        "arsenal": "ARS", "everton": "EVE", "liverpool": "LIV",
        "brighton hove albion": "BHA", "manchester united": "MUN",
        "bournemouth": "BOU", "leeds united": "LEE",
        "crystal palace": "CRY", "newcastle united": "NEW",
        "brentford": "BRE", "sunderland": "SUN", "hull city": "HUL",
        "chelsea": "CHE", "aston villa": "AVL", "fulham": "FUL",
        "ipswich town": "IPS", "nottingham forest": "NFO",
        "tottenham hotspur": "TOT", "west ham united": "WHU",
        "wolverhampton wanderers": "WOL", "coventry city": "COV"
      })[canonical(away)] || "",
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

  const required = [
    ["homeLogo", data.homeLogo],
    ["awayLogo", data.awayLogo],
    ["audioFile", data.audioFile],
    ["subtitleFile", data.subtitleFile]
  ];

  const missing = [];
  console.log("\nAsset စစ်ဆေးချက်:");

  for (const [key, value] of required) {
    const full = value
      ? (value.startsWith("assets/")
          ? path.join(ROOT, "public", value)
          : path.join(ROOT, value))
      : "";
    const ok = Boolean(value) && fs.existsSync(full) && fs.statSync(full).isFile();
    console.log(`${ok ? "OK" : "MISSING"} ${key}: ${value || "(မရွေးရသေးပါ)"}`);
    if (!ok) missing.push(key);
  }

  if (!data.prediction) {
    missing.push("prediction");
    console.log("MISSING prediction: ကိုယ်တိုင်စစ်ဆေးပြီး ဖြည့်ရန်လိုပါသည်။");
  }

  if (missing.length) {
    throw new Error(
      `လိုအပ်ချက်မပြည့်စုံပါ (${missing.join(", ")}). JSON ဖိုင်အသစ် မရေးထားပါ။`
    );
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
