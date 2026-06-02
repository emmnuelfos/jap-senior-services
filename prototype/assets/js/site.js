/* ============================================================
   J.A.P Senior Services — site.js
   Header, mobile drawer, scroll reveals, forms, tweaks
   ============================================================ */

(function () {
  'use strict';

  /* ---------- HEADER SHRINK ON SCROLL ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    // Hysteresis around the toggle — prevents bouncing when scroll lands
    // right on the threshold (especially at scrollY = 0 with bounce-scroll).
    let scrolled = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (!scrolled && y > 32) { scrolled = true; header.classList.add('is-scrolled'); }
      else if (scrolled && y < 8) { scrolled = false; header.classList.remove('is-scrolled'); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- MOBILE DRAWER ---------- */
  const burger = document.querySelector('.header-burger');
  const drawer = document.querySelector('.drawer');
  const drawerClose = document.querySelector('.drawer-close');
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (burger) burger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawer) {
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
  }

  /* ---------- SCROLL REVEALS (legacy — disabled) ----------
     The original .reveal / .reveal-pending / .is-visible system has been
     fully superseded by the [data-reveal] system in reveals.js, which
     gives every element its own per-letter / per-word / clip-path
     entrance. The two systems used to stack on the same element (e.g.
     <div class="photo reveal"><img data-reveal="image"></div>): the
     legacy layer added opacity:0 to the parent and the new layer
     animated clip-path on the child, so even when the child's clip
     opened, the parent stayed transparent and the image never
     appeared. Removing this block lets the new system own the entire
     reveal pipeline. The .reveal class is kept in markup for hooks but
     no longer carries an animation. */

  /* ---------- ACTIVE NAV LINK ---------- */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a, .drawer-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const last = href.split('/').pop();
    if (last === path || (path === '' && last === 'index.html')) {
      a.classList.add('is-active');
    }
  });

  /* ---------- SUB-NAV ACTIVE on scroll ---------- */
  const subnav = document.querySelector('.subnav');
  if (subnav) {
    const links = Array.from(subnav.querySelectorAll('a[href^="#"]'));
    const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if (sections.length) {
      const setActive = () => {
        const y = window.scrollY + 200;
        let curr = sections[0];
        sections.forEach(s => { if (s.offsetTop <= y) curr = s; });
        links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + curr.id));
      };
      window.addEventListener('scroll', setActive, { passive: true });
      setActive();
    }
  }

  /* ---------- FORM VALIDATION ---------- */
  document.querySelectorAll('form.form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('.field').forEach(field => {
        const input = field.querySelector('input, select, textarea');
        if (!input) return;
        const required = input.hasAttribute('required');
        const v = (input.value || '').trim();
        field.classList.remove('invalid');

        if (required && !v) { field.classList.add('invalid'); valid = false; }
        else if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
          field.classList.add('invalid'); valid = false;
        }
        else if (input.type === 'tel' && v && v.replace(/[^0-9]/g, '').length < 10) {
          field.classList.add('invalid'); valid = false;
        }
      });

      if (!valid) {
        const firstBad = form.querySelector('.field.invalid input, .field.invalid select, .field.invalid textarea');
        if (firstBad) firstBad.focus();
        return;
      }

      // Success state
      const success = form.querySelector('.form-success');
      const body = form.querySelector('.form-body');
      if (success && body) {
        body.style.display = 'none';
        success.style.display = 'flex';
        success.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
    // Clear invalid on input
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => input.closest('.field')?.classList.remove('invalid'));
    });
  });

  /* TWEAKS panel removed — was a development helper for switching
     hero variants and card layouts in-browser. The default editorial-
     split hero + photo-top card layout are already wired in HTML
     (inline display:none on the other variants, .cards-photo-top
     class on the body), so removing the runtime panel has no
     visible effect on the live deliverable. */

  /* ---------- SMOOTH ANCHORS ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- HERO MOUSE PARALLAX ----------
     Any element with [data-hero-parallax] gets --mx / --my custom
     properties on its descendants based on mouse position relative to
     its bounding box. Each axis is normalised to -1..1. CSS reads those
     values to translate the inner image. We freeze updates while the
     page is scrolling so the wheel never fights the image transform. */
  (function () {
    const stages = Array.from(document.querySelectorAll('[data-hero-parallax]'));
    if (!stages.length) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let scrolling = false, scrollClear;
    addEventListener('scroll', () => {
      scrolling = true;
      clearTimeout(scrollClear);
      scrollClear = setTimeout(() => { scrolling = false; }, 120);
    }, { passive: true });

    function setVars(stage, mx, my) {
      stage.style.setProperty('--mx', mx.toFixed(3));
      stage.style.setProperty('--my', my.toFixed(3));
    }

    stages.forEach(stage => {
      stage.addEventListener('pointermove', (e) => {
        if (scrolling) return;
        const r = stage.getBoundingClientRect();
        if (!r.width || !r.height) return;
        // -1..1 with (0,0) at the centre.
        const mx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
        const my = ((e.clientY - r.top)  / r.height - 0.5) * 2;
        setVars(stage, mx, my);
      });
      stage.addEventListener('pointerleave', () => setVars(stage, 0, 0));
    });
  })();

})();
