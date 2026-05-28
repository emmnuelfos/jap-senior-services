/* ============================================================
   J.A.P Senior Services — Animated Icon loader
   Reads <span class="ai-icon" data-icon="<name>"> elements,
   fetches the matching Lottie JSON from assets/icons/<name>.json,
   and plays each animation ONCE — the first time the icon enters
   the viewport, after the reveal cascade's --seq-offset delay.

   Sequencing: the FIRST viewport entry kicks off a Lottie cycle
   delayed by `--seq-offset` (read from the icon itself if it
   carries a reveal, otherwise from the closest reveal ancestor)
   so the Lottie animation moves in step with the surrounding
   title / paragraph reveal.

   Play behaviour: each Lottie plays exactly one cycle per page
   load. Once started, it plays through to completion (even if
   the user scrolls it off-screen mid-cycle), then stops on its
   end frame. Re-entering the viewport never restarts or resumes
   anything. The only thing that can restart a Lottie is a hover
   (deliberate user gesture) — there is no automatic loop and no
   pause-on-exit logic any more.

   Uses the lottie-web library (loaded once from CDN).
   ============================================================ */

(function () {
  'use strict';

  const ICON_DIR = 'assets/icons/';
  const LOTTIE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie_light.min.js';
  const IO_THRESHOLD = 0.2;

  // Cache JSON across multiple instances of the same icon.
  const jsonCache = Object.create(null);
  function loadJson(name) {
    if (jsonCache[name]) return jsonCache[name];
    jsonCache[name] = fetch(ICON_DIR + name + '.json').then(r => r.json());
    return jsonCache[name];
  }

  // Load lottie-web once.
  let lottiePromise = null;
  function loadLottie() {
    if (window.lottie) return Promise.resolve(window.lottie);
    if (lottiePromise) return lottiePromise;
    lottiePromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = LOTTIE_SRC;
      s.crossOrigin = 'anonymous';
      s.onload = () => resolve(window.lottie);
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return lottiePromise;
  }

  // Resolve the cascade offset (ms) that this icon should wait for
  // before its FIRST play. Reads --seq-offset from the icon itself
  // (if it carries a data-reveal) or from the nearest reveal
  // ancestor. Falls back to 0 when nothing is found.
  function resolveSeqOffset(el) {
    const sources = [el];
    const ancestor = el.parentElement && el.parentElement.closest('[data-reveal]');
    if (ancestor) sources.push(ancestor);
    for (const node of sources) {
      const raw = node.style.getPropertyValue('--seq-offset')
        || getComputedStyle(node).getPropertyValue('--seq-offset');
      const parsed = parseFloat(raw);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
    return 0;
  }

  // Kick off the one and only play, after the cascade delay.
  // Resolves --seq-offset lazily at this call site so reveals.js has
  // had time to write the cascade values regardless of script order.
  function firstPlay(el) {
    if (el.__hasPlayed || !el.__anim) return;
    el.__hasPlayed = true; // mark immediately so the IO can't re-enter
    const delay = resolveSeqOffset(el);
    clearTimeout(el.__firstTimer);
    if (delay <= 0) {
      el.__anim.goToAndPlay(0, true);
      return;
    }
    el.__firstTimer = setTimeout(() => {
      if (el.__anim) el.__anim.goToAndPlay(0, true);
    }, delay);
  }

  // Mount one icon container.
  async function mount(el) {
    if (el.dataset.mounted === '1') return;
    el.dataset.mounted = '1';

    const name = el.getAttribute('data-icon');
    if (!name) return;

    // Force inline sizing so lottie-web's container reset can't override us.
    const size = parseInt(el.getAttribute('data-size') || '48', 10);
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.display = 'inline-block';
    el.style.verticalAlign = 'middle';
    el.style.flex = '0 0 auto';
    el.style.overflow = 'hidden';

    const speed = parseFloat(el.getAttribute('data-speed') || '1');

    const [lottie, data] = await Promise.all([loadLottie(), loadJson(name)]).catch(e => {
      console.error('[icons] failed to load', name, e);
      return [null, null];
    });
    if (!lottie || !data) return;

    // Single play, no autoplay — we trigger the cycle from the IO
    // after the cascade delay, and Lottie's own end-of-cycle event
    // does nothing (no loop wiring).
    const anim = lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: data,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    });
    anim.setSpeed(speed);

    el.__anim = anim;
    el.__hasPlayed = false;
    // NOTE: --seq-offset is resolved lazily at first-play time. Mounting
    // may happen before reveals.js has written the cascade offsets — by
    // the time the icon actually scrolls into view the value is reliably
    // available.
  }

  // Single IntersectionObserver fires the one and only play the first
  // time the icon crosses the threshold. Once started, the Lottie runs
  // to completion (off-screen is fine — it's a brief one-shot) and the
  // observer unhooks itself. Nothing replays on re-entry.
  const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    for (const e of entries) {
      const el = e.target;
      if (!el.__anim) continue;
      if (e.isIntersecting && e.intersectionRatio > IO_THRESHOLD) {
        if (!el.__hasPlayed) firstPlay(el);
        io.unobserve(el);
      }
    }
  }, { threshold: [0, IO_THRESHOLD, 0.5] }) : null;

  // Hover trigger — deliberate user gesture, allowed to replay.
  function attachHover(el) {
    el.addEventListener('mouseenter', () => {
      if (!el.__anim) return;
      el.__anim.goToAndPlay(0, true);
    });
  }

  async function bootAll() {
    const els = Array.from(document.querySelectorAll('.ai-icon[data-icon]'));
    await Promise.all(els.map(mount));
    if (io) els.forEach(el => io.observe(el));
    els.forEach(attachHover);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAll);
  } else {
    bootAll();
  }

  // Expose for any dynamic injection.
  window.JAP_mountIcon = async function (el) {
    await mount(el);
    if (io) io.observe(el);
    attachHover(el);
  };
})();
