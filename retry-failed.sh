#!/bin/bash
# Retry the 4 failed images with slightly reworded prompts.
set -u

OUT_DIR="prototype/assets/img/generated"
STYLE='Editorial senior-care photography in the visual language of Cereal Magazine, Kinfolk, and Aesop campaigns. Shot on medium-format film at f/2.5, late golden-hour soft window light, generous negative space, restrained composition. Color grade: warm ivory midtones, cool navy-tinted shadows echoing #2D5A91, muted dusty brass accents, never saturated. Subtle 35mm film grain. Dignified, calm, unposed. American Southern home setting, warm wood tones, soft natural textiles. Magazine editorial quality.'

declare -a RETRY=(
  "walkingGarden|4:3|A senior woman in a cream linen dress walking arm in arm with a younger companion through a sunlit Southern garden. They are mid-conversation. Late afternoon light filtering through magnolia trees. Soft focus background of green leaves and dappled sunlight."
  "roomBoard|4:3|A cozy senior bedroom interior. Ivory-painted walls. A vintage wooden rocking chair with a hand-quilted navy-and-cream throw draped over the back. An antique writing desk by the window. Soft afternoon light. A small vase of garden flowers on the desk. Empty room, lived-in, dignified."
  "contactPorch|16:9|A Southern white-painted front porch with a swing and a navy-and-ivory tartan throw and a worn leather book on the cushion. A side table with a steaming mug. Late afternoon golden light. Out-of-focus magnolia trees beyond the porch railing. Empty porch, inviting, calm. Negative space on the right for headline text."
  "teamC|3:4|Portrait of a Latino man caregiver in his mid 30s with short dark hair, wearing soft navy scrubs. Three-quarter portrait, soft window light from the right. Calm, kind expression. Hand-quilted ivory backdrop."
)

for entry in "${RETRY[@]}"; do
  IFS='|' read -r key ratio subj <<< "$entry"
  if [ -f "$OUT_DIR/$key.png" ]; then
    echo "$key — already exists, skipping"
    continue
  fi
  echo "Retrying $key ($ratio)..."
  url=$(higgsfield generate create nano_banana_2 \
    --aspect_ratio "$ratio" \
    --resolution 2k \
    --wait \
    --prompt "$subj $STYLE" 2>&1 | tail -1)
  if [[ "$url" =~ ^https?:// ]]; then
    curl -s -o "$OUT_DIR/$key.png" "$url"
    echo "  ✓ saved"
  else
    echo "  ✗ FAILED again: $url"
  fi
done

echo "DONE. $(ls -1 $OUT_DIR/*.png 2>/dev/null | wc -l) images total"
