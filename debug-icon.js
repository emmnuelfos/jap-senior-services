// Debug a single icon page to find where the real Lottie JSON lives.
const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // Log network requests for .json
  page.on('response', async resp => {
    const url = resp.url();
    if (/\.json($|\?)/.test(url) || /lottie/i.test(url) || /animation/i.test(url)) {
      console.log('[NET]', resp.status(), url);
    }
  });

  // Capture all lottie.loadAnimation calls.
  await page.evaluateOnNewDocument(() => {
    window.__lots__ = [];
    let _lottie = null;
    Object.defineProperty(window, 'lottie', {
      configurable: true,
      set(v) {
        _lottie = v;
        if (v && typeof v.loadAnimation === 'function') {
          const orig = v.loadAnimation.bind(v);
          v.loadAnimation = (cfg) => {
            console.log('[LOTTIE.loadAnimation]', JSON.stringify({
              hasData: !!(cfg && cfg.animationData),
              path: cfg && cfg.path,
              nm: cfg && cfg.animationData && cfg.animationData.nm,
              layers: cfg && cfg.animationData && cfg.animationData.layers && cfg.animationData.layers.length,
            }));
            if (cfg && cfg.animationData) {
              try { window.__lots__.push({ nm: cfg.animationData.nm, layers: cfg.animationData.layers.length, data: cfg.animationData }); } catch(e){}
            }
            return orig(cfg);
          };
        }
      },
      get() { return _lottie; },
    });
  });

  page.on('console', m => console.log('[PAGE]', m.text()));

  console.log('Navigating to /icons/minimalistic/home...');
  await page.goto('https://animatedicons.co/icons/minimalistic/home', { waitUntil: 'domcontentloaded', timeout: 30000 });

  await new Promise(r => setTimeout(r, 8000));

  // Dump all captured lotties.
  const summary = await page.evaluate(() => {
    return (window.__lots__ || []).map(x => ({ nm: x.nm, layers: x.layers, hasV: !!x.data.v }));
  });
  console.log('\n=== ALL CAPTURED LOTTIES ===');
  console.log(JSON.stringify(summary, null, 2));

  // Dump any element-bound lottie data.
  const domLottie = await page.evaluate(() => {
    const els = document.querySelectorAll('lottie-player, [data-anim], [data-lottie]');
    return Array.from(els).map(el => ({
      tag: el.tagName,
      src: el.getAttribute('src') || el.getAttribute('data-src'),
      attrs: Array.from(el.attributes).map(a => a.name + '=' + a.value).slice(0, 5),
    }));
  });
  console.log('\n=== DOM LOTTIE ELEMENTS ===');
  console.log(JSON.stringify(domLottie, null, 2));

  // Look at NUXT store
  const nuxtKeys = await page.evaluate(() => {
    try {
      const s = window.__NUXT__ && (window.__NUXT__.state || window.__NUXT__.data);
      if (!s) return null;
      const out = [];
      const stack = [[s, '$root', 0]];
      const seen = new WeakSet();
      while (stack.length && out.length < 200) {
        const [v, p, d] = stack.pop();
        if (!v || typeof v !== 'object' || seen.has(v) || d > 5) continue;
        seen.add(v);
        if (Array.isArray(v.layers) && v.layers.length && (v.v || v.fr)) {
          out.push({ path: p, nm: v.nm, layers: v.layers.length });
        }
        for (const k in v) stack.push([v[k], p + '.' + k, d + 1]);
      }
      return out;
    } catch(e) { return e.message; }
  });
  console.log('\n=== NUXT STORE LOTTIE OBJECTS ===');
  console.log(JSON.stringify(nuxtKeys, null, 2));

  await browser.close();
})();
