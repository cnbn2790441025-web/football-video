#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

cd "$HOME/football-preview"

if [ "$#" -ne 1 ]; then
  echo 'အသုံးပြုပုံ: ./scripts/stage-commit-match.sh match-key'
  echo 'ဥပမာ: ./scripts/stage-commit-match.sh manutd-bournemouth'
  exit 1
fi

MATCH_KEY="$1"
MATCH_FILE="matches/${MATCH_KEY}.json"

if [[ ! "$MATCH_KEY" =~ ^[a-z0-9-]+$ ]]; then
  echo "ERROR: Match key ပုံစံ မမှန်ပါ။"
  exit 1
fi

if [ ! -f "$MATCH_FILE" ]; then
  echo "ERROR: $MATCH_FILE မတွေ့ပါ။"
  exit 1
fi

BRANCH="$(git branch --show-current)"
if [ "$BRANCH" != "main" ]; then
  echo "ERROR: လက်ရှိ branch သည် main မဟုတ်ပါ: $BRANCH"
  exit 1
fi

if [ -n "$(git diff --cached --name-only)" ]; then
  echo "ERROR: Git မှာ staged files ရှိနေပါတယ်။ အရင်စစ်ဆေးပါ။"
  git diff --cached --name-only
  exit 1
fi

mapfile -t ASSETS < <(
  node - "$MATCH_FILE" <<'NODE'
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const found = new Set();

function scan(value) {
  if (typeof value === "string" && value.trim()) {
    if (/\.(png|jpe?g|webp|mp3|wav|srt)$/i.test(value)) {
      let p = value.replace(/\\/g, "/");
      if (p.startsWith("assets/")) p = `public/${p}`;
      found.add(p);
    }
  } else if (Array.isArray(value)) {
    value.forEach(scan);
  } else if (value && typeof value === "object") {
    Object.values(value).forEach(scan);
  }
}

scan(data);
for (const asset of [...found].sort()) console.log(asset);
NODE
)

FILES=("$MATCH_FILE")

add_existing_file() {
  local file="$1"
  [ -f "$file" ] || return 0
  FILES+=("$file")
}

for asset in "${ASSETS[@]}"; do
  if [[ "$asset" = /* || "$asset" == *".."* ]]; then
    echo "ERROR: မလုံခြုံသော asset path: $asset"
    exit 1
  fi

  if [ ! -f "$asset" ]; then
    echo "ERROR: Required asset မတွေ့ပါ: $asset"
    echo "Commit / Push / Render မလုပ်ပါ။"
    exit 1
  fi

  echo "OK asset: $asset"
  FILES+=("$asset")
done

# Player registry and only the approved automation files.
for file in \
  .github/workflows/render.yml \
  data/player-registry.json \
  templates/match-template.json \
  scripts/team-resolver.js \
  scripts/create-match-json.js \
  scripts/new-match.sh \
  scripts/stage-commit-match.sh \
  scripts/sync-player-registry.js \
  scripts/sync-player-roles.js
do
  add_existing_file "$file"
done

# Deduplicate and stage only existing, explicitly approved paths.
mapfile -t FILES < <(printf '%s\n' "${FILES[@]}" | awk '!seen[$0]++')

echo
echo "Stage လုပ်မည့် သက်ဆိုင်ရာဖိုင်များ:"
printf '  %s\n' "${FILES[@]}"

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo
  echo "DRY RUN: Stage / Commit / Push မလုပ်ပါ။"
  exit 0
fi

git add -- "${FILES[@]}"

echo
echo "Stage လုပ်ပြီးသောဖိုင်များ:"
git diff --cached --name-only

git commit -m "Add match: $MATCH_KEY"
git push origin main

echo "GitHub သို့ Push အောင်မြင်ပါပြီ။"

gh workflow run render.yml -f match_key="$MATCH_KEY"
echo "GitHub Actions Render ကို Dispatch လုပ်ပြီးပါပြီ။"
