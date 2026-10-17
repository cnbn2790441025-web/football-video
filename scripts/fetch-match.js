const fs = require("node:fs");
const path = require("node:path");

async function main() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    throw new Error("FOOTBALL_DATA_API_KEY မတွေ့ပါ။ .env ကို စစ်ဆေးပါ။");
  }

  const date = process.env.MATCH_DATE || "2026-10-18";
  const url = new URL("https://api.football-data.org/v4/competitions/PL/matches");
  url.searchParams.set("dateFrom", date);
  url.searchParams.set("dateTo", date);

  const response = await fetch(url, {
    headers: { "X-Auth-Token": apiKey },
  });

  if (!response.ok) {
    throw new Error(`Football Data API error: HTTP ${response.status}`);
  }

  const data = await response.json();

  const match = data.matches.find((item) => {
    const teams = [
      item.homeTeam.name,
      item.awayTeam.name,
    ].join(" ").toLowerCase();

    return teams.includes("leeds") && teams.includes("manchester united");
  });

  if (!match) {
    throw new Error(`${date} မှာ Leeds vs Manchester United ပွဲကို မတွေ့ပါ။`);
  }

  const dateTime = new Date(match.utcDate);

  const format = (timeZone, options) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      ...options,
    }).format(dateTime);

  const result = {
    homeTeam: match.homeTeam.name,
    awayTeam: match.awayTeam.name,
    homeShort: "LEEDS",
    awayShort: "MAN UTD",
    matchDate: format("Europe/London", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    matchDay: format("Europe/London", { weekday: "long" }),
    kickoffUK: format("Europe/London", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    kickoffMyanmar: format("Asia/Yangon", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    utcDate: match.utcDate,
    status: match.status,
    stadium: "Elland Road",
  };

  const outputPath = path.join(__dirname, "..", "src", "matchData.json");

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
