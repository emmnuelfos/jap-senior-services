/* ============================================================
   J.A.P Senior Services — Reveals system
   Premium per-line + image + element reveal animations,
   re-triggered every time the host section enters the viewport.

   Mark an element with one of:
     data-reveal="lines"   →  wrap every word in a span, group by
                              measured line, slide each line up
                              with staggered delay
     data-reveal="fade"    →  fade + slide-up the whole element
     data-reveal="image"   →  clip-path mask reveal (left → right)
     data-reveal="slide"   →  slide in from the left
   Auto-discovery is also applied (see autoTag below).

   Behaviour on each viewport entry/exit:
     enter  →  add `is-revealed`, animations play
     exit   →  remove `is-revealed`, animation state resets so the
               next entry plays the reveal again
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
    // Images: clip-path mask reveal — only for big standalone photos.
    // Cards, timeline steps, testimonials etc. have their own treatments
    // (hover scale, card lift) so we don't double-animate.
    document.querySelectorAll('main img').forEach(el => {
      if (el.dataset.reveal) return;
      if (el.closest('.ta-avatar') || el.matches('.ta-avatar')) return;
      if (el.closest('.ai-icon')) return;
      if (el.closest('.jap-scat__card')) return;       // gallery has its own animation
      if (el.classList.contains('hero-photo')) return; // Ken Burns + parallax already
      if (el.closest('.service-card')) return;         // cards animate on hover
      if (el.closest('.timeline-step')) return;        // how-it-works steps
      if (el.closest('.testimonial')) return;          // testimonial cards
      if (el.closest('.dedication-card')) return;      // about page dedication
      if (el.closest('.cta-band-photo')) return;       // CTA band photo has its own mask
      if (el.closest('[data-hero-parallax]')) return;  // hero parallax photos
      el.dataset.reveal = 'image';
    });
    // Buttons: gentle fade-up with stagger.
    document.querySelectorAll('main .btn, main a.link-arrow, main .ctas a').forEach(el => {
      if (el.dataset.reveal) return;
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
  // 3) INTERSECTION OBSERVER — replays on every entry
  // ----------------------------------------------------------------
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const el = e.target;
      if (e.isIntersecting && e.intersectionRatio > IO_ENTER) {
        // Force a reflow before re-adding so the transition restarts cleanly.
        el.classList.remove('is-revealed');
        void el.offsetWidth;
        el.classList.add('is-revealed');
      } else if (!e.isIntersecting) {
        el.classList.remove('is-revealed');
      }
    });
  }, { threshold: [0, IO_ENTER, 0.5] });

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
  // Timing constants below must stay in sync with the CSS values for
  // [data-reveal="letters"], [data-reveal="words"], [data-reveal="fade"]
  // and [data-reveal="slide"]. If one changes, update the other.
  const LETTER_STAGGER  = 28;
  const LETTER_DURATION = 720;
  const WORD_STAGGER    = 72;
  const WORD_DURATION   = 1400;
  const FADE_DURATION   = 900;
  const SLIDE_DURATION  = 900;
  const IMAGE_DURATION  = 1200;

  function fullDuration(el) {
    const type = el.dataset.reveal;
    if (type === 'letters') {
      const n = el.querySelectorAll('.rv-letter').length;
      return Math.max(0, n - 1) * LETTER_STAGGER + LETTER_DURATION;
    }
    if (type === 'words') {
      const n = el.querySelectorAll('.rv-word').length;
      return Math.max(0, n - 1) * WORD_STAGGER + WORD_DURATION;
    }
    if (type === 'image') return IMAGE_DURATION;
    if (type === 'slide') return SLIDE_DURATION;
    return FADE_DURATION;
  }

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

  function sequenceGrids() {
    GRID_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(grid => {
        let cellOffset = 0;
        Array.from(grid.children).forEach(cell => {
          const reveals = cell.querySelectorAll('[data-reveal]');
          if (reveals.length === 0) return;

          // First compute the cell's internal end time using whatever
          // sibling-chain offsets sequenceContent() already assigned.
          let cellEnd = 0;
          reveals.forEach(el => {
            const localOffset = parseFloat(el.style.getPropertyValue('--seq-offset')) || 0;
            const end = localOffset + fullDuration(el);
            if (end > cellEnd) cellEnd = end;
          });

          // Then shift every reveal inside the cell by the cumulative
          // cellOffset so cell N starts when cell N-1's content ended.
          reveals.forEach(el => {
            const localOffset = parseFloat(el.style.getPropertyValue('--seq-offset')) || 0;
            el.style.setProperty('--seq-offset', (localOffset + cellOffset) + 'ms');
          });

          cellOffset += cellEnd;
        });
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

      // Special case: two consecutive paragraphs share the same offset.
      // The second one starts at the same moment as the first instead of
      // waiting for it to finish — its own internal per-word stagger is
      // enough motion; piling another wait on top makes long sections
      // feel sluggish (the About Us section was the obvious offender).
      if (type === 'words' && prevType === 'words') {
        el.style.setProperty('--seq-offset', prevOffset + 'ms');
        return;
      }

      // Otherwise chain normally: this element starts when the previous
      // sibling's animation has fully completed. That keeps titles and
      // titles+paragraphs flowing in clear DOM hierarchy (top to bottom).
      el.style.setProperty('--seq-offset', (prevOffset + fullDuration(prev)) + 'ms');
    });
  }

  function boot() {
    autoTag();
    document.querySelectorAll('[data-reveal="lines"]').forEach(splitLines);
    document.querySelectorAll('[data-reveal="letters"]').forEach(splitLetters);
    document.querySelectorAll('[data-reveal="words"]').forEach(splitWords);
    sequenceContent();
    sequenceGrids();
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
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
    io.observe(el);
  };
})();
