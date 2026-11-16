"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { sameTeam, assetSlug } = require("./team-resolver");

const ROOT = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

function apiGet(endpoint, apiKey) {
  const url = `https://api.football-data.org/v4/${endpoint}`;

  const output = execFileSync(
    "curl",
    [
      "-fsS",
      "--connect-timeout", "15",
      "--max-time", "40",
      "-H", `X-Auth-Token: ${apiKey}`,
      url
    ],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
  );

  return JSON.parse(output);
}

function resolveTeamId(teamName, teams) {
  const found = teams.find(team => sameTeam(team.name, teamName));
  return found ? found.id : null;
}

function makeTeamResults(teamName, teamId, matches) {
  if (!teamId) {
    return {
      teamName,
      available: false,
      count: 0,
      reason: "TEAM_NOT_RESOLVED",
      matches: []
    };
  }

  const finished = matches
    .filter(match =>
      match.status === "FINISHED" &&
      match.score &&
      match.score.fullTime &&
      Number.isFinite(match.score.fullTime.home) &&
      Number.isFinite(match.score.fullTime.away)
    )
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
    .slice(-5);

  if (finished.length < 5) {
    return {
      teamName,
      teamId,
      available: false,
      count: finished.length,
      reason: "FEWER_THAN_FIVE_COMPLETED_MATCHES",
      matches: []
    };
  }

  const results = finished.map(match => {
    const isHome = match.homeTeam.id === teamId;
    const selectedScore = isHome
      ? match.score.fullTime.home
      : match.score.fullTime.away;
    const opponentScore = isHome
      ? match.score.fullTime.away
      : match.score.fullTime.home;

    const result = selectedScore > opponentScore
      ? "W"
      : selectedScore < opponentScore
        ? "L"
        : "D";

    const opponent = isHome ? match.awayTeam : match.homeTeam;

    return {
      date: match.utcDate,
      opponentName: opponent.name,
      opponentId: opponent.id,
      opponentCrest: `assets/logos/${assetSlug(opponent.name)}.png`,
      selectedScore,
      opponentScore,
      result
    };
  });

  return {
    teamName,
    teamId,
    available: true,
    count: results.length,
    matches: results
  };
}

async function main() {
  const matchPath = process.argv[2];

  if (!matchPath) {
    throw new Error(
      "အသုံးပြုပုံ: node scripts/fetch-team-results.js matches/<match-key>.json"
    );
  }

  const absoluteMatchPath = path.resolve(ROOT, matchPath);
  if (!absoluteMatchPath.startsWith(ROOT + path.sep)) {
    throw new Error("Match JSON path မမှန်ပါ။");
  }

  if (!fs.existsSync(absoluteMatchPath)) {
    throw new Error(`Match JSON မတွေ့ပါ: ${matchPath}`);
  }

  loadEnv();

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error("FOOTBALL_DATA_API_KEY မတွေ့ပါ။");
  }

  const match = JSON.parse(fs.readFileSync(absoluteMatchPath, "utf8"));
  const homeName = match.homeTeam;
  const awayName = match.awayTeam;

  if (!homeName || !awayName) {
    throw new Error("Match JSON ထဲမှာ homeTeam / awayTeam မပြည့်စုံပါ။");
  }

  console.log("Premier League အသင်းစာရင်း ရယူနေပါသည်...");
  const teamData = apiGet("competitions/PL/teams", apiKey);
  const teams = teamData.teams || [];

  const homeId = match.homeTeamId || resolveTeamId(homeName, teams);
  const awayId = match.awayTeamId || resolveTeamId(awayName, teams);

  const homeMatches = homeId
    ? apiGet(`teams/${homeId}/matches?status=FINISHED&limit=20`, apiKey).matches || []
    : [];

  const awayMatches = awayId
    ? apiGet(`teams/${awayId}/matches?status=FINISHED&limit=20`, apiKey).matches || []
    : [];

  const output = {
    matchKey: path.basename(absoluteMatchPath, ".json"),
    fetchedAt: new Date().toISOString(),
    source: "football-data.org",
    home: makeTeamResults(homeName, homeId, homeMatches),
    away: makeTeamResults(awayName, awayId, awayMatches)
  };

  const outputPath = absoluteMatchPath.replace(/\.json$/, ".results.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

  console.log(`Results JSON: ${path.relative(ROOT, outputPath)}`);
  console.log(
    `Home: ${output.home.count}/5 ${output.home.available ? "READY" : "OMIT"}`
  );
  console.log(
    `Away: ${output.away.count}/5 ${output.away.available ? "READY" : "OMIT"}`
  );
}

main().catch(error => {
  console.error(`Results Fetcher error: ${error.message}`);
  process.exitCode = 1;
});
