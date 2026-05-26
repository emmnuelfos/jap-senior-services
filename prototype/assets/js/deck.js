/* ============================================================
   J.A.P × TaskFlo VA — Deck navigation
   ============================================================ */

(function () {
  'use strict';

  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;

  const counterCurr = document.querySelector('.deck-nav-counter .curr');
  const counterTotal = document.querySelector('.deck-nav-counter .total');
  const prevBtn = document.querySelector('.deck-nav-prev');
  const nextBtn = document.querySelector('.deck-nav-next');
  const navTrack = document.querySelector('.deck-nav-track');
  const navFill = document.querySelector('.deck-nav-fill');
  const navMarker = document.querySelector('.deck-nav-marker');
  const indexOverlay = document.querySelector('.index-overlay');
  const indexGrid = document.querySelector('.index-grid');
  const indexClose = document.querySelector('.index-close');

  if (counterTotal) counterTotal.textContent = String(total).padStart(2, '0');

  /* ---------- Click on progress track to jump to that point ---------- */
  if (navTrack) {
    navTrack.addEventListener('click', (e) => {
      const rect = navTrack.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const idx = Math.round(ratio * (total - 1));
      goTo(idx);
    });
  }
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  /* ---------- Build index ---------- */
  slides.forEach((s, i) => {
    const a = document.createElement('a');
    a.href = '#' + s.id;
    a.innerHTML =
      '<span class="ig-num">' + String(i + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0') + '</span>' +
      '<span class="ig-title">' + (s.dataset.title || s.id) + '</span>';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      closeIndex();
      goTo(i);
    });
    indexGrid.appendChild(a);
  });

  /* ---------- Track current slide ---------- */
  let current = -1;  // start at -1 so first setCurrent(0) applies
  function setCurrent(idx) {
    if (idx === current) return;
    current = idx;
    if (counterCurr) counterCurr.textContent = String(idx + 1).padStart(2, '0');
    const pct = total <= 1 ? 100 : (idx / (total - 1)) * 100;
    if (navFill) navFill.style.width = pct + '%';
    if (navMarker) navMarker.style.left = pct + '%';
    if (navTrack) navTrack.setAttribute('aria-valuenow', String(Math.round(pct)));
    if (prevBtn) prevBtn.disabled = (idx <= 0);
    if (nextBtn) nextBtn.disabled = (idx >= total - 1);
  }

  /* ---------- IntersectionObserver to detect current ---------- */
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      // Find the entry with the largest intersection ratio that is intersecting
      let best = null;
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      });
      if (best) {
        const idx = slides.indexOf(best.target);
        if (idx >= 0) setCurrent(idx);
      }
    }, { threshold: [0.4, 0.55, 0.7] });
    slides.forEach(s => obs.observe(s));
  }

  /* ---------- Go to ---------- */
  function goTo(idx) {
    if (idx < 0) idx = 0;
    if (idx >= total) idx = total - 1;
    const target = slides[idx];
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCurrent(idx);
  }

  /* ---------- Keyboard nav ---------- */
  window.addEventListener('keydown', (e) => {
    // Don't hijack if user is typing
    const tag = (document.activeElement?.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goTo(current - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(total - 1);
    } else if (e.key === 'Escape') {
      if (indexOverlay.classList.contains('is-open')) closeIndex();
      else openIndex();
    }
  });

  /* ---------- Index overlay ---------- */
  function openIndex() {
    indexOverlay.classList.add('is-open');
    indexOverlay.setAttribute('aria-hidden', 'false');
  }
  function closeIndex() {
    indexOverlay.classList.remove('is-open');
    indexOverlay.setAttribute('aria-hidden', 'true');
  }
  if (indexClose) indexClose.addEventListener('click', closeIndex);
  // Click outside index-grid cards closes
  indexOverlay.addEventListener('click', (e) => {
    if (e.target === indexOverlay) closeIndex();
  });

  /* ---------- Initial state ---------- */
  // If URL has a #slide-N, jump there on load
  const hash = window.location.hash;
  if (hash && hash.startsWith('#slide-')) {
    const n = parseInt(hash.replace('#slide-', ''), 10);
    if (!isNaN(n) && n >= 1 && n <= total) {
      requestAnimationFrame(() => goTo(n - 1));
    }
  } else {
    setCurrent(0);
  }

})();
