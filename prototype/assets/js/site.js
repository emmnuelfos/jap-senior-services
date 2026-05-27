/* ============================================================
   J.A.P Senior Services — site.js
   Header, mobile drawer, scroll reveals, forms, tweaks
   ============================================================ */

(function () {
  'use strict';

  /* ---------- HEADER SHRINK ON SCROLL ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 24) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
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

  /* ---------- SCROLL REVEALS ---------- */
  // Only hide elements that are off-screen. Already-visible elements stay
  // visible so first paint isn't a flash of empty content.
  if ('IntersectionObserver' in window) {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const siblings = Array.from(entry.target.parentNode.querySelectorAll('.reveal-pending'));
          const idx = siblings.indexOf(entry.target);
          const delay = Math.min(idx, 5) * 60;
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    document.querySelectorAll('.reveal').forEach(el => {
      const rect = el.getBoundingClientRect();
      // Only animate if currently below the fold
      if (rect.top > vh * 0.9) {
        el.classList.add('reveal-pending');
        io.observe(el);
      }
    });
  }

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

  /* ---------- TWEAKS PANEL ---------- */
  // Persist via localStorage
  const TWEAK_KEY = 'jap.tweaks.v1';
  const defaults = { heroVariant: 'editorial-split', cardLayout: 'photo-top' };
  let tweaks = defaults;
  try {
    const stored = localStorage.getItem(TWEAK_KEY);
    if (stored) tweaks = Object.assign({}, defaults, JSON.parse(stored));
  } catch (e) { /* noop */ }

  function applyTweaks() {
    // Hero variant — variants are siblings (each its own .home-hero)
    const isHome = document.body.getAttribute('data-page') === 'home';
    if (isHome) {
      document.querySelectorAll('[data-variant-content]').forEach(v => {
        const name = v.getAttribute('data-variant-content');
        v.style.display = (name === tweaks.heroVariant) ? '' : 'none';
      });
    }
    // Card layout
    document.body.classList.toggle('cards-photo-left', tweaks.cardLayout === 'photo-left');
    document.body.classList.toggle('cards-photo-top', tweaks.cardLayout === 'photo-top');
  }
  applyTweaks();

  function persistTweaks() {
    try { localStorage.setItem(TWEAK_KEY, JSON.stringify(tweaks)); } catch (e) {}
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: tweaks }, '*');
    } catch (e) {}
  }

  // Build the panel
  function buildPanel() {
    const panel = document.createElement('div');
    panel.id = 'tweaks-panel';
    panel.innerHTML = `
      <div class="head">
        <h5>Tweaks</h5>
        <button class="close" aria-label="Close tweaks"></button>
      </div>
      <div class="tw-group" data-tw="heroVariant" data-only-on="index.html,index">
        <div class="tw-label">Homepage hero</div>
        <div class="stack">
          <button data-value="full-bleed">Full-bleed photo + overlay</button>
          <button data-value="editorial-split">Editorial split</button>
          <button data-value="quiet">Quiet typographic</button>
          <button data-value="layered">Layered editorial</button>
        </div>
      </div>
      <div class="tw-group" data-tw="cardLayout">
        <div class="tw-label">Service card layout</div>
        <div class="seg">
          <button data-value="photo-top">Photo top</button>
          <button data-value="photo-left">Photo left</button>
        </div>
      </div>
      <div class="note">Variations apply across linked pages.</div>
    `;
    document.body.appendChild(panel);

    // Hide hero-variant group on non-home pages
    const isHome = /(^|\/)(index\.html)?$/.test(window.location.pathname);
    panel.querySelectorAll('[data-only-on]').forEach(g => {
      if (!isHome) g.style.display = 'none';
    });

    // Wire buttons
    panel.querySelectorAll('.tw-group').forEach(group => {
      const key = group.getAttribute('data-tw');
      group.querySelectorAll('button[data-value]').forEach(btn => {
        const val = btn.getAttribute('data-value');
        btn.classList.toggle('is-active', tweaks[key] === val);
        btn.addEventListener('click', () => {
          tweaks[key] = val;
          group.querySelectorAll('button[data-value]').forEach(b =>
            b.classList.toggle('is-active', b.getAttribute('data-value') === val)
          );
          applyTweaks();
          persistTweaks();
        });
      });
    });

    panel.querySelector('.close').addEventListener('click', () => {
      panel.classList.remove('is-open');
      try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
    });

    return panel;
  }

  const panel = buildPanel();

  // Floating toggle button — shown when panel is closed, hidden when open.
  // Lets the panel be opened directly when viewing the live site (no iframe).
  const toggle = document.createElement('button');
  toggle.id = 'tweaks-toggle';
  toggle.setAttribute('aria-label', 'Open design tweaks panel');
  toggle.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 7h7"></path><path d="M4 12h10"></path><path d="M4 17h7"></path>
      <circle cx="15" cy="7" r="2"></circle><circle cx="18" cy="12" r="2"></circle><circle cx="15" cy="17" r="2"></circle>
    </svg>
    <span>Tweaks</span>
  `;
  toggle.addEventListener('click', () => {
    panel.classList.add('is-open');
    toggle.classList.add('is-hidden');
  });
  document.body.appendChild(toggle);

  // When panel closes (via X or postMessage), show toggle again
  function onPanelClosed() { toggle.classList.remove('is-hidden'); }
  panel.querySelector('.close').addEventListener('click', onPanelClosed);

  // Edit-mode protocol (preserved for Claude Design iframe hosting)
  window.addEventListener('message', (e) => {
    const data = e && e.data;
    if (!data || !data.type) return;
    if (data.type === '__activate_edit_mode') {
      panel.classList.add('is-open');
      toggle.classList.add('is-hidden');
    }
    if (data.type === '__deactivate_edit_mode') {
      panel.classList.remove('is-open');
      toggle.classList.remove('is-hidden');
    }
  });
  try {
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  } catch (e) {}

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

})();
