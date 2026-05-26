#!/bin/bash
# Generate the full JAP Senior Care Services photo library via Higgsfield CLI.
# Uses nano_banana_2 (Nano Banana Pro) for editorial photo quality.
# All images share the same Master Style Block for a unified look.
#
# Cost: ~58 credits (29 × 2). Time: ~25-40 minutes sequential.

set -u

OUT_DIR="prototype/assets/img/generated"
mkdir -p "$OUT_DIR"

# ── MASTER STYLE BLOCK ────────────────────────────────────────────────────
# Appended to every image. Defines the unified visual treatment.
STYLE='Editorial senior-care photography in the visual language of Cereal Magazine, Kinfolk, and Aesop campaigns. Shot on medium-format film at f/2.5, late golden-hour soft window light, generous negative space, restrained composition with rule-of-thirds framing. Color grade: warm ivory midtones, cool navy-tinted shadows echoing #2D5A91 brand color, muted dusty brass accents, never saturated. Subtle 35mm film grain. Dignified, calm, unposed — never stock-photo smiling, never patronizing, never clinical. No medical equipment, no hospital, no clinical setting. American Southern home setting, warm wood tones, soft natural textiles. Magazine editorial quality.'

# ── PROMPTS ────────────────────────────────────────────────────────────────
# Format: key|aspect_ratio|specific subject (style block auto-appended)

declare -a IMGS=(
  "heroPorch|16:9|An African American man in his late 70s with silver hair and a neatly trimmed beard, seated calmly in a cane rocking chair on a wide white-painted Southern porch in late afternoon. Wearing a soft chambray shirt and worn khakis. Hands relaxed on his lap. Pale-green ferns on the porch. Out of focus magnolia trees in the background. Negative space on the right for headline text overlay."
  "holdingHands|4:3|Two pairs of hands resting on a quilted lap — a weathered older womans hands clasped lightly over a young womans hands, both at peace, generations meeting. Soft natural light. Detail of a hand-quilted ivory and navy patterned throw. Tight composition, no faces visible, intimate."
  "walkingGarden|4:3|A senior African American woman walking arm in arm with a younger caregiver in a sunlit Southern garden. They are mid-conversation, gentle smiles. Late afternoon light filtering through magnolia and dogwood trees. Soft focus background of green leaves and dappled sunlight. The senior wears a cream linen dress, the caregiver wears navy scrubs."
  "morning|4:3|An Asian American woman in her early 80s wearing a soft oatmeal cotton robe, standing at a sunlit antique wooden dresser arranging a small bouquet of garden flowers in a ceramic vase. Calm morning routine. Warm window light from the left. A silver hand mirror and folded linen handkerchief on the dresser."
  "welcomeHome|4:3|A senior Latina woman and her adult daughter unpacking a cardboard moving box in a warmly-lit bedroom. Soft afternoon light. The daughter is placing a framed sepia family photograph on a bedside table. A pale ivory chenille bedspread. Folded sweaters in a stack. Calm, intimate moment of settling in."
  "upAtEm|4:3|A spa-like cottage bathroom interior. Soft cream towels stacked on a vintage wooden bench. A clawfoot tub with brass fixtures. A small dish of pressed flowers on the windowsill. Morning light from a frosted window. No people visible. Spa-quality but lived-in, dignified, restrained."
  "sweetDreams|4:3|A senior African American man in a charcoal cardigan settling into a worn leather club chair in a softly-lit bedroom for the evening. A warm brass bedside lamp glows. He is reading the spine of a book in his hands. A folded ivory throw on the chair arm. Calm, end-of-day mood."
  "discharge|4:3|A senior white-haired woman being gently assisted into the passenger seat of an SUV by a young male caregiver in navy scrubs. A folded blue-and-ivory quilted travel blanket on her lap. Late afternoon light. Hospital is implied off-frame — but the scene is just the homecoming moment, warm and reassuring."
  "roomBoard|4:3|A cozy senior bedroom interior. Ivory-painted walls. A vintage wooden rocking chair with a hand-quilted navy-and-cream throw draped over the back. A small antique writing desk by the window. Soft afternoon light. A small vase of fresh garden flowers. No people visible. Lived-in, dignified."
  "consult|4:3|A registered nurse — African American woman in her 40s, wearing navy scrubs — and an older white woman family member sitting at a worn kitchen table reviewing a written care plan on a clipboard. Two cups of tea between them. Warm afternoon light from a kitchen window. Mid-conversation, focused but warm."
  "groceryMeal|4:3|A young Latina caregiver and an older white woman preparing a home-cooked meal together at a sunlit kitchen counter. The senior is slicing herbs with a worn paring knife while the caregiver stirs a pot. Linen apron, copper pot, garden tomatoes on the counter. Mid-task, generations cooking together."
  "custom|4:3|Still life: a handwritten cursive note on cream paper sitting next to a steaming cup of tea in a vintage stoneware mug, on a worn wooden kitchen table. A small wildflower in a glass jar. Soft window light from the upper-left. No people. The note is partially visible — gentle, personal, intimate."
  "storyPreview|4:3|A senior white-haired womans weathered hands gently holding her Latina granddaughters younger hands across an old wooden kitchen table. Sepia warmth in the grade. Close-crop, no faces visible. A faint outline of a framed family photograph in the soft-focus background. Intimate, intergenerational."
  "aboutHero|16:9|A multiracial three-generation family gathered on a wide white-painted Southern front porch at golden hour. Grandmother seated on a porch swing, mother and father standing, two young children on the steps. Everyone in soft natural linen and cotton clothes — ivory, oatmeal, faded navy. Warm wide-angle composition. Negative space on the right for a headline."
  "dedicationPortrait|4:3|A close-up still life of a weathered older womans hand resting on an open hand-written family album on an old wooden table. Soft window light from the side. A vintage silver locket nearby. Sepia warmth. Memorial mood — reverent, quiet, intimate. No face visible."
  "careersHero|16:9|A young white-woman caregiver and an older African American man are laughing together at a sunlit kitchen window over morning coffee. Both holding worn stoneware mugs. Genuine candid laughter, mid-conversation. Late morning side-light. The kitchen has warm wood cabinets and an ivory tea kettle. Negative space on the right for a headline."
  "contactPorch|16:9|A Southern white-painted front porch swing with a navy-and-ivory tartan throw and a worn leather book resting on the cushion. A small side table with a steaming mug. Late afternoon golden light. Out-of-focus magnolia trees beyond the porch railing. No people. Inviting and calm. Negative space on the right."
  "teamA|3:4|Portrait of an African American woman caregiver in her 40s with short natural hair, wearing soft navy scrubs over an ivory shirt. Three-quarter portrait, soft window light from the left, looking at the camera with quiet confidence — not smiling broadly, just at ease. Hand-quilted ivory background, restrained, magazine-portrait quality."
  "teamB|3:4|Portrait of a white woman caregiver in her 50s with shoulder-length silver-streaked brown hair, wearing a soft navy cardigan over an ivory blouse. Three-quarter portrait, soft window light from the left. Calm presence, warm eyes, a faint genuine smile. Hand-quilted ivory background."
  "teamC|3:4|Portrait of a Latino man caregiver in his 30s with short dark hair and a neatly trimmed beard, wearing soft navy scrubs. Three-quarter portrait, soft window light from the right. Steady, kind expression. Hand-quilted ivory background."
  "teamD|3:4|Portrait of the on-staff Registered Nurse — a white woman in her 50s with chin-length silver hair, wearing a crisp ivory blouse with a small enamel RN pin. Three-quarter portrait, soft window light from the left. Authoritative but warm, slight smile. Hand-quilted ivory background."
  "stepConsult|4:3|Still life: a worn vintage telephone handset and a pen resting on a kitchen table next to a steaming mug of tea and a paper notepad with handwriting visible. Soft morning window light. No people. The mood of a calm phone consultation."
  "stepAssess|4:3|A caregiver in navy scrubs walking slowly through a sun-filled living room with an older senior woman in a cream cardigan. The caregiver is glancing at the doorway and floor for any safety considerations, holding a small notebook. Warm morning light, generous space, restrained composition."
  "stepPlan|4:3|Still life: a handwritten care plan document on cream paper resting on a worn wooden kitchen table next to a brass fountain pen and a small cup of tea. A folded pair of reading glasses nearby. Soft morning light. No people visible. The look of a written plan, ready for review."
  "stepOngoing|4:3|An older white-haired woman and her African American caregiver are seated in cane garden chairs in a sunlit Southern garden, laughing together over an iced tea. Mid-conversation. Late afternoon light through magnolia trees. Genuine joy, easy connection."
  "family1|4:3|A multigenerational Asian American family hugging in a warm sunlit kitchen — grandmother in the center, daughter and son-in-law on either side, young child wrapped around grandmothers waist. Soft natural linen and cotton clothes. Late afternoon window light. Genuine, candid, intergenerational warmth."
  "family2|4:3|An older African American woman in a knit oatmeal cardigan reading a worn hardcover book in a vintage leather armchair, soft natural window light spilling over her shoulder. Out-of-focus living room background with warm wood paneling and a small vase of garden flowers. Calm, contemplative."
  "family3|4:3|A senior Latina woman in a soft cream linen dress walking through a sunlit Southern garden with her young granddaughter who is reaching up to hold her hand. Late afternoon golden light through magnolia trees. Both moving away from the camera, three-quarter view. Warm intergenerational moment."
)

# ── GENERATE ──────────────────────────────────────────────────────────────
total=${#IMGS[@]}
count=0
for entry in "${IMGS[@]}"; do
  count=$((count + 1))
  IFS='|' read -r key ratio subj <<< "$entry"

  if [ -f "$OUT_DIR/$key.png" ]; then
    echo "[$count/$total] $key — already exists, skipping"
    continue
  fi

  echo "[$count/$total] Generating $key ($ratio)..."

  url=$(higgsfield generate create nano_banana_2 \
    --aspect_ratio "$ratio" \
    --resolution 2k \
    --wait \
    --prompt "$subj $STYLE" 2>&1 | tail -1)

  if [[ "$url" =~ ^https?:// ]]; then
    curl -s -o "$OUT_DIR/$key.png" "$url"
    size=$(stat -c%s "$OUT_DIR/$key.png" 2>/dev/null || stat -f%z "$OUT_DIR/$key.png" 2>/dev/null)
    echo "  ✓ saved ($size bytes)"
  else
    echo "  ✗ FAILED: $url"
  fi
done

echo ""
echo "DONE. $(ls -1 $OUT_DIR/*.png 2>/dev/null | wc -l) images in $OUT_DIR/"
