/* ============================================================
   J.A.P Senior Services — Animated Icon loader
   Reads <span class="ai-icon" data-icon="<name>" data-loop="false">
   elements, fetches the matching Lottie JSON from assets/icons/<name>.json,
   and plays each animation when its container enters the viewport.

   Uses the lottie-web library (loaded once from CDN).
   ============================================================ */

(function () {
  'use strict';

  const ICON_DIR = 'assets/icons/';
  const LOTTIE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie_light.min.js';

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

    const loop = el.hasAttribute('data-loop') ? el.getAttribute('data-loop') !== 'false' : false;
    const speed = parseFloat(el.getAttribute('data-speed') || '1');

    const [lottie, data] = await Promise.all([loadLottie(), loadJson(name)]).catch(e => {
      console.error('[icons] failed to load', name, e);
      return [null, null];
    });
    if (!lottie || !data) return;

    const anim = lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: loop,
      autoplay: false,
      animationData: data,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
      },
    });
    anim.setSpeed(speed);

    // Save handle for the IO observer.
    el.__anim = anim;
    el.__hasPlayed = false;
  }

  // Single IntersectionObserver triggers play on viewport entry.
  const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    for (const e of entries) {
      const el = e.target;
      if (!el.__anim) continue;
      if (e.isIntersecting && e.intersectionRatio > 0.15) {
        const loop = el.hasAttribute('data-loop') && el.getAttribute('data-loop') !== 'false';
        if (!el.__hasPlayed || loop) {
          el.__anim.goToAndPlay(0, true);
          el.__hasPlayed = true;
        }
      }
    }
  }, { threshold: [0, 0.15, 0.5] }) : null;

  // Hover trigger — replay on hover regardless of loop setting.
  function attachHover(el) {
    el.addEventListener('mouseenter', () => {
      if (el.__anim) el.__anim.goToAndPlay(0, true);
    });
  }

  // Boot every existing element + watch for any added later.
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

  // Expose for any future dynamic injection.
  window.JAP_mountIcon = async function (el) {
    await mount(el);
    if (io) io.observe(el);
    attachHover(el);
  };
})();
