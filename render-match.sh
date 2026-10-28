#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo 'အသုံးပြုပုံ: ./render-match.sh "manchester-united-chelsea"'
    exit 1
fi

MATCH_KEY="$1"
WORKFLOW="render.yml"
BRANCH="main"

echo "Match Key: $MATCH_KEY"

echo "GitHub Actions ကို စတင်နေပါပြီ..."
gh workflow run "$WORKFLOW" --ref "$BRANCH" \
  -f match_key="$MATCH_KEY"

RUN_ID=""
for i in $(seq 1 30); do
    LATEST_RUN_ID=$(gh run list --workflow "$WORKFLOW" --branch "$BRANCH" --event workflow_dispatch --limit 10 --json databaseId --jq '.[0].databaseId // empty')
    if [ -n "$LATEST_RUN_ID" ]; then
        RUN_ID="$LATEST_RUN_ID"
        break
    fi
    sleep 2
done

if [ -z "$RUN_ID" ]; then
    echo "Run ID အသစ် မတွေ့ပါ။ GitHub Actions ကို စစ်ကြည့်ပါ။"
    exit 1
fi

echo "Run ID: $RUN_ID"
gh run watch "$RUN_ID" --exit-status

OUT_DIR="$HOME/storage/downloads/football-preview-$MATCH_KEY-run-$RUN_ID"
mkdir -p "$OUT_DIR"
gh run download "$RUN_ID" --name Football-Preview-Videos --dir "$OUT_DIR"

echo "ပြီးပါပြီ။ Download ဖိုင်များ:"
ls -lh "$OUT_DIR"
