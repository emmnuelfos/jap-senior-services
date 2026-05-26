// Recolor every Lottie JSON in prototype/assets/icons/ — outline-only style:
//   - Strokes (ty:"st")  → JAP Navy (#2D5A91)
//   - Fills   (ty:"fl")  → opacity 0 (transparent, lets the page bg show)
//
// Run after a fresh download from CDN (download-icons.sh) to reset state.

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, 'prototype', 'assets', 'icons');

const NAVY = [45 / 255, 90 / 255, 145 / 255];

function isColorArray(arr) {
  return Array.isArray(arr) && arr.length >= 3 && arr.length <= 4
    && arr.every(n => typeof n === 'number' && n >= 0 && n <= 1);
}

function setColor(c) {
  if (!c || typeof c !== 'object') return;
  if (c.a === 0 && isColorArray(c.k)) {
    const alpha = c.k.length === 4 ? c.k[3] : 1;
    c.k = [NAVY[0], NAVY[1], NAVY[2], alpha];
    return;
  }
  if (c.a === 1 && Array.isArray(c.k)) {
    for (const kf of c.k) {
      if (kf && Array.isArray(kf.s) && isColorArray(kf.s)) {
        const alpha = kf.s.length === 4 ? kf.s[3] : 1;
        kf.s = [NAVY[0], NAVY[1], NAVY[2], alpha];
      }
      if (kf && Array.isArray(kf.e) && isColorArray(kf.e)) {
        const alpha = kf.e.length === 4 ? kf.e[3] : 1;
        kf.e = [NAVY[0], NAVY[1], NAVY[2], alpha];
      }
    }
  }
}

function setOpacityZero(o) {
  if (!o || typeof o !== 'object') return;
  if (o.a === 0) {
    o.k = 0;
    return;
  }
  if (o.a === 1 && Array.isArray(o.k)) {
    for (const kf of o.k) {
      if (kf && typeof kf.s !== 'undefined') kf.s = Array.isArray(kf.s) ? [0] : 0;
      if (kf && typeof kf.e !== 'undefined') kf.e = Array.isArray(kf.e) ? [0] : 0;
    }
  }
}

// Walk the Lottie shape tree. Find every "st" and "fl" item and re-treat it.
function walk(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) walk(item);
    return;
  }
  // Stroke: recolor to navy
  if (node.ty === 'st') {
    setColor(node.c);
  }
  // Fill: drop opacity to 0 (true outline-only look)
  if (node.ty === 'fl') {
    setOpacityZero(node.o);
  }
  // Recurse
  for (const key of Object.keys(node)) {
    const v = node[key];
    if (v && typeof v === 'object') walk(v);
  }
}

const files = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.json'));
let count = 0;
for (const f of files) {
  const p = path.join(ICONS_DIR, f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  walk(data);
  fs.writeFileSync(p, JSON.stringify(data));
  count++;
  process.stdout.write(`  ✓ ${f}\n`);
}
console.log(`\nRecolored ${count} icons — strokes → navy, fills → transparent.`);
