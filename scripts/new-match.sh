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

slug() {
  printf '%s' "$1" |
    tr '[:upper:]' '[:lower:]' |
    sed -E 's/\bafc\b//g; s/\bfc\b//g; s/[^a-z0-9]+/-/g; s/^-|-$//g'
}

HOME_KEY="$(slug "$HOME_TEAM")"
AWAY_KEY="$(slug "$AWAY_TEAM")"

case "$HOME_KEY" in
  manchester-united|man-utd|man-united) HOME_KEY="manutd" ;;
esac
case "$AWAY_KEY" in
  manchester-united|man-utd|man-united) AWAY_KEY="manutd" ;;
esac

PAIR="${HOME_KEY}-${AWAY_KEY}"
COMPACT="${HOME_KEY}vs${AWAY_KEY}"

find_asset() {
  local ext="$1"
  local candidate
  local dir
  for candidate in "$PAIR" "$COMPACT"; do
    for dir in public public/assets/mp3 public/assets/srt; do
      local found=""
      if [ -d "$dir" ]; then
        found="$(find "$dir" -maxdepth 1 -type f \
          -iname "${candidate}.${ext}" -print -quit)"
      fi
      if [ -n "$found" ]; then
        printf '%s' "$found"
        return 0
      fi
    done
  done
  return 1
}

AUDIO="$(find_asset mp3 || true)"
SUBTITLE="$(find_asset srt || true)"

if [ -z "$AUDIO" ] || [ -z "$SUBTITLE" ]; then
  echo "အသံနဲ့ subtitle ဖိုင်ကို အလိုအလျောက် မတွေ့ပါ။"
  echo "ရှာဖွေထားသော match key: $PAIR / $COMPACT"
  echo "MP3: ${AUDIO:-မတွေ့ပါ}"
  echo "SRT: ${SUBTITLE:-မတွေ့ပါ}"
  echo "JSON မဖန်တီးထားပါ။"
  exit 1
fi

if [ -z "${FOOTBALL_DATA_API_KEY:-}" ] && [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

node scripts/create-match-json.js \
  "$DATE" "$HOME_TEAM" "$AWAY_TEAM" \
  "TBD" "$AUDIO" "$SUBTITLE"
