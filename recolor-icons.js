// Recolor every Lottie JSON in prototype/assets/icons/ to JAP Navy (#2D5A91).
// Walks each file recursively and replaces every color value with our brand.

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, 'prototype', 'assets', 'icons');

// JAP Navy normalized to 0-1 RGB.
const NAVY = [45 / 255, 90 / 255, 145 / 255];

function isColorArray(arr) {
  return Array.isArray(arr) && arr.length >= 3 && arr.length <= 4
    && arr.every(n => typeof n === 'number' && n >= 0 && n <= 1);
}

// Recursively walk an object and replace color values.
// Lottie color shape: { a: 0, k: [r,g,b,a], ix: N }  (static)
//                     { a: 1, k: [keyframes] }       (animated, rare in simple icons)
function recolor(obj, parentKey = null) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) recolor(item, parentKey);
    return;
  }
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    // Static color (most common in icons): { a: 0, k: [r,g,b,a] }
    if (key === 'c' && v && typeof v === 'object' && v.a === 0 && isColorArray(v.k)) {
      const alpha = v.k.length === 4 ? v.k[3] : 1;
      v.k = [NAVY[0], NAVY[1], NAVY[2], alpha];
      continue;
    }
    // Static color in a Solid layer: { sc: "#hex" }
    if (key === 'sc' && typeof v === 'string' && v.startsWith('#')) {
      obj.sc = '#2D5A91';
      continue;
    }
    // Animated color keyframes: { a: 1, k: [{s: [r,g,b,a], ...}, ...] }
    if (key === 'c' && v && typeof v === 'object' && v.a === 1 && Array.isArray(v.k)) {
      for (const kf of v.k) {
        if (kf && Array.isArray(kf.s) && isColorArray(kf.s)) {
          const alpha = kf.s.length === 4 ? kf.s[3] : 1;
          kf.s = [NAVY[0], NAVY[1], NAVY[2], alpha];
        }
        if (kf && Array.isArray(kf.e) && isColorArray(kf.e)) {
          const alpha = kf.e.length === 4 ? kf.e[3] : 1;
          kf.e = [NAVY[0], NAVY[1], NAVY[2], alpha];
        }
      }
      continue;
    }
    if (v && typeof v === 'object') recolor(v, key);
  }
}

const files = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.json'));
let count = 0;
for (const f of files) {
  const p = path.join(ICONS_DIR, f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  recolor(data);
  fs.writeFileSync(p, JSON.stringify(data));
  count++;
  process.stdout.write(`  ✓ ${f}\n`);
}
console.log(`\nRecolored ${count} icons to JAP Navy (#2D5A91).`);
