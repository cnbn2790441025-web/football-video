#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

cd "$HOME/football-preview"

if [ "$#" -ne 3 ]; then
  echo 'အသုံးပြုပုံ: ./scripts/new-match.sh YYYY-MM-DD "Home Team" "Away Team"'
  exit 1
fi

DATE="$1"
HOME_TEAM="$2"
AWAY_TEAM="$3"

if ! [[ "$DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "ERROR: Date ကို YYYY-MM-DD ပုံစံနဲ့ ထည့်ပါ။"
  exit 1
fi

MATCH_KEYS="$(node -e '
const { matchKeyVariants } = require("./scripts/team-resolver");
console.log(matchKeyVariants(process.argv[1], process.argv[2]).join("\n"));
' "$HOME_TEAM" "$AWAY_TEAM")"

mapfile -t MATCH_KEY_LIST <<< "$MATCH_KEYS"

find_asset() {
  local ext="$1"
  local candidate dir found

  for candidate in "${MATCH_KEY_LIST[@]}"; do
    for dir in "public/assets/$ext" public; do
      if [ -d "$dir" ]; then
        found="$(find "$dir" -maxdepth 1 -type f -iname "${candidate}.${ext}" -print -quit)"
        if [ -n "$found" ]; then
          printf '%s' "$found"
          return 0
        fi
      fi
    done
  done

  return 1
}

AUDIO="$(find_asset mp3 || true)"
SUBTITLE="$(find_asset srt || true)"

if [ -z "$AUDIO" ] || [ -z "$SUBTITLE" ]; then
  echo "ERROR: Audio MP3 သို့မဟုတ် Subtitle SRT ဖိုင် မတွေ့ပါ။"
  echo "ရှာဖွေထားသော match keys:"
  printf "  %s\n" "${MATCH_KEY_LIST[@]}"
  echo "MP3: ${AUDIO:-မတွေ့ပါ}"
  echo "SRT: ${SUBTITLE:-မတွေ့ပါ}"
  echo "JSON မဖန်တီးသေးပါ။"
  exit 1
fi

if [ -z "${FOOTBALL_DATA_API_KEY:-}" ] && [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [ -z "${FOOTBALL_DATA_API_KEY:-}" ]; then
  echo "ERROR: FOOTBALL_DATA_API_KEY မတွေ့ပါ။ .env ကိုစစ်ပါ။"
  exit 1
fi

node scripts/sync-player-registry.js
node scripts/sync-player-roles.js
NODE_OUTPUT="$(node scripts/create-match-json.js \
  "$DATE" "$HOME_TEAM" "$AWAY_TEAM" \
  "TBD" "$AUDIO" "$SUBTITLE")"

printf '%s\n' "$NODE_OUTPUT"

JSON_PATH="$(printf '%s\n' "$NODE_OUTPUT" |
  grep -oE 'matches/[^[:space:]]+\.json' |
  tail -n 1)"

if [ -z "$JSON_PATH" ] || [ ! -f "$JSON_PATH" ]; then
  echo "ERROR: ဖန်တီးထားသော JSON ဖိုင်ကို ရှာမတွေ့ပါ။"
  exit 1
fi

JSON_KEY="$(basename "$JSON_PATH" .json)"

echo
echo "Narration Cue များ ဖန်တီးနေပါသည်..."
node scripts/generate-narration-cues.js "$JSON_PATH"

CUE_PATH="matches/${JSON_KEY}.cues.json"
if [ ! -f "$CUE_PATH" ]; then
  echo "ERROR: Cue JSON မဖန်တီးနိုင်ပါ။"
  exit 1
fi

echo
echo "JSON နှင့် Cue JSON ဖန်တီးပြီးပါပြီ။ Stage အဆင့်ကို ဆက်လုပ်ပါမယ်။"
./scripts/stage-commit-match.sh "$JSON_KEY"
