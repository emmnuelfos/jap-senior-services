// Recolor every Lottie JSON in prototype/assets/icons/ — two-color outline:
//   - Strokes in layers tagged "s2g2" (animatedicons.co's secondary color
//     group) → Brand Red    (#B90E0A)  — accent
//   - All other strokes                            → Deep Navy   (#0D2A6B)  — primary
//   - Fills (ty:"fl")                              → opacity 0 (transparent)
//
// Run after a fresh download from CDN (download-icons.sh) to reset state, OR
// idempotently against the previously-recolored set (the script overwrites
// every stroke colour each pass).

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, 'prototype', 'assets', 'icons');

const NAVY  = [13  / 255,  42 / 255, 107 / 255]; // #0D2A6B (Deep Navy)
const BRASS = [185 / 255,  14 / 255,  10 / 255]; // #B90E0A (Brand Red)

function isColorArray(arr) {
  return Array.isArray(arr) && arr.length >= 3 && arr.length <= 4
    && arr.every(n => typeof n === 'number' && n >= 0 && n <= 1);
}

function applyColor(c, rgb) {
  if (!c || typeof c !== 'object') return;
  if (c.a === 0 && isColorArray(c.k)) {
    const alpha = c.k.length === 4 ? c.k[3] : 1;
    c.k = [rgb[0], rgb[1], rgb[2], alpha];
    return;
  }
  if (c.a === 1 && Array.isArray(c.k)) {
    for (const kf of c.k) {
      if (kf && Array.isArray(kf.s) && isColorArray(kf.s)) {
        const alpha = kf.s.length === 4 ? kf.s[3] : 1;
        kf.s = [rgb[0], rgb[1], rgb[2], alpha];
      }
      if (kf && Array.isArray(kf.e) && isColorArray(kf.e)) {
        const alpha = kf.e.length === 4 ? kf.e[3] : 1;
        kf.e = [rgb[0], rgb[1], rgb[2], alpha];
      }
    }
  }
}

function setOpacityZero(o) {
  if (!o || typeof o !== 'object') return;
  if (o.a === 0) { o.k = 0; return; }
  if (o.a === 1 && Array.isArray(o.k)) {
    for (const kf of o.k) {
      if (kf && typeof kf.s !== 'undefined') kf.s = Array.isArray(kf.s) ? [0] : 0;
      if (kf && typeof kf.e !== 'undefined') kf.e = Array.isArray(kf.e) ? [0] : 0;
    }
  }
}

// Walk a node tree; recolor strokes inside and zero out fill opacity.
// `accent` is true when the enclosing layer is tagged as the accent (s2g2).
function walk(node, accent) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) walk(item, accent);
    return;
  }
  if (node.ty === 'st') applyColor(node.c, accent ? BRASS : NAVY);
  if (node.ty === 'fl') setOpacityZero(node.o);
  for (const key of Object.keys(node)) {
    const v = node[key];
    if (v && typeof v === 'object') walk(v, accent);
  }
}

// Recolor each top-level layer independently so we can check its name.
function recolorLottie(data) {
  if (!Array.isArray(data.layers)) return;
  for (const layer of data.layers) {
    const name = layer.nm || '';
    // animatedicons.co uses _s2g2_ in the layer name to mark the
    // "secondary colour" group — those go brass; the rest go navy.
    const isAccent = /_s2g2(_|\b)/i.test(name);
    walk(layer, isAccent);
  }
}

const files = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.json'));
let count = 0;
for (const f of files) {
  const p = path.join(ICONS_DIR, f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  recolorLottie(data);
  fs.writeFileSync(p, JSON.stringify(data));
  count++;
  process.stdout.write(`  ✓ ${f}\n`);
}
console.log(`\nRecolored ${count} icons — primary navy, accent brass, fills transparent.`);
