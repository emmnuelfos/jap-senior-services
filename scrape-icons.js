// Scrape animated Lottie JSONs from animatedicons.co.
// Uses puppeteer-core with explicit Chrome path; faster + more debuggable.

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, 'prototype', 'assets', 'icons');

const ICONS = [
  ['sun',          'Sun'],
  ['home',         'home'],
  ['towel',        'Towel'],
  ['moon',         'Moon'],
  ['car',          'Car'],
  ['hotel',        'Hotel'],
  ['consultation', 'Consultation'],
  ['tea',          'Tea'],
  ['heart',        'Heart'],
  ['phone',        'phone'],
  ['mission',      'Mission'],
  ['checklist',    'checklist'],
  ['time',         'time'],
  ['calendar',     'calendar'],
  ['certificate',  'Certificate'],
  ['community',    'Community'],
  ['support',      'Support'],
  ['mail',         'mail'],
  ['location',     'location'],
  ['contact',      'contact'],
  ['chat',         'Chat%20V2'],
  ['team',         'Team'],
  ['shield',       'Shield'],
  ['lightbulb',    'lightbulb'],
  ['star',         'Star'],
];

function log(s) { process.stdout.write(s + '\n'); }

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
    ],
  });
  log('Chrome up.');

  let ok = 0, fail = 0;

  for (const [filename, slug] of ICONS) {
    const outPath = path.join(OUT_DIR, `${filename}.json`);
    if (fs.existsSync(outPath)) {
      log(`[skip] ${filename}`);
      continue;
    }

    const page = await browser.newPage();
    // Block heavy resources — we just need the page JS to register lottie.
    await page.setRequestInterception(true);
    page.on('request', req => {
      const rt = req.resourceType();
      if (rt === 'image' || rt === 'media' || rt === 'font') return req.abort();
      req.continue();
    });

    // Hook lottie.loadAnimation BEFORE page JS runs.
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
              if (cfg && cfg.animationData) {
                try { window.__lots__.push(JSON.parse(JSON.stringify(cfg.animationData))); } catch(e){}
              }
              return orig(cfg);
            };
          }
        },
        get() { return _lottie; },
      });
    });

    const url = `https://animatedicons.co/icons/minimalistic/${slug}`;
    try {
      const t0 = Date.now();
      log(`[load] ${filename}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      // Wait briefly for lottie to register.
      await new Promise(r => setTimeout(r, 2500));

      const data = await page.evaluate(() => {
        const lots = (window.__lots__ || []).filter(a => a && Array.isArray(a.layers) && a.layers.length);
        if (lots.length) return lots[0];
        // Fallback — look in NUXT data store.
        try {
          const root = window.__NUXT__ && (window.__NUXT__.state || window.__NUXT__.data);
          const seen = new WeakSet();
          const stack = [root];
          while (stack.length) {
            const v = stack.pop();
            if (!v || typeof v !== 'object' || seen.has(v)) continue;
            seen.add(v);
            if (v.layers && Array.isArray(v.layers) && v.layers.length && v.v) {
              return JSON.parse(JSON.stringify(v));
            }
            for (const k in v) stack.push(v[k]);
          }
        } catch(e){}
        return null;
      });

      if (data) {
        fs.writeFileSync(outPath, JSON.stringify(data));
        const ms = Date.now() - t0;
        const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
        log(`  ✓ ${filename} (${kb} KB, ${ms}ms)`);
        ok++;
      } else {
        log(`  ✗ ${filename} — no animationData found`);
        fail++;
      }
    } catch (e) {
      log(`  ✗ ${filename} — ${e.message}`);
      fail++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  log(`\nDONE. ${ok} ok, ${fail} failed.`);
})();
