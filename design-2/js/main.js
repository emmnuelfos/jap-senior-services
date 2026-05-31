/* =================================================================
   J.A.P. Senior Care Services — interactions
   Elegant, lightweight, accessible. Respects prefers-reduced-motion.
   ================================================================= */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Header shrink on scroll ---- */
  var header = document.getElementById("header");
  var onScroll = function () {
    if (header) header.classList.toggle("scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile nav ---- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  function setNav(open) {
    if (!nav || !burger) return;
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open && window.innerWidth <= 900 ? "hidden" : "";
  }
  if (burger) {
    burger.addEventListener("click", function () {
      setNav(burger.getAttribute("aria-expanded") !== "true");
    });
  }
  if (nav) {
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) setNav(false);
  });

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Count-up stats ---- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var numSpan = el.querySelector(".num");
    if (!numSpan) return;
    if (reduceMotion) { numSpan.textContent = target; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      numSpan.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
      else numSpan.textContent = target;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); co.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* ---- Lottie icons (lazy, brand-recolored, play-once) ----
     One shared loader. loop:false everywhere so animations settle static at rest
     (no perpetual rAF → keeps the main thread free and screenshots/paints fast).
     Replays once on hover of the parent card/tab. */
  window.__japLoadLottie = function (node, opts) {
    opts = opts || {};
    if (!node || node.dataset.loaded || typeof lottie === "undefined") return node && node._lottie;
    node.dataset.loaded = "1";
    var anim = lottie.loadAnimation({
      container: node, renderer: "svg", loop: false,
      autoplay: opts.autoplay != null ? opts.autoplay : !reduceMotion,
      path: node.getAttribute("data-lottie")
    });
    anim.addEventListener("DOMLoaded", function () {
      if (reduceMotion || opts.autoplay === false) anim.goToAndStop(anim.totalFrames - 1, true);
    });
    node._lottie = anim;
    var card = node.closest(".feature") || node.closest(".svc-tab") || node;
    card.addEventListener("mouseenter", function () { if (!reduceMotion) anim.goToAndPlay(0); });
    return anim;
  };

  function bootFeatureLottie() {
    if (typeof lottie === "undefined") { return setTimeout(bootFeatureLottie, 120); }
    var nodes = document.querySelectorAll(".feature__icon[data-lottie]");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) { nodes.forEach(function (n) { window.__japLoadLottie(n); }); return; }
    var lo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { window.__japLoadLottie(entry.target); lo.unobserve(entry.target); }
      });
    }, { rootMargin: "150px" });
    nodes.forEach(function (n) { lo.observe(n); });
  }
  bootFeatureLottie();

  /* ---- Subtle hero parallax (pointer + scroll), motion-safe ---- */
  if (!reduceMotion) {
    var photo = document.querySelector(".hero__photo");
    var card = document.querySelector(".hero__card");
    var hero = document.querySelector(".hero");
    var blobs = Array.prototype.slice.call(document.querySelectorAll(".hero__blob-svg"));
    if (hero) {
      // smooth eased follow so the blobs glide toward the pointer instead of snapping
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      function tick() {
        cx += (tx - cx) * 0.06;
        cy += (ty - cy) * 0.06;
        if (photo) photo.style.transform = "translate(" + cx * 10 + "px," + cy * 10 + "px)";
        if (card) card.style.transform = "translate(" + cx * -16 + "px," + cy * -16 + "px)";
        blobs.forEach(function (b) {
          var d = parseFloat(b.getAttribute("data-depth")) || 0.05;
          // px/py compose with the CSS drift keyframes (which use `translate`)
          b.style.setProperty("--px", (cx * d * 1400) + "px");
          b.style.setProperty("--py", (cy * d * 1400) + "px");
        });
        if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) { raf = requestAnimationFrame(tick); }
        else { raf = null; }
      }
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5;
        ty = (e.clientY - r.top) / r.height - 0.5;
        if (!raf) raf = requestAnimationFrame(tick);
      });
      hero.addEventListener("pointerleave", function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(tick);
      });
    }
  }

  /* ---- Services: icon-tab accordion + prev/next paging ---- */
  (function () {
    var track = document.getElementById("svcTrack");
    if (!track) return;
    var tabs = Array.prototype.slice.call(track.querySelectorAll(".svc-tab"));
    var panels = Array.prototype.slice.call(document.querySelectorAll(".svc-panel"));
    var prev = document.getElementById("svcPrev");
    var next = document.getElementById("svcNext");
    var page = 0;

    function perPage() {
      var w = window.innerWidth;
      if (w <= 560) return 2;
      if (w <= 760) return 3;
      if (w <= 1024) return 4;
      return 5;
    }
    function maxPage() { return Math.max(0, Math.ceil(tabs.length / perPage()) - 1); }

    var viewport = track.parentElement;   // .svc-tabs__viewport
    function layout() {
      page = Math.min(page, maxPage());
      // shift the track left by whole viewport-widths (+ the inter-tab gap) per page
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "12") || 12;
      var shift = page * (viewport.clientWidth + gap);
      track.style.transform = "translateX(-" + shift + "px)";
      if (prev) prev.disabled = page <= 0;
      if (next) next.disabled = page >= maxPage();
    }

    function goToTabPage(idx) {
      var pp = perPage();
      var targetPage = Math.floor(idx / pp);
      if (targetPage !== page) { page = targetPage; layout(); }
    }

    function activate(tab, focusPanel) {
      var id = tab.getAttribute("data-svc");
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
      });
      panels.forEach(function (p) {
        var on = p.id === "svc-" + id;
        p.classList.toggle("is-active", on);
        if (on) { p.hidden = false; } else { p.hidden = true; }
      });
      // replay the active tab's lottie
      var ic = tab.querySelector(".svc-tab__ic");
      if (ic && ic._lottie && !reduceMotion) ic._lottie.goToAndPlay(0);
      if (focusPanel) {
        var panel = document.getElementById("svc-" + id);
        if (panel) panel.focus({ preventScroll: true });
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { activate(tab); goToTabPage(i); });
      tab.addEventListener("keydown", function (e) {
        var idx = tabs.indexOf(tab), n = tabs.length;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); var t = tabs[(idx + 1) % n]; t.focus(); activate(t); goToTabPage((idx + 1) % n); }
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); var t2 = tabs[(idx - 1 + n) % n]; t2.focus(); activate(t2); goToTabPage((idx - 1 + n) % n); }
        else if (e.key === "Home") { e.preventDefault(); tabs[0].focus(); activate(tabs[0]); goToTabPage(0); }
        else if (e.key === "End") { e.preventDefault(); tabs[n - 1].focus(); activate(tabs[n - 1]); goToTabPage(n - 1); }
      });
    });

    if (prev) prev.addEventListener("click", function () { if (page > 0) { page--; layout(); } });
    if (next) next.addEventListener("click", function () { if (page < maxPage()) { page++; layout(); } });

    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(layout, 150); });
    layout();

    // Eager-load all 11 tab icons when the services section first enters view.
    // loop:false means they play once then settle static — no perf cost at rest.
    function loadAllIcons() {
      if (typeof lottie === "undefined") { return setTimeout(loadAllIcons, 120); }
      tabs.forEach(function (tab) {
        var ic = tab.querySelector(".svc-tab__ic");
        // only the active icon autoplays; the rest load paused on first frame
        var on = tab.classList.contains("is-active");
        var anim = window.__japLoadLottie(ic, { autoplay: on && !reduceMotion });
        if (anim && !on && !reduceMotion) anim.addEventListener("DOMLoaded", function(){ anim.goToAndStop(0, true); });
      });
    }
    if ("IntersectionObserver" in window) {
      var sec = document.getElementById("services");
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { loadAllIcons(); so.disconnect(); } });
      }, { rootMargin: "200px" });
      so.observe(sec);
    } else {
      loadAllIcons();
    }
  })();

  /* ---- Animated check icons (Lottie, play-once, replay on hover) ---- */
  (function () {
    var nodes = document.querySelectorAll(".chk[data-check]");
    if (!nodes.length) return;
    function load(node) {
      if (node.dataset.loaded || typeof lottie === "undefined") return;
      node.dataset.loaded = "1";
      var anim = lottie.loadAnimation({
        container: node, renderer: "svg", loop: false,
        autoplay: !reduceMotion, path: "/assets/lottie/check.json"
      });
      anim.addEventListener("DOMLoaded", function () {
        if (reduceMotion) anim.goToAndStop(anim.totalFrames - 1, true);
      });
      node._lottie = anim;
      var host = node.closest("li") || node.closest(".hero__trust") || node;
      host.addEventListener("mouseenter", function () { if (!reduceMotion) anim.goToAndPlay(0); });
    }
    function boot() {
      if (typeof lottie === "undefined") { return setTimeout(boot, 120); }
      if (!("IntersectionObserver" in window)) { nodes.forEach(load); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { load(e.target); io.unobserve(e.target); } });
      }, { rootMargin: "140px" });
      nodes.forEach(function (n) { io.observe(n); });
    }
    boot();
  })();

  /* ---- Animated check icons (Lottie, play-once, replay on hover) ---- */
  (function () {
    var nodes = document.querySelectorAll(".chk[data-check]");
    if (!nodes.length) return;
    function load(node) {
      if (node.dataset.loaded || typeof lottie === "undefined") return;
      node.dataset.loaded = "1";
      var anim = lottie.loadAnimation({
        container: node, renderer: "svg", loop: false,
        autoplay: !reduceMotion, path: "/assets/lottie/check.json"
      });
      anim.addEventListener("DOMLoaded", function () {
        if (reduceMotion) anim.goToAndStop(anim.totalFrames - 1, true);
      });
      node._lottie = anim;
      var host = node.closest("li") || node.closest(".hero__trust") || node;
      host.addEventListener("mouseenter", function () { if (!reduceMotion) anim.goToAndPlay(0); });
    }
    function boot() {
      if (typeof lottie === "undefined") { return setTimeout(boot, 120); }
      if (!("IntersectionObserver" in window)) { nodes.forEach(load); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { load(e.target); io.unobserve(e.target); } });
      }, { rootMargin: "140px" });
      nodes.forEach(function (n) { io.observe(n); });
    }
    boot();
  })();

  /* ---- FAQ accordion ---- */
  (function () {
    var items = document.querySelectorAll(".acc-item");
    if (!items.length) return;
    items.forEach(function (item) {
      var btn = item.querySelector(".acc-q button");
      var panel = item.querySelector(".acc-a");
      if (!btn || !panel) return;
      btn.addEventListener("click", function () {
        var open = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
        panel.hidden = false;            // keep in DOM; CSS animates via .open
      });
    });
  })();

  /* ---- Homepage hero + areas strip = 100vh (above the fold) ---- */
  (function () {
    var hero = document.querySelector(".hero:not(.hero--inner)");
    var strip = document.querySelector(".areas-strip");
    if (!hero || !strip) return;
    function fit() {
      if (window.innerWidth >= 768) {
        hero.classList.add("hero--fill");
        // total of hero + strip == viewport height
        hero.style.minHeight = Math.max(0, window.innerHeight - strip.offsetHeight) + "px";
      } else {
        hero.classList.remove("hero--fill");
        hero.style.minHeight = "";
      }
    }
    fit();
    var ft;
    window.addEventListener("resize", function () { clearTimeout(ft); ft = setTimeout(fit, 100); });
    window.addEventListener("load", fit);   // recompute once fonts/images settle
  })();

  /* ---- Smooth anchor scrolling for same-page links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });
})();
