/* ============================================================
   J.A.P Senior Services — Reveals system
   Premium per-line + image + element reveal animations,
   played ONCE the first time the host element enters the viewport.

   Mark an element with one of:
     data-reveal="lines"   →  wrap every word in a span, group by
                              measured line, slide each line up
                              with staggered delay
     data-reveal="fade"    →  fade + slide-up the whole element
     data-reveal="image"   →  clip-path mask reveal (left → right)
     data-reveal="slide"   →  slide in from the left
   Auto-discovery is also applied (see autoTag below).

   Behaviour:
     first entry  →  add `is-revealed`, animations play, observer
                     unhooks the element so the reveal never replays
     re-entry     →  no-op (the testimonials gallery has its own
                     replay loop in testimonials.js — this file is
                     strictly one-shot)
   ============================================================ */

(function () {
  'use strict';

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Honour reduced-motion: skip reveals entirely.
    document.documentElement.classList.add('reveals-off');
    return;
  }

  const IO_ENTER = 0.12;          // require 12% of element visible to play
  const RESPLIT_DEBOUNCE = 180;   // resize debounce for re-measuring lines

  // ----------------------------------------------------------------
  // 1) AUTO-TAGGING
  //    Decorate common elements with sensible default data-reveal
  //    values, unless the author specified one explicitly.
  // ----------------------------------------------------------------
  function autoTag() {
    // Headings: per-letter fall-in (3D rotateX + translateY + opacity)
    // with a per-letter stagger. Editorial entrance that doesn't change
    // the rest state — final type is identical to the original. Applied
    // to every heading level h1–h6 plus the display utility classes.
    document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6, main .display-l, main .display-xl, main .display-m').forEach(el => {
      if (el.dataset.reveal) return;
      el.dataset.reveal = 'letters';
    });
    // Paragraphs and leads: per-word wave entrance (slide up + soft
    // blur drop, staggered by absolute word index). Eyebrows use fade.
    document.querySelectorAll('main p, main .lead, main .sub, main .eyebrow').forEach(el => {
      if (el.dataset.reveal) return;
      if (el.closest('.jap-scat__card')) return;
      if (el.closest('.site-footer')) return;
      el.dataset.reveal = el.classList.contains('eyebrow') ? 'fade' : 'words';
    });
    // Images: clip-path mask reveal. Skipped only for elements that
    // already have their own bespoke animation pipeline (avatars,
    // scattered gallery, hero parallax, CTA band mask) — the rest get
    // the standard image reveal, including service / timeline /
    // dedication card photos. The card hover scale still works on top
    // of the reveal because hover specificity wins after the initial
    // is-revealed transform: scale(1) has landed.
    document.querySelectorAll('main img').forEach(el => {
      if (el.dataset.reveal) return;
      if (el.closest('.ta-avatar') || el.matches('.ta-avatar')) return;
      if (el.closest('.ai-icon')) return;
      if (el.closest('.jap-scat__card')) return;       // gallery has its own animation
      if (el.classList.contains('hero-photo')) return; // Ken Burns + parallax already
      if (el.closest('.cta-band-photo')) return;       // CTA band photo has its own mask
      if (el.closest('[data-hero-parallax]')) return;  // hero parallax photos
      el.dataset.reveal = 'image';
    });
    // Buttons: gentle fade-up with stagger.
    document.querySelectorAll('main .btn, main a.link-arrow, main .ctas a').forEach(el => {
      if (el.dataset.reveal) return;
      el.dataset.reveal = 'fade';
    });
    // Animated icons: fade in like the other reveals so they join the
    // cascade. Skip icons that already live inside another reveal
    // element (eyebrows, leads etc.) — those would double-animate.
    // This block runs LAST so the closest-ancestor check sees the
    // tagging applied above.
    document.querySelectorAll('main .ai-icon').forEach(el => {
      if (el.dataset.reveal) return;
      const ancestor = el.parentElement && el.parentElement.closest('[data-reveal]');
      if (ancestor) return;
      el.dataset.reveal = 'fade';
    });
  }

  // ----------------------------------------------------------------
  // 2) PER-LINE SPLITTING
  //    For elements with data-reveal="lines" we wrap every word in
  //    a <span class="rv-word">, then measure their offsetTop to
  //    assign each word a "--line-i" CSS variable. The CSS animates
  //    every word with `transition-delay: calc(var(--line-i) * 70ms)`,
  //    producing a clean per-line stagger.
  // ----------------------------------------------------------------

  // Walk a node tree and replace text nodes with WORD spans,
  // preserving inline element wrappers (em, span, br).
  function wrapTextNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text || !text.trim()) return;
      const frag = document.createDocumentFragment();
      const parts = text.split(/(\s+)/);
      parts.forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) {
          frag.appendChild(document.createTextNode(p));
        } else {
          const span = document.createElement('span');
          span.className = 'rv-word';
          span.textContent = p;
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.tagName === 'BR') return;
    if (node.classList && node.classList.contains('rv-word')) return;
    Array.from(node.childNodes).forEach(wrapTextNodes);
  }

  // Walk a node tree and replace text nodes with LETTER spans.
  // Whitespace is preserved as text nodes between letters (NOT wrapped).
  // Each letter span keeps a non-breaking layout via inline-block, and
  // sets a --letter-i CSS variable for its absolute index.
  function wrapTextNodesByLetter(node, counter) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text) return;
      const frag = document.createDocumentFragment();
      for (const ch of text) {
        if (/\s/.test(ch)) {
          frag.appendChild(document.createTextNode(ch));
        } else {
          const span = document.createElement('span');
          span.className = 'rv-letter';
          span.style.setProperty('--letter-i', counter.n++);
          span.textContent = ch;
          frag.appendChild(span);
        }
      }
      node.parentNode.replaceChild(frag, node);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.tagName === 'BR') return;
    if (node.classList && node.classList.contains('rv-letter')) return;
    Array.from(node.childNodes).forEach(child => wrapTextNodesByLetter(child, counter));
  }

  // Stash the original text as aria-label so screen readers announce
  // the heading or paragraph as a single string, then mark every
  // wrapping span aria-hidden so AT skips the per-character/per-word
  // pieces. SEO is unaffected (heading tag and textContent stay intact)
  // and visual users see the same animation.
  function applyA11yLabel(el) {
    if (el.hasAttribute('aria-label')) return;
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (text) el.setAttribute('aria-label', text);
  }
  function hideSpansFromAT(el, selector) {
    el.querySelectorAll(selector).forEach(s => s.setAttribute('aria-hidden', 'true'));
  }

  function splitLetters(el) {
    if (!el.dataset.rvOriginal) el.dataset.rvOriginal = el.innerHTML;
    else el.innerHTML = el.dataset.rvOriginal;
    applyA11yLabel(el);
    const counter = { n: 0 };
    wrapTextNodesByLetter(el, counter);
    el.style.setProperty('--rv-letters', counter.n);
    hideSpansFromAT(el, '.rv-letter');
  }

  function splitWords(el) {
    if (!el.dataset.rvOriginal) el.dataset.rvOriginal = el.innerHTML;
    else el.innerHTML = el.dataset.rvOriginal;
    applyA11yLabel(el);
    wrapTextNodes(el);
    // Assign an absolute index per word so CSS can stagger per word.
    const words = el.querySelectorAll('.rv-word');
    words.forEach((w, i) => w.style.setProperty('--word-i', i));
    el.style.setProperty('--rv-words', words.length);
    hideSpansFromAT(el, '.rv-word');
  }

  function splitLines(el) {
    // Save the original markup so we can re-split on resize without
    // losing the source formatting (em, br, etc).
    if (!el.dataset.rvOriginal) el.dataset.rvOriginal = el.innerHTML;
    else el.innerHTML = el.dataset.rvOriginal;
    applyA11yLabel(el);
    wrapTextNodes(el);
    measureLines(el);
    hideSpansFromAT(el, '.rv-word');
  }

  function measureLines(el) {
    const words = el.querySelectorAll('.rv-word');
    if (!words.length) return;
    const tops = new Map();
    let line = 0;
    words.forEach(w => {
      const top = Math.round(w.offsetTop);
      if (!tops.has(top)) tops.set(top, line++);
      w.style.setProperty('--line-i', tops.get(top));
    });
    el.style.setProperty('--rv-lines', line);
  }

  // ----------------------------------------------------------------
  // 3) INTERSECTION OBSERVER — plays ONCE per element
  //    First time an element crosses IO_ENTER we add `is-revealed`
  //    and stop observing it. The reveal never replays on re-entry.
  //    The testimonials gallery handles its own scatter replay in
  //    testimonials.js, so this strict one-shot behaviour is what
  //    the rest of the site uses.
  //
  //    Special-case for data-reveal="image": Chromium's IntersectionObserver
  //    computes ratio against the rendered (clipped) rect, not the layout
  //    box, so an img that starts at clip-path: inset(0 100% 0 0) has zero
  //    visible area and the observer never fires for it — a deadlock.
  //    We observe the img's parent wrapper instead and add `is-revealed`
  //    to the img when the wrapper crosses the threshold. The img's own
  //    layout box is irrelevant for triggering; only the wrapper's matters.
  // ----------------------------------------------------------------
  // Map from observed element → element that should receive is-revealed.
  // Most of the time these are the same element; for image reveals the
  // observed element is the parent wrapper but the reveal target is the
  // img child.
  const revealTargets = new WeakMap();

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const observed = e.target;
      if (e.isIntersecting && e.intersectionRatio > IO_ENTER) {
        const target = revealTargets.get(observed) || observed;
        target.classList.add('is-revealed');
        io.unobserve(observed);
      }
    });
  }, { threshold: [0, IO_ENTER, 0.5] });

  // Observe an element with the appropriate strategy. For image reveals
  // we step up to the parent so clip-path on the img doesn't blind the
  // observer. For every other type we observe the element directly.
  function observeReveal(el) {
    if (el.dataset.reveal === 'image' && el.parentElement) {
      revealTargets.set(el.parentElement, el);
      io.observe(el.parentElement);
    } else {
      io.observe(el);
    }
  }

  // ----------------------------------------------------------------
  // 4) BOOT
  //    Wait for fonts to load before splitting so line measurements
  //    are correct. Then auto-tag, split, observe.
  // ----------------------------------------------------------------
  // Sequence consecutive sibling reveal elements (titles, paragraphs,
  // eyebrows, buttons) so they play one after the other inside a section
  // instead of all firing simultaneously. Each element gets a
  // --seq-offset that equals the previous sibling's (offset + its full
  // animation duration). The matching CSS rules add that offset on top
  // of any per-letter / per-word stagger.
  //
  // Fixed step between consecutive reveal elements — every reveal
  // (icons, titles, paragraphs, buttons) starts 200 ms after the
  // previous one *started*, not after it finished. Same uniform beat
  // across the page per client direction, so paragraph-to-paragraph
  // doesn't pause to wait out the previous paragraph's full word
  // wave.
  const SEQ_STEP  = 200;
  const PARA_STEP = 200;

  // Grid containers: chain each child cell's reveal start time so cell 2
  // begins where cell 1's internal animation finished, cell 3 after cell 2,
  // and so on. The numbered storyboard the client supplied (1→11 across
  // hero + value strip) is this exact behaviour applied to every grid.
  const GRID_SELECTORS = [
    '.value-strip',         // homepage 4-cell social proof
    '.service-grid',        // homepage 6 program cards
    '.stats-band-grid',     // stats break — 4 stats cells
    '.step-ribbon',         // how-it-works — 3 numbered steps
    '.timeline',            // how-it-works page — 4 timeline steps
    '.stories-2up',         // legacy two-up testimonial layout
    '.split-story',         // story-preview split (photo + copy)
    '.principles',          // deck principles grid
    '.cta-band-grid'        // CTA band (copy + photo)
  ];

  // Tight stagger between consecutive image reveals — independent of
  // the main text cascade so a row of card photos doesn't have to wait
  // for every preceding cell's title + paragraph to finish first.
  const IMG_STEP = 100;

  // Per-type cell-to-cell stagger inside a grid. Each cell's icon /
  // title / paragraph runs in its OWN track across the grid at a
  // tight 100 ms beat, so card 5's title doesn't have to wait for
  // card 1-4 to finish their full per-cell cascade first. The base
  // offset between types (0 / 200 / 400) preserves the
  // icon → title → paragraph reading order inside each card.
  const TYPE_STEP   = 100;
  const TYPE_BASE   = {
    fade:    0,    // icons + buttons
    letters: 200,  // headings
    words:   400,  // paragraphs
  };

  function sequenceGrids() {
    GRID_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(grid => {
        // For each reveal TYPE, find every reveal of that type inside
        // the grid in DOM order and assign --seq-offset =
        // (typeBase + i * TYPE_STEP). The shared base offset means
        // titles always trail their card's icon by ~200 ms, and
        // paragraphs trail their card's title by ~200 ms, while every
        // card's icon (and every card's title, etc.) cascades through
        // the grid at one consistent 100 ms beat.
        Object.entries(TYPE_BASE).forEach(([type, base]) => {
          const items = grid.querySelectorAll('[data-reveal="' + type + '"]');
          items.forEach((el, i) => {
            el.style.setProperty('--seq-offset', (base + i * TYPE_STEP) + 'ms');
          });
        });

        // Image cascade — same tight 100 ms beat starting at 0.
        // Applied after the type cascade so it always wins for images
        // (even though "image" isn't in TYPE_BASE — being explicit
        // here insulates the image step from any future TYPE_BASE
        // changes).
        const imgs = grid.querySelectorAll('img[data-reveal="image"]');
        imgs.forEach((img, i) => {
          img.style.setProperty('--seq-offset', (i * IMG_STEP) + 'ms');
        });

        // Trailing link-arrows ("More about us →" / "See all services
        // →") share the fade type with icons but sit at the BOTTOM of
        // their cell. Push them past the paragraph track so they don't
        // flash in alongside the icons at offset 0–500. Each trailing
        // link gets offset = (last words-track slot) + TYPE_STEP.
        const tailLinks = grid.querySelectorAll('a.link-arrow[data-reveal="fade"]');
        if (tailLinks.length) {
          const wordsCount = grid.querySelectorAll('[data-reveal="words"]').length;
          const tailBase   = TYPE_BASE.words + wordsCount * TYPE_STEP;
          tailLinks.forEach((link, i) => {
            link.style.setProperty('--seq-offset', (tailBase + i * TYPE_STEP) + 'ms');
          });
        }
      });
    });
  }

  function sequenceContent() {
    document.querySelectorAll('[data-reveal]').forEach(el => {
      // Walk backwards through siblings to find the nearest previous
      // element that also has a reveal.
      let prev = el.previousElementSibling;
      while (prev && !prev.matches('[data-reveal]')) {
        prev = prev.previousElementSibling;
      }
      if (!prev) {
        el.style.setProperty('--seq-offset', '0ms');
        return;
      }
      const type     = el.dataset.reveal;
      const prevType = prev.dataset.reveal;
      const prevOffset = parseFloat(prev.style.getPropertyValue('--seq-offset')) || 0;

      // Paragraph after paragraph gets the larger PARA_STEP so the
      // hierarchy reads top-to-bottom. Everything else uses the
      // tight SEQ_STEP.
      const step = (type === 'words' && prevType === 'words') ? PARA_STEP : SEQ_STEP;
      el.style.setProperty('--seq-offset', (prevOffset + step) + 'ms');
    });
  }

  function boot() {
    autoTag();
    document.querySelectorAll('[data-reveal="lines"]').forEach(splitLines);
    document.querySelectorAll('[data-reveal="letters"]').forEach(splitLetters);
    document.querySelectorAll('[data-reveal="words"]').forEach(splitWords);
    sequenceContent();
    sequenceGrids();
    document.querySelectorAll('[data-reveal]').forEach(observeReveal);
  }

  function ready() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(boot).catch(boot);
    } else {
      boot();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }

  // ----------------------------------------------------------------
  // 5) RESIZE — re-measure lines so the split tracks layout changes.
  // ----------------------------------------------------------------
  let rsz;
  window.addEventListener('resize', () => {
    clearTimeout(rsz);
    rsz = setTimeout(() => {
      // Only the line-split needs re-measuring on resize; letter and
      // word splits are layout-independent because their stagger uses
      // absolute indices, not measured positions.
      document.querySelectorAll('[data-reveal="lines"]').forEach(splitLines);
      // Re-sequencing is cheap — keep it in sync in case content changed.
      sequenceContent();
      sequenceGrids();
    }, RESPLIT_DEBOUNCE);
  });

  // Expose for any post-mount injection (e.g. testimonials gallery).
  window.JAP_observeReveal = (el) => {
    if (!el || el.dataset.rvObserved) return;
    el.dataset.rvObserved = '1';
    if (el.dataset.reveal === 'lines')   splitLines(el);
    if (el.dataset.reveal === 'letters') splitLetters(el);
    if (el.dataset.reveal === 'words')   splitWords(el);
    observeReveal(el);
  };
})();
