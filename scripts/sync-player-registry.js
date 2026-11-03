const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const REGISTRY_FILE = path.join(ROOT, "data/player-registry.json");
const PLAYERS_DIR = path.join(ROOT, "public/assets/players");

const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf8"));
registry.players ||= {};
registry.teamDefaults ||= {};

const files = fs.readdirSync(PLAYERS_DIR)
  .filter(file => /\.(png|jpe?g|webp)$/i.test(file))
  .sort();

const discovered = new Map();
let added = 0;
let unchanged = 0;

function titleCase(value) {
  return value.split("-").filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

for (const file of files) {
  const base = path.basename(file, path.extname(file));
  const match = base.match(/^(.+)__([a-z0-9-]+)$/i);
  if (!match) continue;

  const [, playerSlug, teamSlug] = match;
  const playerId = `${playerSlug}__${teamSlug}`;
  const image = `players/${file}`;

  const existing = registry.players[playerId];

  if (existing) {
    if (existing.image !== image) {
      existing.image = image;
    }
    unchanged++;
  } else {
    registry.players[playerId] = {
      name: titleCase(playerSlug),
      team: teamSlug,
      image
    };
    added++;
    console.log(`ADDED: ${playerId}`);
  }

  if (!discovered.has(teamSlug)) discovered.set(teamSlug, []);
  discovered.get(teamSlug).push(playerId);
}

for (const [team, ids] of discovered) {
  if (!registry.teamDefaults[team] && ids.length === 1) {
    registry.teamDefaults[team] = ids[0];
    console.log(`DEFAULT: ${team} → ${ids[0]}`);
  }
}

fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2) + "\n");

console.log("\nPlayer Registry Sync");
console.log("New players:", added);
console.log("Existing players:", unchanged);
console.log("Teams discovered:", discovered.size);
console.log("Registry updated:", path.relative(ROOT, REGISTRY_FILE));
