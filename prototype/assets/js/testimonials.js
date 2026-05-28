/* ============================================================
   J.A.P Senior Services — Scattered Testimonial Gallery
   - Cards with a client photo background + navy gradient overlay
     holding the quote (Fraunces italic, ivory) and attribution
     (Fraunces name + brass uppercase city).
   - Infinite loop: cards are tripled in the DOM so there's always
     a neighbouring card on both sides of whichever card is active.
     When the active index drifts past the middle copy boundary,
     we snap it back to the middle without a visible transition.
   - Click a card → spotlight mode: the card scales up, the rest of
     the page dims behind a navy backdrop, click anywhere outside
     to dismiss. Navigation stays clickable above the overlay.
   - Replays the entry scatter every time the section re-enters
     the viewport.
   ============================================================ */

(function () {
  'use strict';

  // ---------- DATA ----------
  // Each card: photo key (matches a data-photo in photos.js),
  // quote (Fraunces italic) + attribution (brass small caps).
  const testimonials = [
    {
      photo: 'careersHero',
      quote: "They didn't just care for my mother. They learned her — what tea she liked, when she got tired, the stories she wanted to tell. By the second week she was asking when 'her people' were coming back.",
      who:   'Daughter of a loved one',
      where: 'Birmingham, AL'
    },
    {
      photo: 'family1',
      quote: "The nurse who visited didn't talk to my dad like a patient. She talked to him like a man who had built a life — and then she built a plan around it. That's the difference.",
      who:   'Son of a loved one',
      where: 'Mountain Brook, AL'
    },
    {
      photo: 'walkingGarden',
      quote: "Mama needed help getting out for her walks again. Their caregiver showed up at the same time every morning, rain or shine, and they would talk the whole way. That was the gift.",
      who:   'Daughter of a loved one',
      where: 'Vestavia Hills, AL'
    },
    {
      photo: 'stepOngoing',
      quote: "We tried other services that came and went — different faces every week. With J.A.P. it was the same two caregivers for three years. They became family.",
      who:   'Wife of a loved one',
      where: 'Hoover, AL'
    },
    {
      photo: 'holdingHands',
      quote: "They never made my grandfather feel like a problem. He felt like the most important person in the room every time they walked in. That is rare.",
      who:   'Granddaughter of a loved one',
      where: 'Homewood, AL'
    },
    {
      photo: 'family3',
      quote: "When my mother passed, they came to the funeral. They sat in the back, quiet, and brought a casserole. After everyone else had moved on, they were still there.",
      who:   'Son of a loved one',
      where: 'Tuscaloosa, AL'
    }
  ];

  // ---------- SCATTER PATTERN ----------
  const ROT_PATTERN = [-5, 4, -3, 6, -4, 3, -6, 5];
  const Y_PATTERN   = [0, 18, -16, 12, 6, -20, 10, -10];
  const DRAG_THRESHOLD  = 8;
  const STAGGER_MS      = 80;
  const ENTRY_THRESHOLD = 0.18;
  const COPIES          = 3;   // Triple the cards for the infinite-loop illusion.

  function entrancePos(i) {
    const a = Math.sin(i * 1.7 + 2);
    const b = Math.cos(i * 2.3 + 1.5);
    const c = Math.sin(i * 1.3 + 0.7);
    const d = Math.cos(i * 0.9);
    return {
      x: a * 360 + d * 40,
      y: b * 160 - 30,
      r: c * 24,
      s: 0.86 + (Math.sin(i * 0.8) + 1) * 0.06,
    };
  }

  // ---------- DOM ----------
  const root = document.getElementById('japScat');
  if (!root || !testimonials.length) return;

  const track   = root.querySelector('.jap-scat__track');
  const counter = root.querySelector('.jap-scat__counter');
  const prevBtn = root.querySelector('.jap-scat__nav--prev');
  const nextBtn = root.querySelector('.jap-scat__nav--next');

  const N = testimonials.length;
  const TOTAL = N * COPIES;

  // Active index lives in [0, TOTAL); the "real" index is activeIdx % N.
  // We start in the middle copy so the user can scroll either direction
  // without immediately needing to wrap.
  let activeIdx     = N + Math.floor(N / 2);
  let currentOffset = 0;

  // Build card markup — render testimonials COPIES times.
  let html = '';
  for (let copy = 0; copy < COPIES; copy++) {
    for (let i = 0; i < N; i++) {
      const t       = testimonials[i];
      const absoluteIdx = copy * N + i;
      const rot     = ROT_PATTERN[absoluteIdx % ROT_PATTERN.length];
      const ty      = Y_PATTERN[absoluteIdx % Y_PATTERN.length];
      const en      = entrancePos(absoluteIdx);
      const styleVars = [
        `--jap-rot:${rot}deg`,
        `--jap-ty:${ty}px`,
        `--jap-enter-x:${en.x.toFixed(1)}px`,
        `--jap-enter-y:${en.y.toFixed(1)}px`,
        `--jap-enter-r:${en.r.toFixed(1)}deg`,
        `--jap-enter-s:${en.s.toFixed(3)}`,
        `--jap-i:${absoluteIdx}`
      ].join(';');

      html += `
        <figure class="jap-scat__card" data-i="${absoluteIdx}" data-real="${i}"
                tabindex="0" role="button"
                aria-label="Testimonial from ${t.who}, ${t.where}" style="${styleVars}">
          <img class="jap-scat__photo" data-photo="${t.photo}" alt="" draggable="false" />
          <div class="jap-scat__overlay">
            <blockquote class="jap-scat__quote">
              <span class="jap-scat__qmark" aria-hidden="true">&ldquo;</span>${t.quote}
            </blockquote>
            <div class="jap-scat__attrib">
              <span class="jap-scat__who">${t.who}</span>
              <span class="jap-scat__where">${t.where}</span>
            </div>
          </div>
        </figure>
      `;
    }
  }
  track.innerHTML = html;

  // Photos.js wires data-photo → WebP src on its own DOMContentLoaded.
  if (window.JAP_setPhoto) {
    root.querySelectorAll('img[data-photo]').forEach(window.JAP_setPhoto);
  }

  const cards = Array.from(track.querySelectorAll('.jap-scat__card'));

  function cardStep() {
    const gap = parseFloat(getComputedStyle(root).getPropertyValue('--jap-card-gap')) || 18;
    return cards[0].offsetWidth + gap;
  }

  function layout() {
    const card = cards[activeIdx];
    if (!card) return;
    const cardCenter  = card.offsetLeft + card.offsetWidth / 2;
    const trackCenter = track.scrollWidth / 2;
    currentOffset = trackCenter - cardCenter;
    track.style.setProperty('--jap-off', currentOffset + 'px');
  }

  // When activeIdx leaves the middle copy, silently snap it back to the
  // equivalent position in the middle copy. The snap happens without a
  // transition so the user never sees a visual jump.
  function normalize() {
    let snapped = false;
    if (activeIdx < N) { activeIdx += N; snapped = true; }
    else if (activeIdx >= 2 * N) { activeIdx -= N; snapped = true; }
    if (snapped) {
      track.style.transition = 'none';
      layout();
      // Force a reflow before re-enabling transitions so the next move animates.
      void track.offsetWidth;
      track.style.transition = '';
    }
  }

  function update() {
    cards.forEach((c, i) => c.classList.toggle('is-active', i === activeIdx));
    const realIdx = activeIdx % N;
    counter.textContent = String(realIdx + 1).padStart(2, '0') + ' / ' +
                          String(N).padStart(2, '0');
    layout();
  }

  function go(delta) {
    activeIdx = activeIdx + delta;
    // Animate to the new position first; on transition end normalise.
    update();
    setTimeout(normalize, 1050);
  }
  function jump(absoluteIdx) {
    activeIdx = absoluteIdx;
    update();
    setTimeout(normalize, 1050);
  }

  // ---------- SPOTLIGHT MODE ----------
  // Click a card → it scales up, everything else dims behind a navy backdrop.
  // Click anywhere outside the active card to dismiss.
  function openSpotlight() {
    document.body.classList.add('jap-scat-spotlight');
    root.classList.add('is-spotlight');
  }
  function closeSpotlight() {
    document.body.classList.remove('jap-scat-spotlight');
    root.classList.remove('is-spotlight');
  }

  // ---------- ENTRANCE — REPLAYS ON RE-ENTRY ----------
  let entryTimer = null;
  const entryIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio > ENTRY_THRESHOLD) {
        clearTimeout(entryTimer);
        root.classList.remove('is-entered', 'is-entering');
        void root.offsetWidth;
        root.classList.add('is-entering', 'is-entered');
        const total = N * STAGGER_MS + 1500;
        entryTimer = setTimeout(() => root.classList.remove('is-entering'), total);
      } else if (!e.isIntersecting) {
        clearTimeout(entryTimer);
        root.classList.remove('is-entered', 'is-entering');
        // Drop spotlight if the user scrolls the section out of view.
        if (root.classList.contains('is-spotlight')) closeSpotlight();
      }
    });
  }, { threshold: [0, ENTRY_THRESHOLD, 0.5] });
  entryIO.observe(root);

  // ---------- DRAG / SWIPE ----------
  const drag = { active: false, startX: 0, startOffset: 0, moved: false };

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('.jap-scat__nav')) return;
    if (!root.classList.contains('is-entered')) return;
    if (root.classList.contains('is-spotlight')) return;
    drag.active = true;
    drag.startX = e.clientX;
    drag.startOffset = currentOffset;
    drag.moved = false;
  }
  function onPointerMove(e) {
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      drag.moved = true;
      root.classList.add('is-dragging');
    }
    if (drag.moved) track.style.setProperty('--jap-off', (drag.startOffset + dx) + 'px');
  }
  function onPointerUp(e) {
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    drag.active = false;
    if (drag.moved) {
      root.classList.remove('is-dragging');
      const step = cardStep();
      const raw = -dx / (step * 0.6);
      const shift = Math.trunc(raw) + Math.sign(raw) * (Math.abs(raw) % 1 > 0.4 ? 1 : 0);
      if (shift !== 0) {
        activeIdx = activeIdx + shift;
        update();
        setTimeout(normalize, 1050);
      } else {
        // Snap back to the active card.
        update();
      }
    }
  }
  // Swallow synthetic click after a drag.
  track.addEventListener('click', (e) => {
    if (drag.moved) { e.preventDefault(); e.stopPropagation(); drag.moved = false; }
  }, true);
  track.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointercancel', onPointerUp);

  // ---------- CLICK / KEYBOARD ----------
  track.addEventListener('click', (e) => {
    const card = e.target.closest('.jap-scat__card');
    if (!card) return;
    const i = +card.dataset.i;
    if (i !== activeIdx) {
      jump(i);
      // Open spotlight after the centering transition finishes.
      setTimeout(openSpotlight, 720);
    } else {
      openSpotlight();
    }
  });

  // Click anywhere outside the active card while in spotlight → close.
  document.addEventListener('click', (e) => {
    if (!root.classList.contains('is-spotlight')) return;
    if (e.target.closest('.site-header')) return;   // Navigation stays clickable.
    if (e.target.closest('.jap-scat__nav')) return; // Nav arrows still usable.
    if (e.target.closest('.jap-scat__card.is-active')) return;
    closeSpotlight();
  });

  track.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.jap-scat__card');
    if (card) { e.preventDefault(); card.click(); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'Escape' && root.classList.contains('is-spotlight')) closeSpotlight();
  });

  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); go(-1); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); go(1); });

  // ---------- RESIZE ----------
  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(layout, 120); });

  const firstImg = cards[0]?.querySelector('img');
  if (firstImg && !firstImg.complete) firstImg.addEventListener('load', layout, { once: true });

  update();
  setTimeout(layout, 50);
})();
