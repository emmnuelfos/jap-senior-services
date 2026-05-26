# J.A.P Senior Services — Web Design Brief

## ROLE

You are a senior product designer at a luxury healthcare-marketing agency. Your task is to design and build a **modern, premium, accessible website** for **J.A.P Senior Services, LLC**, a family-owned in-home senior-care provider in Alabama with 25+ years of experience. Produce a Next.js (App Router) + React + Tailwind CSS artifact that I can drop into a project. Use placeholder photography from Unsplash with warm, dignified senior-lifestyle imagery (intergenerational moments, golden-hour porches, hands holding hands, caregivers laughing with seniors — never clinical, never patronizing).

The site must read as **luxurious and editorial** — like a wellness brand or boutique hotel — while remaining **immediately usable by an 80-year-old** (large type, high contrast, big tap targets, simple navigation, prominent phone number).

---

## BRAND

**Name:** J.A.P Senior Services, LLC
**Tagline:** "Care that honors a lifetime."
**Sub-tagline:** Privately held, family-owned care for seniors who deserve a safer, more fulfilling life.
**Dedicated to:** Ethel M. Sanders — the grandmother whose spirit of care started it all.
**Wordmark:** "J.A.P" in heavy serif caps with periods, "SENIOR SERVICES" letterspaced beneath in a thin sans.

### Colors (use these exact hex values; do not invent others)

| Token | Hex | Use |
|---|---|---|
| **Deep Forest** | `#1F3A2E` | Primary dark. Headlines, dark sections, primary buttons. Conveys trust, vitality, growth. |
| **Warm Brass** | `#B8763E` | Primary accent. CTAs, active states, hover underlines, key statistics. **Use sparingly** — warmth should feel earned. |
| **Ivory** | `#F5F1EA` | Page background. Section surfaces. **Use this instead of pure white** anywhere except over photography. |
| **Stone Grey** | `#8A8782` | Hairlines (1px borders), secondary text, dividers, disabled states. |
| **Charcoal** | `#1F1E1C` | Body text on light backgrounds. |
| **Pure White** | `#FFFFFF` | Only over photography or in dark forest sections. |
| **Soft Sage** | `#D7DDD2` | Subtle section variation, quote cards, badges. |

Tailwind config:
```js
colors: {
  forest:    { DEFAULT: '#1F3A2E', 50: '#E8EFEB', 100: '#C8D5CD', 800: '#152822', 900: '#0E1C17' },
  brass:     { DEFAULT: '#B8763E', 50: '#F7EDE1', 100: '#EAD2B0', 600: '#9C5F2D', 700: '#7E4C21' },
  ivory:     { DEFAULT: '#F5F1EA', 100: '#FBF8F3' },
  stone:     { DEFAULT: '#8A8782', 200: '#C9C6C1' },
  charcoal:  { DEFAULT: '#1F1E1C', 800: '#2E2D2A' },
  sage:      { DEFAULT: '#D7DDD2', 100: '#E7EBE3' }
}
```

### Typography

- **Display / headlines:** **Fraunces** (Google Fonts), weights 300–500. Editorial, warm, with subtle character. Free fallback: **Cormorant Garamond**.
- **Body:** **Inter** at **18px minimum** (never smaller), line-height 1.7, letter-spacing 0. Larger than typical because primary readers are seniors and their adult children — readability over density.
- **Eyebrows / labels:** Inter at 12–13px, ALL CAPS, letter-spacing 0.18em, in Warm Brass or Forest.
- **Numbers (phone, years, stats):** Use tabular figures (`font-variant-numeric: tabular-nums`).

### Tone & feel

- **Luxurious, dignified, deeply human.** Think *Cereal Magazine* meets *AARP done right*.
- **Generous whitespace.** 96–128px vertical padding between sections on desktop, 72px on mobile.
- **Big photography** — full-bleed warm portraits, 4:3 service cards, 16:9 lifestyle blocks.
- **Fine 1px hairlines** in Stone Grey, never thick borders.
- **Brass underline on hover** for nav links and inline links — animated 0 → 100% width over 250ms.
- **Slow scroll-reveal** — text and images fade up 12px and in over 400ms ease-out.
- **Phone number always visible** — top-right of header, repeated in every section CTA, bottom of every mobile screen.
- **Avoid:** gradients, glassmorphism, drop shadows, neumorphism, rounded blobs, clinical blues, stethoscopes, syringes, "stock photos of generic seniors," emojis, exclamation marks.
- **Embrace:** square-ish corners (4–6px max radius), thin strokes, lots of air, photography doing the heavy lifting, the word "loved one" instead of "client," warmth without saccharine.

### Accessibility (non-negotiable — seniors are the primary audience)

- Body type 18px minimum, 20px on touch devices.
- All buttons ≥ 56px tall on touch (48px minimum on desktop).
- Contrast: text on Ivory must hit WCAG AA Large (Forest and Charcoal both pass).
- Focus rings: 3px Brass outline, 2px offset, always visible — never `outline: none`.
- Underline all inline links by default (don't rely on color alone).
- No auto-playing video with sound. No carousels that auto-advance.
- Phone number is a `tel:` link. Click-to-call from anywhere.
- Forms use plain language ("Your name" not "Full Legal Name *").

---

## DESIGN REFERENCES

Replicate the **clarity, IA, and trust posture** of these — not the exact pixels.

1. **Primary benchmark: comfortkeepers.com** — the client explicitly chose this. Study the homepage hero with the location search, the 6-card service grid, how they place Newsweek/PBS trust signals, and the 2-step self-assessment pathway. Replicate the *clarity*. **Elevate** with bigger type, more whitespace, editorial photography, and warmer color.
2. **For editorial luxury feel:** cerealmagazine.com, aesop.com, fortyfivetenstore.com — generous space, restrained typography, photography-first.
3. **For senior-friendly accessibility done well:** kaiserpermanente.org, aarp.org's newer landing pages — large type, clear pathways, prominent CTAs.
4. **For the warm/human side:** honor.com, papa.com — modern senior-care brands that feel like wellness, not healthcare.

---

## SITEMAP (7 pages)

Top-level navigation (in this order):

1. **Home** — `/`
2. **About** — `/about` (story, Ethel M. Sanders dedication, values, 25-year legacy, team)
3. **Services** — `/services` (all 9 named services, deep detail, "Request this service" CTA on each)
4. **How It Works** — `/how-it-works` (consultation → assessment → care plan → ongoing support)
5. **Stories** — `/stories` (testimonials, family stories — structured to fill in as real reviews come in)
6. **Careers** — `/careers` (work-with-us, current culture, application form)
7. **Contact** — `/contact` (phone, form, service area, hours)

Persistent header (left → right):
- Wordmark (links Home)
- Nav: About · Services · How It Works · Stories · Careers · Contact
- **Phone button (always visible):** `(205) 253-6537` — Warm Brass, Forest text, "Call us" eyebrow above
- "Request a Consultation" primary CTA button (Forest fill, Ivory text)

Persistent footer:
- Wordmark + dedication line ("In honor of Ethel M. Sanders")
- 3 link columns: Care (services list) · About (about, stories, careers) · Connect (contact, FAQs, request consultation)
- Service area note ("Serving Alabama's [region] since [year]")
- Phone, email, address (when provided)
- Social icons (Facebook, Instagram, X — placeholders for now)
- Legal: Privacy · Accessibility · Terms
- "Designed by TaskFlo VA" tag in footer-bottom (small, Stone Grey)

---

## PAGES TO DESIGN

Build in this priority order. Get the first three right end-to-end before adding the rest.

### 1. Homepage

**Section order, top to bottom:**

1. **Hero (85vh)** — full-bleed photograph of a senior with a caregiver at a kitchen table, golden-hour light. Forest gradient overlay (left side, 0 → 60% opacity) for text legibility.
   - Eyebrow (Ivory, brass tick before): `CARE THAT HONORS A LIFETIME`
   - Headline (Fraunces, 64–80px on desktop, Ivory): "A safer day. A more fulfilling life."
   - Subhead (Inter 20px, Ivory 80%): "Family-owned, in-home senior care across Alabama. 25 years of helping loved ones live well — on their own terms, in their own home."
   - **Two CTAs:** `Request a Consultation` (Brass fill, Forest text) + `See Our Services` (Ivory outline, Ivory text)
   - **Phone strip** below CTAs, large: "Or call us directly — (205) 253-6537" with brass-underline animation

2. **Trust strip (immediately below hero, on Ivory)** — single row, hairline-divided into 4 cells:
   - `25+ YEARS` of dedicated senior care
   - `9 CARE PROGRAMS` tailored to your loved one
   - `REGISTERED NURSE` on staff
   - `FAMILY-OWNED` and proudly local
   No icons — just bold tabular numbers and small caps labels in Brass.

3. **"Care that meets the moment"** — section heading, Fraunces 48px, Forest. Subhead: "Every day looks different. Our care does too." Then a **6-card grid** of featured services (the most-requested 6 of the 9 — Good Morning To You, Welcome Home, Up And At 'Em, Sweet Dreams, Discharge Assistance, Consultation). Each card:
   - 4:3 warm lifestyle photo
   - Service name (Fraunces, 28px, Forest)
   - One-line description (Inter, 16px, Charcoal)
   - Thin brass arrow with "Learn more" on hover
   - 6–8px corner radius, 1px Stone hairline, Ivory background, no shadow
   - Bottom of section: text link "See all 9 care programs →" in Brass

4. **"Our story" preview** — split section, 60/40:
   - Left (60%): editorial photo, 4:3, sepia warmth, a senior woman's hands holding a younger woman's hand
   - Right (40%): Eyebrow `OUR STORY`, headline "Started by family. Built for yours." (Fraunces, 36px), 3 short paragraphs about Ethel M. Sanders and the family roots, "Read our story →" link in Brass
   - Section background: Sage 100

5. **How it works (3-step ribbon)** — Forest background, Ivory text. Heading: "Getting started is simple." 3 numbered steps in a horizontal row (stack on mobile):
   - `01 — A free consultation.` Brief paragraph. We listen to what your family needs.
   - `02 — A care plan made for them.` Built with our RN around their daily life.
   - `03 — Care that grows with you.` Adjust as needs change. No long contracts.
   - CTA below the row: `Start with a free consultation` (Brass fill button)

6. **Stories** — 2-up testimonial cards (placeholder copy clearly marked `[Family testimonial to be added]`). Each card: Fraunces 24px quote, attribution in small caps Brass ("— Daughter of [Loved One's Name], Birmingham"). Hairline border, Ivory.

7. **"By the numbers"** — same structure as the trust strip but with different stats:
   - `25+ YEARS` serving Alabama families
   - `9 CARE PROGRAMS` to fit every routine
   - `7 CORE VALUES` we live by every day
   - `100%` family-owned, locally rooted

8. **Final CTA band (Forest, full-bleed)** — Fraunces 48px headline (Ivory): "Have questions? Let's talk."
   - Subhead: "A 20-minute call with our team — no pressure, no obligation."
   - Two CTAs: `Request a Consultation` (Brass fill) + `(205) 253-6537` (Ivory outline, phone icon)

9. **Footer.**

### 2. About

- **Hero (60vh)** — full-bleed photo of the family / an Alabama landscape with a porch / a multigenerational moment. Forest overlay. Headline: "A quarter century of care, born from one family's love."
- **Dedication card (overlapping the hero by 60px, Ivory card on Sage band):** "In honor of Ethel M. Sanders" — short paragraph from the existing site about Ethel igniting the spirit of care, framed like a memorial plaque. Hairline border.
- **Our Mission** — full text from existing site, set in Fraunces 28px for opening line, then Inter 18px for body. Eyebrow: `OUR MISSION`.
- **Our Vision** — same treatment.
- **Our Core Values (7 cards in a 3-2-2 grid or 4-3 grid on desktop, 1-up on mobile):** Respect · Dedication · Integrity · Teamwork · Compassion · Equality · Care. Each card: large Fraunces value name, one sentence describing what it means in practice (you'll write these — keep each to 12–15 words, specific not generic).
- **The team** — 3-column grid of team-member cards. Each: 3:4 portrait photo, name, title, languages (if applicable), one-paragraph bio. **Mark all 4 cards as `[Team member name + bio to be added]`** — the existing site doesn't list any. Include one card explicitly labeled for the on-staff Registered Nurse.
- **Why families choose us** — 4 short blocks with a number stat and a description (drawn from differentiators: 25+ years, on-staff RN, customizable packages, family-owned).
- **CTA band:** "Meet the people who'll care for your loved one." → `Schedule a meeting`

### 3. Services

The conversion-critical page. Lay out all **9 services** with deep detail.

- **Hero (40vh)** — Forest section. Eyebrow: `OUR CARE PROGRAMS`. Headline (Fraunces 56px, Ivory): "Nine ways we show up for your family."
- Subhead: "Each program is fully customizable. Mix and match to match the day." Brass underline link: "Or talk to us — we'll design a plan together →"
- **Sticky sub-nav** under the hero — 9 anchor pills (Stone hairline, brass-active state). Clicking scrolls to that service.
- **9 service sections, alternating Ivory and Sage 100 backgrounds.** Each section uses a **2-column layout (image left, content right)** on desktop, stacked on mobile:
   - 4:3 editorial lifestyle photo (left, 50% width on desktop)
   - Right: eyebrow `PROGRAM 01` (etc.), headline (Fraunces 40px, Forest), the description rewritten in warm prose (3–4 sentences, but keep all facts from the current site), then a **"What's included" checklist** with thin brass tick marks, then a `Request this service` button (Forest fill).

  **Use these 9 services exactly (rewrite the marketing prose, keep every fact):**
   - **01 — Good Morning To You.** Spirited morning visit. Help with dressing, grooming, bed-making, medication reminder, breakfast escort.
   - **02 — Welcome Home.** Settling-in support for relocations. Unpacking, light cleaning, helping your loved one feel at ease in a new space.
   - **03 — Up And At 'Em.** Everything in Good Morning To You, plus shower and shampoo support.
   - **04 — Sweet Dreams.** Evening wind-down. Light snack, nightwear, teeth brushing, medication reminder, bed turndown.
   - **05 — Discharge Assistance.** Hospital-to-home transitions. Transportation, discharge planning, help with prescriptions — peace of mind on a hard day.
   - **06 — Room And Board.** A cozy private or shared room, combinable with any of our care programs.
   - **07 — Consultation.** A scheduled meeting with our on-staff Registered Nurse or social worker to map out the right plan.
   - **08 — Grocery And Meal Preparation.** Help with shopping and cooking — meals that fit dietary needs and personal tastes.
   - **09 — Other Services.** Custom care, by request. If it's not on this list, ask us — we'll make a plan that fits.

  **Note at the bottom of every service block (Stone Grey, 14px italic):** "A mileage fee applies to transportation services."

- **Final CTA band (Forest):** "Not sure which program is right? Let's figure it out together." → `Request a consultation` + phone link.

### 4. How It Works

The pathway page — equivalent to Comfort Keepers' self-assessment but warmer.

- **Hero (40vh)** — Sage 100 background, Fraunces 56px headline (Forest): "Care, in four simple steps."
- **4-step vertical timeline (left rail with brass dots and hairlines, right rail content):**
  1. **A free consultation.** What it is, who you talk to (on-staff RN), how long (~30 min), what you'll cover. Right of content: a photograph of a phone call / a relaxed conversation.
  2. **A home assessment.** When and how we visit, what we look at (mobility, safety, daily routines), how long (~1 hour). Photo of caregiver looking at a living room with a senior.
  3. **A care plan tailored to your family.** What's in the plan, how we pick from the 9 programs, schedule examples. Photo of a written plan on a kitchen table.
  4. **Ongoing care, growing with you.** Adjusting the plan, monthly check-ins, no long contracts. Photo of caregiver and senior laughing.
- **FAQ accordion** — 8 questions answered (write these based on the existing site's content, e.g., "Do you offer one-time services?" "Is there a long-term contract?" "Is your nurse always involved?" "Do you charge for travel?" "What if my loved one needs more care later?" "How quickly can we start?" "What areas do you serve?" "How are caregivers vetted?"). Hairline-only accordion, no chevron decoration — just `+` / `−` in Brass.
- **CTA band:** "Ready to take the first step?" → `Schedule a free consultation`

### 5. Stories

- **Hero (30vh)** — Ivory section. Eyebrow `FAMILY STORIES`. Headline (Fraunces 48px): "The families we serve, in their own words."
- **Big featured story (full-width card)** — large pull quote (Fraunces 36px), photo of a senior + family (placeholder), attribution. Mark clearly as `[Featured story — to be added]`.
- **6 testimonial cards in a grid** — each Ivory, hairline, Fraunces 24px quote, attribution in small caps Brass. Mark all as `[Testimonial — to be added]`.
- **Logo bar (optional, hairline-bordered):** "Recognized by [trusted partners — to be added]" — placeholder for any future awards or partner logos.
- **CTA band:** "Your family's story could be next." → `Start with a consultation`

### 6. Careers

- **Hero (50vh)** — full-bleed photo of a caregiver mid-laugh with a senior. Forest overlay. Headline (Fraunces 56px, Ivory): "Do work that matters."
- Subhead: "We hire caregivers who treat every family like their own. If that's you, we'd love to meet."
- **Why work here** — 4 cards in a row (Ivory): Flexible schedules · Family-owned culture · RN-led training · Real impact in your community.
- **Open positions** — list of positions (placeholder; mark as `[Open roles to be added]`). Each row: title, location, type (Full-time / Part-time / PRN), `Apply` button. Hairline-divided rows.
- **What we look for** — short list with brass ticks: Compassion · Reliability · Respect for elders · Strong communication · CNA / HHA certification (a plus, not required) · A driver's license · Patience.
- **Application form (Elementor-compatible: use Contact Form 7 or WPForms hooks):** Name, Email, Phone, Position interested in, Years of experience, Tell us why you'd be a great fit (textarea), CV upload (optional). Big Brass `Apply now` button.
- **CTA band:** "Questions before you apply?" → phone link + email link.

### 7. Contact

- **Hero (30vh)** — Sage 100. Eyebrow `CONTACT`. Headline: "We'd love to hear from you."
- **Two-column layout (desktop, stacked on mobile):**
   - Left: contact form — Name, Phone, Email, How can we help? (dropdown: Request a consultation / Ask about services / Careers / Other), Message (textarea). Big Forest `Send message` button.
   - Right: contact details card (Ivory, hairline) — Phone (large brass, tel: link), Email (when provided), Address (when provided), Hours (placeholder), Service area (placeholder map or text), social icons. Below: "For urgent matters, please call us directly."
- **Map section (full-width, optional)** — embed Google Map showing service area. Below the map: list of cities/regions served (placeholder until confirmed).
- **CTA band:** "Prefer to talk?" + big phone number.

---

## REQUIRED COMPONENTS

Build these as reusable React components with Tailwind, **using only patterns that map cleanly to free-tier Elementor widgets** (Heading, Text Editor, Image, Image Box, Icon Box, Button, Divider, Spacer, Tabs, Accordion, Testimonial, Counter, Icon List, Inner Section). Forms use Contact Form 7 / WPForms placeholders, not Elementor Pro forms.

1. **HeaderNav** — wordmark + 6-link nav + large phone-button + primary CTA. Sticky on scroll, shrinks slightly. Mobile: hamburger opens a full-screen Ivory drawer with stacked links, big phone CTA at the bottom.
2. **HeroSplit** — full-bleed photo + Forest gradient overlay + eyebrow + headline + subhead + 2 CTAs + phone strip. Variants: `home`, `internal` (shorter), `dark-section` (Forest bg, no photo).
3. **ServiceCard** — 4:3 photo, name, one-line description, brass arrow on hover. Used in homepage grid and "see also" sections.
4. **ServiceBlock** — 2-column image+content layout used 9 times on the Services page. Reusable.
5. **TrustStrip** — single row of 4 stat cells with hairline dividers. Big tabular numbers, small caps labels.
6. **StepRibbon** — Forest background, 3 or 4 numbered steps in a row (stack on mobile).
7. **TestimonialCard** — Ivory card, Fraunces 24px quote, brass small-caps attribution, hairline border. Single and grid variants.
8. **ValueCard** — used for the 7 core values. Large Fraunces name, short specific description.
9. **TeamCard** — 3:4 portrait, name, title, languages, one-paragraph bio.
10. **FAQAccordion** — hairline-only, +/− in brass. No chevron decoration.
11. **CTABand** — full-bleed Forest section with Fraunces headline + subhead + 2 CTAs (one primary, one phone).
12. **Footer** — wordmark + dedication + 3 link columns + service area + social + legal + agency credit.
13. **PhoneButton** — reusable Brass button with eyebrow "Call us" above and the phone number large below. Used in header, hero, footer, and as floating mobile button.
14. **LeadForm** — generic contact/consultation form. Big labels, big inputs (56px tall), big submit. Used on Contact, Careers, and as the post-CTA form.
15. **AnimatedReveal** — wrapper that fades up 12px + in over 400ms on scroll-into-view. Applied to most section content (skipped on the hero).

---

## ELEMENTOR COMPATIBILITY (CRITICAL)

This design will be rebuilt in **Elementor (free version, not Pro)**. Constrain yourself to patterns that map to free widgets:

**Allowed (maps to free Elementor):**
- Sections + columns (Inner Section)
- Heading, Text Editor, Image, Button
- Image Box (icon-less version of cards)
- Icon, Icon Box (yes, in free)
- Icon List (for amenity checklists)
- Tabs, Accordion, Toggle
- Testimonial widget
- Counter (for stats)
- Star Rating
- Divider, Spacer
- Image Gallery, Image Carousel
- Google Maps
- Background image / video on sections (Elementor handles this natively)
- Entrance animations (free has Fade In Up, Fade In, Slide Up — use only these)
- Sticky elements (free supports section stickiness)

**Avoid (Pro-only — do not design things that require these):**
- Elementor Forms → use Contact Form 7 shortcode embedded in a Text Editor
- Posts widget, Portfolio, Slides, Flip Box, Image Hotspot, Price List, Countdown
- Mega menu, Popup builder, Theme builder
- Animated headlines, motion effects with parallax beyond background-attachment
- Custom CSS-heavy effects (no clip-paths, no masked text, no SVG morphs)

**Design accordingly:**
- Cards are simple: Image + Heading + Text + Button stacked in a column. No flip animations, no fancy hover transforms beyond `translateY(-2px)` and underline.
- Hero uses a background image on a section, with a Heading + Text Editor + Button row inside.
- The 9-service page is 9 stacked sections with alternating background colors and a 2-column inner layout (image | content).
- The "trust strip" is a single section with 4 inner columns, each containing a Heading (the number) and a Text Editor (the label).
- Sticky sub-nav on the Services page = a sticky section near the top with anchor-link buttons inside.

---

## INTEGRATIONS TO REPRESENT IN UI

- **Contact Form 7 / WPForms** — every form is a placeholder for one of these. Don't design custom form UI that requires JS state.
- **Google Maps** — embed on Contact page.
- **`tel:` and `mailto:` links** — every phone and email is clickable.
- **GA4 / Meta Pixel** — assume firing on every CTA. Add `data-gtm-event` attributes to primary buttons.
- **Higgsfield-generated photography** — all images are placeholders (Unsplash) now; will be replaced with custom Higgsfield-generated imagery later. Use `alt` descriptions that read like Higgsfield prompts (e.g., `alt="Senior woman in warm golden hour light, hands resting on a quilted lap, soft focus living room background, editorial portrait"`).

---

## DELIVERABLE FORMAT

Produce a single Next.js + React + Tailwind artifact with:

- **App Router structure:** `/`, `/about`, `/services`, `/how-it-works`, `/stories`, `/careers`, `/contact`.
- **Tailwind config** with the custom colors above, plus Fraunces + Inter font setup.
- **`lib/site-content.ts`** with the real content from the existing site, rewritten as warm editorial prose — the 9 services, the mission, vision, values, dedication line, phone number, all of it. **No invented facts.** Anything not on the current site is clearly marked `[Placeholder — to be added]`.
- **Mobile-first responsive** — verify at 375px, 768px, 1280px, 1920px.
- **Animations:** fade-up reveals on scroll for section headings and cards (400ms ease-out, 50ms stagger between siblings). Brass underline animation on links (0 → 100% width over 250ms). Sticky header that shrinks slightly on scroll. **No autoplay, no carousels that move on their own.**
- **Use `next/image`** with placeholder Unsplash URLs that match the editorial senior-care vibe (intergenerational, warm, golden hour, never clinical).
- **Accessibility:** semantic HTML, alt text on every image, focus-visible rings in Brass (3px, 2px offset), aria-labels on icon-only buttons, skip-to-content link, all forms with proper labels.

**Start with the Homepage, the Services page, and the How It Works page** — those are the conversion path. Get those three polished before adding the rest.

---

## VOICE & COPY

When writing UI copy and headlines, the tone is:

- **Warm, dignified, never patronizing.** Seniors are adults. Speak to them and their families as such.
- **Specific over generic.** "A 30-minute call with our on-staff nurse" beats "Get help from our team."
- **No exclamation marks. No "Amazing!" No "Don't miss out!"**
- **"Loved one"** instead of "elderly" or "patient." Never use "elderly" as a noun.
- **Editorial.** Think *The Atlantic*'s wellness section, not a hospital pamphlet.

Headlines to use:
- "A safer day. A more fulfilling life." (homepage hero)
- "Care that meets the moment." (homepage services section)
- "Started by family. Built for yours." (about preview)
- "Nine ways we show up for your family." (services hero)
- "Care, in four simple steps." (how it works hero)
- "The families we serve, in their own words." (stories hero)
- "Do work that matters." (careers hero)
- "We'd love to hear from you." (contact hero)
- "Have questions? Let's talk." (final homepage CTA)

Phrases to avoid:
- "Aging in place" (industry jargon — say "staying at home" instead)
- "Senior citizen" (just "senior" or "loved one")
- "We provide" (say "we do" or "we help with")
- "Cutting-edge" (we are warm, not high-tech)
- "Solutions" (we provide care, not solutions)

---

## FINAL CHECK BEFORE YOU SUBMIT

- [ ] Did you use **Ivory** (`#F5F1EA`) as the page background, never pure white?
- [ ] Is **Warm Brass** used sparingly — only on CTAs, accents, and one or two highlights per section?
- [ ] Is there at least 96px of vertical breathing room between major sections on desktop?
- [ ] Do hairlines render at exactly 1px in Stone Grey?
- [ ] Is body text at least 18px everywhere?
- [ ] Are buttons at least 56px tall on mobile?
- [ ] Is the phone number (205) 253-6537 visible on every page in the header AND footer?
- [ ] Are all 9 services on the Services page using the **exact names** from the current site?
- [ ] Is the Ethel M. Sanders dedication present on the About page?
- [ ] Are placeholder facts (team names, testimonials, awards) clearly marked `[To be added]` so nothing is invented?
- [ ] Did you avoid Elementor Pro–only patterns (custom forms, popups, animated headlines, flip boxes, mega menu)?
- [ ] No emojis anywhere in the design.
- [ ] No exclamation marks in the copy.
- [ ] Photography reads as warm and human, not clinical?
- [ ] Footer credits **TaskFlo VA** as the design agency?
