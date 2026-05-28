/* ============================================================
   J.A.P Senior Services — Animated Icon loader
   Reads <span class="ai-icon" data-icon="<name>" data-loop="false">
   elements, fetches the matching Lottie JSON from assets/icons/<name>.json,
   and plays each animation only when the icon is in the viewport.

   Loop behaviour: loop is the DEFAULT. Each cycle finishes, the icon
   pauses for 2 seconds, then plays again. Opt-out per icon with
   `data-loop="false"` to play once. Off-screen icons are always paused.

   Uses the lottie-web library (loaded once from CDN).
   ============================================================ */

(function () {
  'use strict';

  const ICON_DIR = 'assets/icons/';
  const LOTTIE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie_light.min.js';
  const LOOP_PAUSE_MS = 2000;   // gap between loops
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

  // Schedule the next play cycle after a pause, but only if we're still
  // intersecting and the user hasn't opted out.
  function scheduleNextLoop(el) {
    if (!el.__anim || !el.__inView) return;
    clearTimeout(el.__loopTimer);
    el.__loopTimer = setTimeout(() => {
      if (el.__anim && el.__inView) {
        el.__anim.goToAndPlay(0, true);
      }
    }, LOOP_PAUSE_MS);
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

    const loopOff = el.getAttribute('data-loop') === 'false';
    const speed = parseFloat(el.getAttribute('data-speed') || '1');

    const [lottie, data] = await Promise.all([loadLottie(), loadJson(name)]).catch(e => {
      console.error('[icons] failed to load', name, e);
      return [null, null];
    });
    if (!lottie || !data) return;

    // We control looping manually via the 'complete' event so we can insert
    // a fixed pause between cycles. Lottie's own `loop:true` plays without
    // a gap, which is the behaviour we want to avoid.
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
    el.__inView = false;
    el.__hasPlayed = false;

    if (!loopOff) {
      anim.addEventListener('complete', () => scheduleNextLoop(el));
    }
  }

  // Single IntersectionObserver gates ALL animations: play on enter, pause
  // (and cancel the loop timer) on exit. Nothing animates off-screen.
  const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    for (const e of entries) {
      const el = e.target;
      if (!el.__anim) continue;
      const visible = e.isIntersecting && e.intersectionRatio > IO_THRESHOLD;
      el.__inView = visible;
      const loopOff = el.getAttribute('data-loop') === 'false';
      if (visible) {
        if (!el.__hasPlayed || !loopOff) {
          el.__anim.goToAndPlay(0, true);
          el.__hasPlayed = true;
        }
      } else {
        // Off-screen: stop both the current playback and the pending loop.
        clearTimeout(el.__loopTimer);
        if (el.__anim && !el.__anim.isPaused) el.__anim.pause();
      }
    }
  }, { threshold: [0, IO_THRESHOLD, 0.5] }) : null;

  // Hover trigger — replay on hover regardless of pause state.
  function attachHover(el) {
    el.addEventListener('mouseenter', () => {
      if (!el.__anim) return;
      clearTimeout(el.__loopTimer);
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
