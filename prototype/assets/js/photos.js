/* ============================================================
   J.A.P Senior Services — photos.js
   Curated Unsplash photo references with themed SVG fallback.
   ============================================================ */

(function () {
  // Local Higgsfield-generated photography (WebP). All images share the same
  // unified editorial style block, color-graded to echo the JAP Navy
  // (#2D5A91) brand color in the shadows.
  const local = (key) => `assets/img/generated/${key}.webp`;
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
    heroKitchen:        { src: local('heroKitchen'),        alt: 'Senior woman in soft golden-hour light at a kitchen window, hands resting on a worn wooden counter, editorial portrait', label: 'HERO · GOLDEN HOUR KITCHEN', hue: 28 },
    heroPorch:          { src: local('heroPorch'),          alt: 'Older African American man in a cane rocking chair on a Southern white-painted porch, late afternoon light', label: 'HERO · ALABAMA PORCH', hue: 32 },
    holdingHands:       { src: local('holdingHands'),       alt: 'Two pairs of hands resting on a hand-quilted navy-and-cream throw, generations meeting', label: 'HANDS · INTERGENERATIONAL', hue: 24 },
    walkingGarden:      { src: local('walkingGarden'),      alt: 'Senior and a younger companion walking arm in arm through a sunlit Southern garden', label: 'GARDEN · ARM IN ARM', hue: 30 },
    morning:            { src: local('morning'),            alt: 'Senior in a soft cotton robe arranging garden flowers at a sunlit antique dresser', label: 'MORNING ROUTINE', hue: 36 },
    welcomeHome:        { src: local('welcomeHome'),        alt: 'Senior and her adult daughter unpacking a moving box into a warmly-lit bedroom', label: 'WELCOME HOME · UNPACKING', hue: 30 },
    upAtEm:             { src: local('upAtEm'),             alt: 'Spa-quality cottage bathroom with soft cream towels, clawfoot tub and brass fixtures', label: "UP AND AT 'EM · BATH", hue: 35 },
    sweetDreams:        { src: local('sweetDreams'),        alt: 'Senior in a charcoal cardigan settling into a leather club chair with a book by a warm bedside lamp', label: 'SWEET DREAMS · BEDSIDE', hue: 22 },
    discharge:          { src: local('discharge'),          alt: 'Senior being gently assisted into the passenger seat of a car with a folded travel quilt on her lap', label: 'DISCHARGE · HOME TRANSITION', hue: 40 },
    roomBoard:          { src: local('roomBoard'),          alt: 'Cozy senior bedroom with ivory walls, a wooden rocker and a hand-quilted navy-and-cream throw', label: 'ROOM & BOARD · COTTAGE', hue: 30 },
    consult:            { src: local('consult'),            alt: 'A registered nurse in navy scrubs and an older woman reviewing a written care plan at a kitchen table', label: 'CONSULTATION · NURSE + FAMILY', hue: 26 },
    groceryMeal:        { src: local('groceryMeal'),        alt: 'A caregiver and a senior preparing a home-cooked meal together at a sunlit kitchen counter', label: 'GROCERY & MEAL', hue: 38 },
    custom:             { src: local('custom'),             alt: 'A handwritten note next to a steaming mug of tea on a worn wooden kitchen table', label: 'OTHER · CUSTOM CARE', hue: 30 },
    storyPreview:       { src: local('storyPreview'),       alt: 'Older womans hands gently holding a younger womans hands across a wooden kitchen table', label: 'OUR STORY · HANDS', hue: 26 },
    aboutHero:          { src: local('aboutHero'),          alt: 'Multigenerational family on a wide white-painted Southern front porch at golden hour', label: 'ABOUT · FAMILY PORCH', hue: 32 },
    dedicationPortrait: { src: local('dedicationPortrait'), alt: 'A weathered older womans hand on an open family album, soft window light, memorial portrait', label: 'IN HONOR OF ETHEL', hue: 24 },
    careersHero:        { src: local('careersHero'),        alt: 'A young caregiver and an older man laughing together over morning coffee at a sunlit kitchen window', label: 'CAREERS · LAUGHTER', hue: 36 },
    contactPorch:       { src: local('contactPorch'),       alt: 'A Southern white-painted porch swing with a tartan throw and a worn book, late afternoon', label: 'CONTACT · PORCH SWING', hue: 30 },
    teamA:              { src: local('teamA'),              alt: 'Portrait of an African American woman caregiver in navy scrubs against a hand-quilted ivory background', label: 'TEAM · A', hue: 28 },
    teamB:              { src: local('teamB'),              alt: 'Portrait of a silver-haired woman caregiver in a soft navy cardigan against a hand-quilted ivory background', label: 'TEAM · B', hue: 36 },
    teamC:              { src: local('teamC'),              alt: 'Portrait of a man caregiver in soft navy scrubs against a hand-quilted ivory background', label: 'TEAM · C', hue: 30 },
    teamD:              { src: local('teamD'),              alt: 'Portrait of the on-staff Registered Nurse in a crisp ivory blouse with an enamel RN pin', label: 'TEAM · D · RN', hue: 26 },
    stepConsult:        { src: local('stepConsult'),        alt: 'Still life of a phone handset, pen, and steaming mug of tea on a kitchen table — calm phone consultation', label: 'STEP 01 · CONSULT', hue: 32 },
    stepAssess:         { src: local('stepAssess'),         alt: 'Caregiver in navy scrubs walking through a sunlit living room with a senior, holding a small notebook', label: 'STEP 02 · ASSESSMENT', hue: 35 },
    stepPlan:           { src: local('stepPlan'),           alt: 'A handwritten care plan, brass fountain pen and reading glasses on a worn wooden kitchen table', label: 'STEP 03 · CARE PLAN', hue: 28 },
    stepOngoing:        { src: local('stepOngoing'),        alt: 'A senior and her caregiver laughing together over iced tea in a sunlit garden', label: 'STEP 04 · ONGOING', hue: 30 },
    family1:            { src: local('family1'),            alt: 'A multigenerational family hugging in a warm sunlit kitchen', label: 'STORY · FAMILY KITCHEN', hue: 30 },
    family2:            { src: local('family2'),            alt: 'An older woman in an oatmeal cardigan reading a book in a vintage leather armchair, soft window light', label: 'STORY · READING', hue: 32 },
    family3:            { src: local('family3'),            alt: 'A senior woman and her young granddaughter walking through a sunlit Southern garden, holding hands', label: 'STORY · GARDEN', hue: 30 }
  };

  // Wire data-photo attributes. Real Higgsfield-generated photography is now
  // wired into every `data-photo` slot. The SVG placeholder is retained as a
  // graceful fallback if a WebP fails to load.
  const USE_REAL_PHOTOS = true;
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
