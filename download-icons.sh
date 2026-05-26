#!/bin/bash
# Download Lottie JSONs straight from animatedicons.co's Firebase CDN.

set -u
OUT_DIR="prototype/assets/icons"
mkdir -p "$OUT_DIR"

BASE="https://firebasestorage.googleapis.com/v0/b/animatedicons-d158d.appspot.com/o/minimalistic"

# Map of: local-filename | slug (URL path component; %20 for spaces)
declare -a ICONS=(
  # Service cards (9 — mapped to the 9 programs)
  "sun|Sun"
  "home|home"
  "towel|Towel"
  "moon|Moon"
  "car|Car"
  "hotel|Hotel"
  "consultation|Consultation"
  "tea|Tea"
  "heart|Heart"
  # How It Works steps (4)
  "phone|phone"
  "mission|Mission"
  "checklist|checklist"
  "time|time"
  # Trust strip / by-the-numbers (4)
  "calendar|calendar"
  "certificate|Certificate"
  "community|Community"
  "support|Support"
  # Contact / CTAs (4)
  "mail|mail"
  "location|location"
  "contact|contact"
  "chat|Chat%20V2"
  # Why-us / values (4)
  "team|Team"
  "shield|Shield"
  "lightbulb|lightbulb"
  "star|Star"
)

ok=0; fail=0
for entry in "${ICONS[@]}"; do
  IFS='|' read -r name slug <<< "$entry"
  url="${BASE}%2F${slug}.json?alt=media"
  out="$OUT_DIR/$name.json"

  if [ -f "$out" ] && [ "$(stat -c%s "$out" 2>/dev/null || stat -f%z "$out")" -gt 1000 ]; then
    echo "[skip] $name"
    continue
  fi

  code=$(curl -sL -o "$out" -w "%{http_code}" -A "Mozilla/5.0" "$url")
  size=$(stat -c%s "$out" 2>/dev/null || stat -f%z "$out")
  if [ "$code" = "200" ] && [ "$size" -gt 1000 ]; then
    # Sanity: must contain Lottie root keys.
    if grep -q '"layers"' "$out" 2>/dev/null; then
      echo "  ✓ $name ($((size / 1024)) KB)"
      ok=$((ok + 1))
    else
      echo "  ? $name — JSON saved but no layers key"
      fail=$((fail + 1))
    fi
  else
    echo "  ✗ $name — HTTP $code, ${size} bytes"
    rm -f "$out"
    fail=$((fail + 1))
  fi
done

echo ""
echo "DONE. $ok ok / $fail failed."
