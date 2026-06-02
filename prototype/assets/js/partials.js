/* ============================================================
   J.A.P Senior Services — partials.js
   Injects shared header, drawer, mobile-bar, footer
   Run BEFORE site.js so site.js can attach behavior.
   ============================================================ */

(function () {
  'use strict';

  const PHONE = '(205) 253-6537';
  const PHONE_HREF = 'tel:+12052536537';
  const EMAIL = 'hello@japseniorservices.com';
  const ADDRESS_LINE_1 = '1515 Bankhead Highway West';
  const ADDRESS_LINE_2 = 'Birmingham, Alabama 35214';

  // Navigation per client Brand Guide / Site Structure brief.
  // "Home" anchors the brand-logo click so we don't duplicate it as
  // a nav link — but it is present in the mobile drawer.
  const NAV = [
    { href: 'index.html',                 label: 'Home' },
    { href: 'about.html',                 label: 'About Us' },
    { href: 'services.html',              label: 'Services' },
    { href: 'blogs.html',                 label: 'Blog / Resources' },
    { href: 'careers.html',               label: 'Careers' },
    { href: 'faqs.html',                  label: 'FAQs' },
    { href: 'contact.html',               label: 'Contact Us' },
  ];

  /* ---------- HEADER ---------- */
  const header = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" role="banner">
      <div class="container header-inner">
        <a class="brand-logo" href="index.html" aria-label="J.A.P. Senior Care Services — Home">
          <img src="assets/img/jap-logo.webp" alt="J.A.P. Senior Care Services — Love, Dignity, Respect" />
        </a>
        <nav class="nav" aria-label="Primary">
          ${NAV.map(n => `<a href="${n.href}">${n.label}</a>`).join('')}
        </nav>
        <div class="header-cta">
          <a class="phone-cta" href="${PHONE_HREF}" data-gtm-event="phone_header" aria-label="Call us at ${PHONE}">
            <span class="phone-cta-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>
              </svg>
            </span>
            <span class="phone-cta-text">
              <small>Call Us Anytime</small>
              <b>${PHONE}</b>
            </span>
          </a>
          <a class="btn btn-primary btn-arrow" href="contact.html#consult" data-gtm-event="cta_header_consult">
            Request a Free Consultation
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <button class="header-burger" aria-label="Open menu"><span aria-hidden="true"></span></button>
        </div>
      </div>
    </header>

    <aside class="drawer" aria-hidden="true" aria-label="Site menu">
      <div class="drawer-head">
        <a class="brand-logo brand-logo--drawer" href="index.html">
          <img src="assets/img/jap-logo.webp" alt="J.A.P. Senior Care Services" />
        </a>
        <button class="drawer-close" aria-label="Close menu"></button>
      </div>
      <nav class="drawer-nav" aria-label="Mobile primary">
        ${NAV.map(n => `<a href="${n.href}">${n.label}</a>`).join('')}
      </nav>
      <div class="drawer-foot">
        <a class="btn btn-brass btn-large" href="${PHONE_HREF}">${PHONE}</a>
        <a class="btn btn-outline-forest btn-large" href="contact.html#consult">Request a Free Consultation</a>
      </div>
    </aside>
  `;

  /* ---------- FOOTER (per client brief) ---------- */
  const footer = `
    <footer class="site-footer" role="contentinfo">
      <div class="container">
        <div class="footer-top">
          <div class="brand">
            <a class="brand-logo brand-logo--dark" href="index.html" aria-label="J.A.P. Senior Care Services — Home">
              <img src="assets/img/jap-logo.webp" alt="J.A.P. Senior Care Services" />
            </a>
            <p class="dedication">Love, Dignity, Respect. Serving Jefferson &amp; Shelby County, Alabama since 2018.</p>
          </div>
          <div class="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="about.html">About Us</a></li>
              <li><a href="services.html">Services</a></li>
              <li><a href="blogs.html">Blog / Resources</a></li>
              <li><a href="careers.html">Careers</a></li>
              <li><a href="faqs.html">FAQs</a></li>
              <li><a href="contact.html">Contact Us</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Contact</h4>
            <ul>
              <li>${ADDRESS_LINE_1}</li>
              <li>${ADDRESS_LINE_2}</li>
              <li><a href="${PHONE_HREF}" class="tabular">${PHONE}</a></li>
              <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
              <li>Serving Jefferson &amp; Shelby County</li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Connect</h4>
            <ul>
              <li><a href="#" aria-label="Facebook">Facebook</a></li>
              <li><a href="#" aria-label="Instagram">Instagram</a></li>
              <li><a href="#" aria-label="X (Twitter)">X (Twitter)</a></li>
            </ul>
            <p style="margin-top: 16px; font-weight: 700;">Hours: Available 24/7</p>
            <p style="opacity: 0.75; margin-top: 4px;">Call or message anytime.</p>
          </div>
        </div>

        <div class="footer-mid">
          <div class="area">Serving Jefferson &amp; Shelby County, Alabama</div>
          <div class="contact-line">
            <a href="${PHONE_HREF}" class="tabular">${PHONE}</a>
            <span style="color:rgba(255,255,255,0.5)">·</span>
            <a href="mailto:${EMAIL}">${EMAIL}</a>
          </div>
          <div class="socials" aria-label="Social media">
            <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V9.9H7.7V13h2.6v8h3.2Z"/></svg></a>
            <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor"/></svg></a>
            <a href="#" aria-label="X (Twitter)"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.3 3H20l-6.3 7.2L21 21h-5.6l-4.4-5.8L6 21H3.3l6.8-7.7L3 3h5.7l4 5.4L17.3 3Zm-1 16.4h1.5L7.8 4.5H6.2l10.1 14.9Z"/></svg></a>
          </div>
        </div>

        <div class="footer-bottom">
          <div>© <span class="tabular">2025</span> J.A.P. Senior Care Services LLC. All rights reserved.</div>
          <div class="legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <span style="color:rgba(255,255,255,0.35)">Designed by TaskFlo VA</span>
          </div>
        </div>
      </div>
    </footer>

    <a class="mobile-phone-bar" href="${PHONE_HREF}" data-gtm-event="phone_mobile_bar">
      Call us<span class="num">${PHONE}</span>
    </a>
  `;

  // Inject
  const headerSlot = document.querySelector('#site-header-slot');
  const footerSlot = document.querySelector('#site-footer-slot');
  if (headerSlot) headerSlot.outerHTML = header;
  else document.body.insertAdjacentHTML('afterbegin', header);
  if (footerSlot) footerSlot.outerHTML = footer;
  else document.body.insertAdjacentHTML('beforeend', footer);

  // Expose constants
  window.JAP = { PHONE, PHONE_HREF, EMAIL, NAV };
})();
