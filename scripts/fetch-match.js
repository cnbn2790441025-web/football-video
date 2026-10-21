const fs = require("node:fs");
const path = require("node:path");

function normalizeTeam(name = "") {
  return name
    .toLowerCase()
    .replace(/\b(afc|fc)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function shortName(name = "") {
  const key = normalizeTeam(name);

  const names = {
    "manchester united": "MAN UTD",
    "manchester city": "MAN CITY",
    "leeds united": "LEEDS",
    "afc bournemouth": "BOURNEMOUTH",
    "bournemouth": "BOURNEMOUTH",
    "arsenal": "ARSENAL",
    "chelsea": "CHELSEA",
    "liverpool": "LIVERPOOL",
    "tottenham hotspur": "TOTTENHAM",
    "newcastle united": "NEWCASTLE",
    "aston villa": "ASTON VILLA",
    "brighton hove albion": "BRIGHTON",
    "west ham united": "WEST HAM",
    "nottingham forest": "N FOREST",
    "crystal palace": "PALACE",
    "everton": "EVERTON",
    "fulham": "FULHAM",
    "brentford": "BRENTFORD",
    "sunderland": "SUNDERLAND",
    "wolverhampton wanderers": "WOLVES",
    "burnley": "BURNLEY"
  };

  return names[key] || name.toUpperCase();
}

function teamAssets(name = "") {
  const key = normalizeTeam(name);
  const map = {
    "manchester united": {
      logo: "assets/logos/manutd.png",
      player: "assets/players/bruno.png",
      playerName: "Bruno Fernandes",
      playerRole: "CAPTAIN / PLAYMAKER",
      playerTrait: "VISION / PASSING"
    },
    "leeds united": {
      logo: "assets/logos/leeds.png",
      player: "assets/players/leeds-player-2.png",
      playerName: "Brenden Aaronson",
      playerRole: "ATTACKING MIDFIELDER",
      playerTrait: "ENERGY / PRESSING"
    },
    "arsenal": {
      logo: "assets/logos/arsenal.png",
      player: "assets/players/saka.png",
      playerName: "Bukayo Saka",
      playerRole: "WINGER",
      playerTrait: "PACE / CREATIVITY"
    },
    "chelsea": {
      logo: "assets/logos/chelsea.png",
      player: null,
      playerName: null,
      playerRole: null,
      playerTrait: null
    },
    "liverpool": {
      logo: "assets/logos/liverpool.png",
      player: "assets/players/virgil.png",
      playerName: "Virgil van Dijk",
      playerRole: "CAPTAIN / DEFENDER",
      playerTrait: "LEADERSHIP / DEFENSIVE STRENGTH"
    },
    "brighton hove albion": {
      logo: "assets/logos/brighton.png",
      player: "assets/players/grob.png",
      playerName: "Pascal Groß",
      playerRole: "MIDFIELDER / PLAYMAKER",
      playerTrait: "VISION / PASSING"
    }
  };

  const assets = map[key] || {};
  const existing = (asset) =>
    asset && fs.existsSync(path.join(__dirname, "..", "public", asset))
      ? asset
      : null;

  return {
    logo: existing(assets.logo),
    player: existing(assets.player),
    playerName: assets.playerName || null,
    playerRole: assets.playerRole || null,
    playerTrait: assets.playerTrait || null
  };
}

async function main() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error("FOOTBALL_DATA_API_KEY မတွေ့ပါ။ GitHub Secrets ကို စစ်ပါ။");
  }

  const date = process.env.MATCH_DATE || "2026-10-18";
  const homeWanted = normalizeTeam(process.env.HOME_TEAM || "Manchester United");
  const awayWanted = normalizeTeam(process.env.AWAY_TEAM || "Leeds United");

  if (!homeWanted || !awayWanted) {
    throw new Error("HOME_TEAM နဲ့ AWAY_TEAM ကို ထည့်ပေးပါ။");
  }

  const url = new URL("https://api.football-data.org/v4/competitions/PL/matches");
  url.searchParams.set("dateFrom", date);
  url.searchParams.set("dateTo", date);

  const response = await fetch(url, {
    headers: { "X-Auth-Token": apiKey }
  });

  if (!response.ok) {
    throw new Error(`Football Data API error: HTTP ${response.status}`);
  }

  const data = await response.json();

  const match = (data.matches || []).find((item) => {
    const home = normalizeTeam(item.homeTeam.name);
    const away = normalizeTeam(item.awayTeam.name);

    return home === homeWanted && away === awayWanted;
  });

  if (!match) {
    const available = (data.matches || [])
      .map((item) => `${item.homeTeam.name} vs ${item.awayTeam.name}`)
      .join("\n");

    throw new Error(
      `ရွေးထားတဲ့ပွဲကို ${date} မှာ မတွေ့ပါ။\n` +
      `ရွေးထားသည်: ${process.env.HOME_TEAM || "Manchester United"} vs ${process.env.AWAY_TEAM || "Leeds United"}\n` +
      `အဲဒီရက်မှာ ရရှိတဲ့ပွဲများ:\n${available || "(ပွဲဒေတာ မရှိပါ)"}`
    );
  }

  const dateTime = new Date(match.utcDate);
  const format = (timeZone, options) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      ...options
    }).format(dateTime);

  const homeAssets = teamAssets(match.homeTeam.name);
  const awayAssets = teamAssets(match.awayTeam.name);

  const result = {
    homeLogo: homeAssets.logo,
    awayLogo: awayAssets.logo,
    homePlayer: homeAssets.player,
    awayPlayer: awayAssets.player,
    homePlayerName: homeAssets.playerName,
    awayPlayerName: awayAssets.playerName,
    homePlayerRole: homeAssets.playerRole,
    awayPlayerRole: awayAssets.playerRole,
    homePlayerTrait: homeAssets.playerTrait,
    awayPlayerTrait: awayAssets.playerTrait,
    homeTeam: match.homeTeam.name,
    awayTeam: match.awayTeam.name,
    homeShort: shortName(match.homeTeam.name),
    awayShort: shortName(match.awayTeam.name),
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
    stadium: match.venue || "Stadium TBC"
  };

  const isLiverpoolBrighton =
    homeWanted === "liverpool" &&
    awayWanted === "brighton hove albion";
  const outputFile = isLiverpoolBrighton
    ? "liverpoolBrightonData.json"
    : "matchData.json";
  const outputPath = path.join(__dirname, "..", "src", outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n");

  console.log("Fixture data ရယူပြီးပါပြီ။");
  console.log(`${result.homeShort} vs ${result.awayShort}`);
  console.log(`UK: ${result.kickoffUK} | Myanmar: ${result.kickoffMyanmar}`);
  console.log(`Status: ${result.status}`);
  console.log("Output: src/matchData.json");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
