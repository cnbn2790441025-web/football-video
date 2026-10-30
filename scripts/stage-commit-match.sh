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
  if (typeof value === "string") {
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
for (const path of [...found].sort()) console.log(path);
NODE
)

FILES=("$MATCH_FILE")

for asset in "${ASSETS[@]}"; do
  if [[ "$asset" = /* || "$asset" == *".."* ]]; then
    echo "ERROR: မလုံခြုံသော asset path: $asset"
    exit 1
  fi

  if [ ! -f "$asset" ]; then
    echo "ERROR: Asset မတွေ့ပါ: $asset"
    exit 1
  fi

  FILES+=("$asset")
done

echo "စစ်ဆေးပြီးသော ဖိုင်များ:"
printf '  %s\n' "${FILES[@]}"

read -r -p "ဒီဖိုင်များကိုသာ Stage လုပ်မလား? (y/N): " answer
if [[ ! "$answer" =~ ^[Yy]$ ]]; then
  echo "မလုပ်တော့ပါ။"
  exit 0
fi

git add -- "${FILES[@]}"

echo
echo "Stage လုပ်ပြီးသောဖိုင်များ:"
git diff --cached --name-only

read -r -p "Commit လုပ်မလား? (y/N): " answer
if [[ ! "$answer" =~ ^[Yy]$ ]]; then
  git restore --staged -- "${FILES[@]}"
  echo "Stage ကို ပြန်ဖြုတ်ပြီးပါပြီ။"
  exit 0
fi

git commit -m "Add match: $MATCH_KEY"
