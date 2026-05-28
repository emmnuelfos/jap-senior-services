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
    // Headings: prefer per-line where the markup is simple text only.
    document.querySelectorAll('main h1, main h2, main h3, main .display-l, main .display-xl').forEach(el => {
      if (el.dataset.reveal) return;
      // Skip if the heading contains complex nested elements that span
      // multiple writing directions / are hard to measure (em, br, span are fine).
      el.dataset.reveal = 'lines';
    });
    // Paragraphs and leads: per-line where short, fade for the long ones.
    document.querySelectorAll('main p, main .lead, main .sub, main .eyebrow').forEach(el => {
      if (el.dataset.reveal) return;
      // Skip elements that are part of testimonial cards / footer / nav.
      if (el.closest('.jap-scat__card')) return;
      if (el.closest('.site-footer')) return;
      el.dataset.reveal = el.classList.contains('eyebrow') ? 'fade' : 'lines';
    });
    // Images: clip-path mask reveal — but skip avatars + icons.
    document.querySelectorAll('main img').forEach(el => {
      if (el.dataset.reveal) return;
      if (el.closest('.ta-avatar') || el.matches('.ta-avatar')) return;
      if (el.closest('.ai-icon')) return;
      if (el.closest('.jap-scat__card')) return;       // gallery has its own animation
      if (el.classList.contains('hero-photo')) return; // Ken Burns + parallax already
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

  // Walk a node tree and replace text nodes with word spans,
  // preserving inline element wrappers (em, span, br).
  function wrapTextNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text || !text.trim()) return;
      const frag = document.createDocumentFragment();
      // Split keeping the whitespace tokens so spacing is preserved.
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
    if (node.classList && node.classList.contains('rv-word')) return; // already wrapped
    // Recurse into children, but copy the list first because we'll mutate.
    Array.from(node.childNodes).forEach(wrapTextNodes);
  }

  function splitLines(el) {
    // Save the original markup so we can re-split on resize without
    // losing the source formatting (em, br, etc).
    if (!el.dataset.rvOriginal) el.dataset.rvOriginal = el.innerHTML;
    else el.innerHTML = el.dataset.rvOriginal;

    wrapTextNodes(el);
    measureLines(el);
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
  function boot() {
    autoTag();
    document.querySelectorAll('[data-reveal="lines"]').forEach(splitLines);
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
      document.querySelectorAll('[data-reveal="lines"]').forEach(splitLines);
    }, RESPLIT_DEBOUNCE);
  });

  // Expose for any post-mount injection (e.g. testimonials gallery).
  window.JAP_observeReveal = (el) => {
    if (!el || el.dataset.rvObserved) return;
    el.dataset.rvObserved = '1';
    if (el.dataset.reveal === 'lines') splitLines(el);
    io.observe(el);
  };
})();
