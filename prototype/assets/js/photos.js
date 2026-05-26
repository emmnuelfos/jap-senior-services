/* ============================================================
   J.A.P Senior Services — photos.js
   Curated Unsplash photo references with themed SVG fallback.
   ============================================================ */

(function () {
  const u = (id, w = 1600) =>
    `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

  // Warm-toned SVG placeholder (Higgsfield-prompt overlay)
  function placeholder(label, hue) {
    if (hue == null) hue = 32;
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>" +
        "<defs>" +
          "<linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
            "<stop offset='0' stop-color='hsl(" + hue + ",36%,64%)'/>" +
            "<stop offset='1' stop-color='hsl(" + (hue + 14) + ",30%,40%)'/>" +
          "</linearGradient>" +
          "<pattern id='s' width='10' height='10' patternUnits='userSpaceOnUse' patternTransform='rotate(35)'>" +
            "<line x1='0' y1='0' x2='0' y2='10' stroke='rgba(255,255,255,0.07)' stroke-width='4'/>" +
          "</pattern>" +
        "</defs>" +
        "<rect width='800' height='600' fill='url(%23g)'/>" +
        "<rect width='800' height='600' fill='url(%23s)'/>" +
        "<text x='40' y='540' fill='rgba(255,255,255,0.88)' font-family='ui-monospace,Menlo,monospace' font-size='15' letter-spacing='2'>" + label + "</text>" +
        "<text x='40' y='564' fill='rgba(255,255,255,0.55)' font-family='ui-monospace,Menlo,monospace' font-size='11' letter-spacing='2'>[ photo to be added ]</text>" +
      "</svg>";
    return "data:image/svg+xml;utf8," + svg.replace(/#/g, '%23').replace(/"/g, "'");
  }
  window.JAP_PLACEHOLDER = placeholder;

  // hue palette (warm tones): brass ~30, sage ~95, forest ~145, dusk ~18
  window.JAP_PHOTOS = {
    heroKitchen:        { src: u('1518709268805-4e9042af9f23', 1800), alt: 'Senior woman in soft golden hour light at a kitchen window, hands folded, editorial portrait', label: 'HERO · GOLDEN HOUR KITCHEN', hue: 28 },
    heroPorch:          { src: u('1576091160399-112ba8d25d1d', 1800), alt: 'Older woman seated on a porch in late afternoon light, calm, editorial', label: 'HERO · ALABAMA PORCH', hue: 32 },
    holdingHands:       { src: u('1559225179-a2683e2b3c3a', 1400),    alt: 'Two pairs of hands resting on a quilted lap, generations meeting', label: 'HANDS · INTERGENERATIONAL', hue: 24 },
    walkingGarden:      { src: u('1573497019940-1c28c88b4f3e', 1400), alt: 'Caregiver walking arm in arm with a senior in a sunlit garden', label: 'GARDEN · ARM IN ARM', hue: 95 },
    morning:            { src: u('1556909114-f6e7ad7d3136', 1200),    alt: 'Senior in a soft cotton robe at a sunlit dresser, calm morning routine', label: 'MORNING ROUTINE', hue: 36 },
    welcomeHome:        { src: u('1505691938895-1758d7feb511', 1200), alt: 'Boxes being unpacked into a warm bedroom, soft afternoon light', label: 'WELCOME HOME · UNPACKING', hue: 30 },
    upAtEm:             { src: u('1556910103-1c02745aae4d', 1200),    alt: 'Bathroom in a cottage with soft towels and a wooden bench', label: "UP AND AT 'EM · SHOWER", hue: 35 },
    sweetDreams:        { src: u('1521991745014-3a3a23a8df90', 1200), alt: 'Senior in a sweater settling in for the evening, warm bedside lamp light', label: 'SWEET DREAMS · BEDSIDE', hue: 22 },
    discharge:          { src: u('1571019613454-1cb2f99b2d8b', 1200), alt: 'Caregiver assisting a senior into a car with a quilted travel blanket', label: 'DISCHARGE · HOME TRANSITION', hue: 40 },
    roomBoard:          { src: u('1505691938895-1758d7feb511', 1200), alt: 'A cozy senior bedroom with sage walls and a wooden rocker', label: 'ROOM & BOARD · COTTAGE', hue: 92 },
    consult:            { src: u('1582213782179-e0d4d3cce33a', 1200), alt: 'A registered nurse and family member at a kitchen table reviewing a care plan', label: 'CONSULTATION · NURSE + FAMILY', hue: 140 },
    groceryMeal:        { src: u('1542010589005-d1eacc3918f2', 1200), alt: 'A caregiver and senior preparing a home-cooked meal together', label: 'GROCERY & MEAL', hue: 38 },
    custom:             { src: u('1469571486292-0ba58a3f068b', 1200), alt: 'A handwritten note next to a steaming cup of tea on a kitchen table', label: 'OTHER · CUSTOM CARE', hue: 30 },
    storyPreview:       { src: u('1542884748-2b87b36c6b90', 1400),    alt: 'A senior womans hands holding a younger womans hand, sepia warmth', label: 'OUR STORY · HANDS', hue: 26 },
    aboutHero:          { src: u('1500917293891-ef795e70e1f6', 1800), alt: 'Multigenerational family on an Alabama front porch at golden hour', label: 'ABOUT · FAMILY PORCH', hue: 32 },
    dedicationPortrait: { src: u('1559925393-8be0ec4767c8', 1400),    alt: 'A weathered hand on an old wooden table, soft window light, memorial portrait', label: 'IN HONOR OF ETHEL', hue: 24 },
    careersHero:        { src: u('1573496359142-b8d87734a5a2', 1800), alt: 'A caregiver and senior laughing together at a kitchen window', label: 'CAREERS · LAUGHTER', hue: 36 },
    contactPorch:       { src: u('1505691938895-1758d7feb511', 1600), alt: 'A Southern front porch swing with a tartan throw at golden hour', label: 'CONTACT · PORCH SWING', hue: 30 },
    teamA:              { src: u('1580489944761-15a19d654956',  800), alt: 'Portrait — placeholder for team member', label: 'TEAM · PORTRAIT A', hue: 28 },
    teamB:              { src: u('1559548331-f9cb98001426',     800), alt: 'Portrait — placeholder for team member', label: 'TEAM · PORTRAIT B', hue: 36 },
    teamC:              { src: u('1573497019418-b400bb3ab074',  800), alt: 'Portrait — placeholder for team member', label: 'TEAM · PORTRAIT C', hue: 30 },
    teamD:              { src: u('1551836022-d5d88e9218df',     800), alt: 'Portrait — placeholder for team member', label: 'TEAM · PORTRAIT D · RN', hue: 140 },
    stepConsult:        { src: u('1573497019940-1c28c88b4f3e', 1200), alt: 'A relaxed conversation over the phone, sunlit table', label: 'STEP 01 · CONSULT', hue: 32 },
    stepAssess:         { src: u('1583847268964-b28dc8f51f92', 1200), alt: 'Caregiver assessing a living room with a senior, warm morning light', label: 'STEP 02 · ASSESSMENT', hue: 35 },
    stepPlan:           { src: u('1554224155-6726b3ff858f',   1200),  alt: 'A written care plan on a kitchen table with a fountain pen', label: 'STEP 03 · CARE PLAN', hue: 28 },
    stepOngoing:        { src: u('1543285198-3af15c4592ce',   1200),  alt: 'A caregiver and senior laughing in a garden', label: 'STEP 04 · ONGOING', hue: 95 },
    family1:            { src: u('1542884748-2b87b36c6b90',   1200),  alt: 'A multigenerational family hugging in a kitchen', label: 'STORY · FAMILY KITCHEN', hue: 30 },
    family2:            { src: u('1576091160550-2173dba999ef', 1200), alt: 'A senior in a knit cardigan reading a book in soft window light', label: 'STORY · READING', hue: 32 },
    family3:            { src: u('1521543387-c30b69a96e36',   1200),  alt: 'A senior in a garden with her granddaughter, warm late afternoon', label: 'STORY · GARDEN', hue: 95 }
  };

  // Wire data-photo attributes. We ship with themed warm placeholders so the
  // prototype renders consistently for review. Real photography lives in the
  // `src` URLs and is loaded if available — set USE_REAL_PHOTOS=true to enable.
  const USE_REAL_PHOTOS = false;
  function setPhoto(img) {
    const key = img.getAttribute('data-photo');
    const p = window.JAP_PHOTOS[key];
    if (!p) return;
    img.alt = p.alt;
    if (USE_REAL_PHOTOS) {
      img.onerror = function () {
        img.onerror = null;
        img.src = placeholder(p.label, p.hue);
      };
      img.src = p.src;
    } else {
      img.src = placeholder(p.label, p.hue);
    }
  }
  function setAll() {
    document.querySelectorAll('img[data-photo]').forEach(setPhoto);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setAll);
  } else {
    setAll();
  }
  window.JAP_setPhoto = setPhoto;
})();
