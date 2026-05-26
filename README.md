# J.A.P Senior Services — Web Design Project

Client: **J.A.P Senior Services, LLC** (Alabama-based senior in-home care, 25+ years)
Agency: **TaskFlo VA**
Status: Design phase — brief drafted, awaiting Claude Design mockups

## Workflow (same pattern as Arabland)

1. **Brief** → `design-brief.md` is the document to paste into [claude.ai/design](https://claude.ai/design). It contains brand, palette, typography, sitemap, page-by-page specs, components, voice, and Elementor-compatibility constraints.
2. **Mock** → User pastes the brief into Claude Design, generates the actual website mockup, iterates there.
3. **Export → return here** → User exports from Claude Design and brings the HTML/CSS back into this repo (`prototype/` folder).
4. **Refine** → We refine the prototype in Claude Code (this session) — tweaking copy, adjusting components, swapping in Higgsfield-generated imagery.
5. **Presentation** → Once the prototype is polished, we build `presentation/presentation.html` — the client-facing deck explaining palette, typography, IA, and walking through the screens. Same structure as Arabland's presentation.
6. **Handoff** → Elementor builder (free tier) rebuilds the prototype on the live site.

## Folder layout

```
jap-senior-services/
├── README.md               ← this file
├── design-brief.md         ← THE deliverable for Claude Design
├── research/               ← raw research on client + benchmark + agency
├── prototype/              ← Claude Design export lands here
├── presentation/           ← client-facing presentation deck
└── _qa/                    ← QA notes, screenshot checks
```

## Key facts (extracted from japseniorservicesllc.com)

- **Phone:** (205) 253-6537
- **Location:** Alabama (205 area code; specific address not yet provided)
- **Founded by:** Family dedicated to Ethel M. Sanders
- **Experience:** 25+ years
- **9 services:** Good Morning To You · Welcome Home · Up And At 'Em · Sweet Dreams · Discharge Assistance · Room And Board · Consultation · Grocery And Meal Preparation · Other Services
- **Values:** Respect, Dedication, Integrity, Teamwork, Compassion, Equality, Care
- **Staff:** On-staff Registered Nurse + Social Worker

## Gaps to fill (mark as `[To be added]` in design)

- Service-area cities/regions
- Team member names + bios
- Testimonials / family stories
- Pricing or rate structure
- Hours of operation
- Specific address
- Email address
- Licenses, certifications, accreditations
- Awards or partnerships

## Design direction (locked)

- **Palette:** Deep Forest `#1F3A2E` · Warm Brass `#B8763E` · Ivory `#F5F1EA` · Stone Grey `#8A8782` · Charcoal `#1F1E1C` · Soft Sage `#D7DDD2`
- **Type:** Fraunces (display serif) + Inter 18px+ (body)
- **Feel:** Modern editorial luxury, warm not clinical, accessible for senior readers
- **Sitemap (7):** Home · About · Services · How It Works · Stories · Careers · Contact
- **Tech constraint:** Elementor free tier (no Pro widgets — see brief for what's allowed)

## Benchmark

Client chose [comfortkeepers.com](https://www.comfortkeepers.com/) — "Clean, professional, easy to navigate." We're elevating that clarity with editorial typography, generous whitespace, warmer color, and senior-friendly accessibility.
