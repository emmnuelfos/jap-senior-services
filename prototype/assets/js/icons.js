/* ============================================================
   J.A.P Senior Services — Animated Icon loader
   Reads <span class="ai-icon" data-icon="<name>" data-loop="false">
   elements, fetches the matching Lottie JSON from assets/icons/<name>.json,
   and plays each animation only when the icon is in the viewport.

   Sequencing: on the FIRST time an icon enters the viewport, the
   initial play is delayed by the cascade's `--seq-offset` — read
   from the icon itself if it carries a reveal, otherwise from the
   closest reveal ancestor. This lets the Lottie play in step with
   the surrounding title / paragraph reveal instead of jumping
   ahead of it.

   Loop behaviour: loop is the DEFAULT. Each cycle finishes, the icon
   pauses for 2 seconds, then plays again. Opt-out per icon with
   `data-loop="false"` to play once. Off-screen icons pause; when they
   come back into view they resume from where they were paused
   (no jump back to frame 0) — the first play is the only one that
   happens at frame 0.

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

  // Kick off the very first play, optionally after the cascade delay.
  // Resolves --seq-offset lazily at this call site so reveals.js has
  // had time to write the cascade values regardless of script order.
  function firstPlay(el) {
    if (el.__hasPlayed || !el.__anim) return;
    const delay = resolveSeqOffset(el);
    clearTimeout(el.__firstTimer);
    if (delay <= 0) {
      el.__anim.goToAndPlay(0, true);
      el.__hasPlayed = true;
      return;
    }
    el.__firstTimer = setTimeout(() => {
      if (el.__anim && el.__inView && !el.__hasPlayed) {
        el.__anim.goToAndPlay(0, true);
        el.__hasPlayed = true;
      }
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
    // NOTE: --seq-offset is resolved lazily at first-play time, not
    // here. Mounting may happen before reveals.js has written the
    // cascade offsets — by the time the icon actually scrolls into
    // view the value is reliably available.

    if (!loopOff) {
      anim.addEventListener('complete', () => scheduleNextLoop(el));
    }
  }

  // Single IntersectionObserver gates ALL animations: play on FIRST enter
  // (delayed by --seq-offset so the icon joins the cascade), pause on
  // exit, and on subsequent re-entries resume from where it was paused
  // rather than jumping back to frame 0.
  const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    for (const e of entries) {
      const el = e.target;
      if (!el.__anim) continue;
      const visible = e.isIntersecting && e.intersectionRatio > IO_THRESHOLD;
      el.__inView = visible;
      if (visible) {
        if (!el.__hasPlayed) {
          // First time in view — honour the cascade delay.
          firstPlay(el);
        } else if (el.__anim.isPaused) {
          // Already played at least once — just pick up where we left
          // off so the user doesn't see the icon flick back to frame 0.
          el.__anim.play();
        }
      } else {
        // Off-screen: pause playback and cancel any pending loop / first-play.
        clearTimeout(el.__loopTimer);
        clearTimeout(el.__firstTimer);
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
