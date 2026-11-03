require("dotenv").config({ quiet: true });

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const REGISTRY_FILE = path.join(ROOT, "data/player-registry.json");

const { normalize, sameTeam } = require("./team-resolver");

function roleFromPosition(position) {
  const key = normalize(position);

  const roles = {
    goalkeeper: "GOALKEEPER",
    defence: "DEFENDER",
    defender: "DEFENDER",
    midfield: "MIDFIELDER",
    midfielder: "MIDFIELDER",
    offence: "FORWARD",
    forward: "FORWARD",
    attacker: "FORWARD",
  };

  return roles[key] || "";
}

async function main() {
  const token = process.env.FOOTBALL_DATA_API_KEY;
  if (!token) throw new Error("FOOTBALL_DATA_API_KEY မတွေ့ပါ။");

  const registry = JSON.parse(
    fs.readFileSync(REGISTRY_FILE, "utf8")
  );

  const response = await fetch(
    "https://api.football-data.org/v4/competitions/PL/teams",
    { headers: { "X-Auth-Token": token } }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      `Football Data API HTTP ${response.status}: ${result.message || "Unknown error"}`
    );
  }

  const teams = result.teams || [];
  let updated = 0;
  let skipped = 0;
  let unmatched = 0;

  for (const [playerId, player] of Object.entries(registry.players)) {
    if (player.role && player.role.trim()) {
      skipped++;
      continue;
    }

    const team = teams.find(item => sameTeam(item.name, player.team));

    if (!team) {
      console.log(`TEAM NOT FOUND: ${player.name} (${player.team})`);
      unmatched++;
      continue;
    }

    const squad = team.squad || [];
    const targetName = normalize(player.name);

    const squadPlayer = squad.find(
      item => normalize(item.name) === targetName
    );

    if (!squadPlayer) {
      console.log(`PLAYER NOT FOUND: ${player.name} (${team.name})`);
      unmatched++;
      continue;
    }

    const role = roleFromPosition(squadPlayer.position);

    if (!role) {
      console.log(
        `POSITION UNKNOWN: ${player.name} (${squadPlayer.position || "missing"})`
      );
      unmatched++;
      continue;
    }

    player.role = role;
    console.log(`UPDATED: ${player.name} → ${role}`);
    updated++;
  }

  if (updated > 0) {
    fs.writeFileSync(
      REGISTRY_FILE,
      JSON.stringify(registry, null, 2) + "\n"
    );
  }

  console.log("\nRole Sync Summary");
  console.log("Updated:", updated);
  console.log("Already had role:", skipped);
  console.log("Not matched:", unmatched);
}

main().catch(error => {
  console.error("ERROR:", error.message);
  process.exitCode = 1;
});
