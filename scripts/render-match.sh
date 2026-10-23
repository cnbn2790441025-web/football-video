#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

cd "$HOME/football-preview"

MATCH_KEY="${1:-}"

if [[ -z "$MATCH_KEY" ]]; then
  echo "အသုံးပြုပုံ: ./scripts/render-match.sh <match-key>"
  echo
  echo "လက်ရှိပွဲများ:"
  echo "  liverpool-brighton"
  echo "  manutd-bournemouth"
  exit 1
fi

if [[ ! "$MATCH_KEY" =~ ^[a-z0-9-]+$ ]]; then
  echo "Error: Match key ပုံစံမမှန်ပါ။"
  exit 1
fi

MATCH_FILE="matches/${MATCH_KEY}.json"

if [[ ! -f "$MATCH_FILE" ]]; then
  echo "Error: $MATCH_FILE မရှိပါ။"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: GitHub CLI (gh) မရှိပါ။"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI login မဝင်ရသေးပါ။ gh auth login နဲ့ ဝင်ပါ။"
  exit 1
fi

echo "Match Key: $MATCH_KEY"
echo "JSON: $MATCH_FILE"
echo

read -r -p "ဒီပွဲကို Render လုပ်မလား? (y/N): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "မလုပ်တော့ပါ။"
  exit 0
fi

gh workflow run render.yml --ref main \
  -f "match_key=$MATCH_KEY"

echo "GitHub Actions ကို စတင်လိုက်ပါပြီ။"
echo "Run အသစ် ပေါ်လာဖို့ ခဏစောင့်ပါ..."

sleep 8

RUN_ID="$(gh run list \
  --workflow render.yml \
  --branch main \
  --event workflow_dispatch \
  --limit 1 \
  --json databaseId \
  --jq '.[0].databaseId // empty')"

if [[ -z "$RUN_ID" ]]; then
  echo "Run ID မရသေးပါ။ GitHub Actions မှာ စစ်ဆေးပါ။"
  exit 1
fi

echo "Render Run ID: $RUN_ID"
gh run watch "$RUN_ID" --exit-status

echo
echo "Render အောင်မြင်ပါပြီ။"
echo "Run ID: $RUN_ID"
echo "Artifacts မှ MP4 ကို Download ဆွဲနိုင်ပါပြီ။"

gh run view "$RUN_ID" --web
