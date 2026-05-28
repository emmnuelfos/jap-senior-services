/* ============================================================
   J.A.P Senior Services — Scattered Testimonial Gallery
   Cards with a client photo background and a navy brand gradient
   at the bottom holding the quote + attribution. Scatter pattern
   (rotation + y-offset), drag/swipe, click-to-focus, keyboard nav.
   ============================================================ */

(function () {
  'use strict';

  // ---------- DATA ----------
  // Each card: photo key (matches a data-photo in photos.js),
  // quote (Fraunces italic), attribution (brass small caps).
  // All quotes flagged as placeholders until real family stories arrive.
  const testimonials = [
    {
      photo: 'careersHero',
      quote: "They didn't just care for my mother. They learned her — what tea she liked, when she got tired, the stories she wanted to tell. By the second week she was asking when 'her people' were coming back.",
      who:   'Daughter of a loved one',
      where: 'Birmingham, AL',
      placeholder: true
    },
    {
      photo: 'family1',
      quote: "The nurse who visited didn't talk to my dad like a patient. She talked to him like a man who had built a life — and then she built a plan around it. That's the difference.",
      who:   'Son of a loved one',
      where: 'Mountain Brook, AL',
      placeholder: true
    },
    {
      photo: 'walkingGarden',
      quote: "Mama needed help getting out for her walks again. Their caregiver showed up at the same time every morning, rain or shine, and they would talk the whole way. That was the gift.",
      who:   'Daughter of a loved one',
      where: 'Vestavia Hills, AL',
      placeholder: true
    },
    {
      photo: 'stepOngoing',
      quote: "We tried other services that came and went — different faces every week. With J.A.P. it was the same two caregivers for three years. They became family.",
      who:   'Wife of a loved one',
      where: 'Hoover, AL',
      placeholder: true
    },
    {
      photo: 'holdingHands',
      quote: "They never made my grandfather feel like a problem. He felt like the most important person in the room every time they walked in. That is rare.",
      who:   'Granddaughter of a loved one',
      where: 'Homewood, AL',
      placeholder: true
    },
    {
      photo: 'family3',
      quote: "When my mother passed, they came to the funeral. They sat in the back, quiet, and brought a casserole. After everyone else had moved on, they were still there.",
      who:   'Son of a loved one',
      where: 'Tuscaloosa, AL',
      placeholder: true
    }
  ];

  // ---------- SCATTER PATTERN ----------
  // Per-card rotation (deg) and vertical nudge (px). These add the
  // scattered, hand-pinned feel to the carousel.
  const ROT_PATTERN = [-5, 4, -3, 6, -4, 3, -6, 5];
  const Y_PATTERN   = [0, 18, -16, 12, 6, -20, 10, -10];
  const DRAG_THRESHOLD  = 8;
  const STAGGER_MS      = 80;
  const ENTRY_THRESHOLD = 0.18;

  // Random-feeling entry offsets per index — seeded by index so it's
  // deterministic between renders.
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

  let activeIdx     = Math.floor(testimonials.length / 2);
  let currentOffset = 0;

  // Build card markup.
  track.innerHTML = testimonials.map((t, i) => {
    const rot = ROT_PATTERN[i % ROT_PATTERN.length];
    const ty  = Y_PATTERN[i % Y_PATTERN.length];
    const en  = entrancePos(i);
    const styleVars = [
      `--jap-rot:${rot}deg`,
      `--jap-ty:${ty}px`,
      `--jap-enter-x:${en.x.toFixed(1)}px`,
      `--jap-enter-y:${en.y.toFixed(1)}px`,
      `--jap-enter-r:${en.r.toFixed(1)}deg`,
      `--jap-enter-s:${en.s.toFixed(3)}`,
      `--jap-i:${i}`
    ].join(';');

    const tag = t.placeholder
      ? `<span class="jap-scat__tag">Family testimonial to be added</span>`
      : '';

    // We use data-photo so photos.js can swap in the local Higgsfield WebP.
    return `
      <figure class="jap-scat__card" data-i="${i}" tabindex="0" role="button"
              aria-label="Testimonial from ${t.who}, ${t.where}" style="${styleVars}">
        <img class="jap-scat__photo" data-photo="${t.photo}" alt="" draggable="false" />
        <div class="jap-scat__overlay">
          ${tag}
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
  }).join('');

  // Photos.js wires data-photo → WebP src on its own DOMContentLoaded.
  // If we beat it to the punch, force-wire any newly-injected imgs.
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

  function update() {
    cards.forEach((c, i) => c.classList.toggle('is-active', i === activeIdx));
    counter.textContent = String(activeIdx + 1).padStart(2, '0') + ' / ' +
                          String(testimonials.length).padStart(2, '0');
    layout();
  }

  function go(delta) {
    activeIdx = (activeIdx + delta + testimonials.length) % testimonials.length;
    update();
  }
  function jump(i) { activeIdx = i; update(); }

  // ---------- ENTRANCE ----------
  const entryIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      root.classList.add('is-entering', 'is-entered');
      entryIO.disconnect();
      const total = cards.length * STAGGER_MS + 1500;
      setTimeout(() => root.classList.remove('is-entering'), total);
    });
  }, { threshold: ENTRY_THRESHOLD });
  entryIO.observe(root);

  // ---------- DRAG / SWIPE ----------
  const drag = { active: false, startX: 0, startOffset: 0, moved: false };

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('.jap-scat__nav')) return;
    if (!root.classList.contains('is-entered')) return;
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
      if (shift !== 0) activeIdx = (activeIdx + shift + testimonials.length) % testimonials.length;
      update();
    }
  }
  // Swallow synthetic click after a drag so a card doesn't get focused
  // immediately after a swipe.
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
    if (i !== activeIdx) jump(i);
  });

  track.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.jap-scat__card');
    if (card) { e.preventDefault(); card.click(); }
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  go(-1);
    else if (e.key === 'ArrowRight') go(1);
  });

  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); go(-1); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); go(1); });

  // ---------- RESIZE ----------
  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(layout, 120); });

  // First photo may swap src after photos.js loads — re-layout once loaded.
  const firstImg = cards[0]?.querySelector('img');
  if (firstImg && !firstImg.complete) firstImg.addEventListener('load', layout, { once: true });

  update();
  setTimeout(layout, 50);
})();
