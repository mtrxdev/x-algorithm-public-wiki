# Cinematic visual lexicon — Design Spec

Date: 2026-08-13  
Status: Approved; parallax added after review  
Branch: `feat/creator-longread-redesign`  
Workspace: `/home/ubuntu/x-algorithm/.worktrees/feat-creator-longread-redesign`

## 1. Purpose

Completely replace the cream-paper / Georgia look with a **dark cinematic documentary** page. Photoreal HDR stills teach what each chapter means. Sourced quotes stay the authority.

This is a visual overhaul of the existing one-URL creator long-read, not a new product.

## 2. Success

- Warm-paper aesthetic is gone (no `#f4efe6` page, no Iowan/Georgia as the brand).
- Six chapter opener stills exist as Imagine assets (plus one lighting master).
- Each still is a metaphor the files support. Alt text states the metaphor. The excerpt still carries the fact.
- Dark zinc page, Newsreader + Roboto, full-bleed 16:9 openers, quote card under or overlapping the still.
- No Imagine-drawn file names, weights, or fake For You chrome.
- No named celebrities. No unofficial X/xAI logos.
- No gaming advice.
- Images lazy-loaded, reserved aspect ratio (CLS), WebP or optimized JPEG, contrast 4.5:1 on text over photos (scrim).
- `prefers-reduced-motion` still disables GSAP, smooth scroll, **and parallax**.
- Evidence verifier still passes.

## 3. Non-goals

- Do not generate video unless a later spec asks.
- Do not invent UI screenshots of X.
- Do not persist the playful rose/Nunito design-system hit; it was rejected as off-product.
- Do not replace EvidenceBlock / LimitBlock or the manifest.
- Do not add routes.

## 4. Visual system

Adapted from ui-ux-pro-max search `documentary journalism photo essay education editorial` (Swiss / Minimalism + News Editorial pairing). Accent pink from that palette is **not** used; photos supply the only warm color (tungsten).

| Token | Value |
| --- | --- |
| Background | `#09090B` |
| Surface | `#18181B` |
| Foreground | `#FAFAFA` |
| Muted | `#A1A1AA` |
| Border | `#27272A` |
| Primary / ink | `#FAFAFA` on black |
| Heading | Newsreader |
| UI / kicker / cites | Roboto |
| Code | ui-monospace on `#18181B` |

Chapter opener: full-bleed 16:9 image, bottom gradient scrim (`#09090B` 0%→80%), chapter kicker + title over the scrim. Evidence card sits in the dark band immediately below.

Checklist: six crops (4:5 or 1:1) of the same stills, ink/zinc borders, not colorful pills.

## 5. Imagine pipeline

1. Generate **one master still** (`image_gen`, 16:9): night interior, tungsten practicals, steel table, invented adult hands, no readable text. This locks grade and lens.
2. Derive each chapter still with `image_edit` from that master (same room, same grade).
3. Crop checklist thumbs in code, do not regenerate.
4. If a still comes back with readable fake UI text or a logo, discard and regenerate or crop; do not ship garbled words.

**Fictional adults only.** Diverse ages/appearances. No minors. No named real people.

**Stills (locked)**

| id | File | Scene |
| --- | --- | --- |
| `look-master` | `public/stills/look-master.jpg` | Empty night desk, steel table, tungsten |
| `drop` | `public/stills/drop.jpg` | Printed dossier on that table |
| `found` | `public/stills/found.jpg` | Two card piles, two adults sorting |
| `scored` | `public/stills/scored.jpg` | Hands ranking cards; weight numbers are HTML overlay |
| `hide` | `public/stills/hide.jpg` | Hand + phone + real frosted glass over the screen |
| `missing` | `public/stills/missing.jpg` | Open drawer, empty slots (labels are HTML) |
| `run` | `public/stills/run.jpg` | One adult, Linux tower, visible GPU |

## 6. Page mapping

| Chapter h2 | Still |
| --- | --- |
| What this drop is | `drop` |
| How a post is found | `found` |
| How it is scored | `scored` |
| What can hide or cover it | `hide` |
| What is missing | `missing` |
| What you can actually run or reuse | `run` |
| How we checked / Sources | no still (plain dark band) |

`ChapterOpener` component: `src`, `alt`, `kicker`, `title`, children (the cards).

## 7. Motion and a11y

- Keep existing reduced-motion CSS and GSAP gate.
- **Fluid scroll parallax is required.** The page never pins or scroll-jacks. As the reader scrolls down, each opener still moves continuously with the wheel/touch (GSAP ScrollTrigger `scrub: true`, or equivalent scroll-linked `transform`). No one-shot fade that plays once and stops. Motion is 1:1 with scroll position: scrub back up and the still eases back.
- Implementation: the still is taller than the frame (about 125% height), clipped by `overflow: hidden`. It translates on Y at factor **0.28** (image lags the page). Animate `transform` only. No horizontal parallax.
- Title and scrim stay locked to the opener frame (they do not parallax). The photo drifts; the words stay readable.
- If `prefers-reduced-motion: reduce`: no parallax (image `object-fit: cover` at rest), no GSAP, `scroll-behavior: auto`.
- Meaningful images: descriptive alt. Decorative crops: empty alt only if the opener already described them.
- Text on images only on the scrim, not burned into the JPEG.

## 8. Implementation order (later plan)

1. Tokens + fonts; delete warm-paper brand.
2. `ChapterOpener` + layout.
3. Imagine master, then six stills; commit optimized assets.
4. Wire stills to chapters + checklist thumbs.
5. Verify, browser (desktop/mobile), review, deploy.

## 9. Resolved decisions

| Topic | Decision |
| --- | --- |
| Language | Documentary stills that teach |
| Grade | Darker / cinematic |
| Placement | Full-bleed chapter openers |
| Approach | A — openers + dark Swiss page |
| People | Invented adults, not celebrities |
| Parallax | Fluid, scroll-scrubbed, factor 0.28 on stills only; no pin; off under reduced motion |

No remaining TBD.
