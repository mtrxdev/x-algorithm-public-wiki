# Creator long-read redesign — Design Spec

Date: 2026-08-13  
Status: Awaiting user review of this written spec  
Workspace: `/home/ubuntu/x-algorithm`  
Live site: https://x-algorithm-public-wiki.vercel.app  
Upstream quotes: `xai-org/x-algorithm` (manifest SHA in `content/manifest.json`)

## 1. Purpose

Restyle and restage the existing independent explainer as a **progressive long-read for creators**, with a **checklist at the top** that jumps to sourced evidence.

The page still answers what the public `xai-org/x-algorithm` files actually say. It now teaches in order, so a creator who does not know what can hide or score a post can read through without being given tactics to game For You.

## 2. Audience and success

**Reader:** a creator on X (and still a journalist who can follow the same page).

**Done means:**

- One URL (`/`) on the existing Next.js app, redeployed to Vercel.
- Warm-paper editorial look (approved visual A).
- A checklist of only file-backed “what might affect a post” items; each item jumps to its card. No score, no grade, no “your account is doomed.”
- Chapters in a fixed teaching order (see §4).
- Every teaching claim still has path + line range + SHA + excerpt.
- Dedicated cannot-do / missing section remains equal weight.
- No evasion, growth-hacking, or “how to get more reach” recipes.
- Desktop + ~390px check; `prefers-reduced-motion` respected.
- Evidence verifier still passes (`npm test`, `npm run verify`, `npm run build`).

## 3. Non-goals

- Do not add extra routes, accounts, CMS, or a backend.
- Do not invent creator segments the files do not name.
- Do not tell anyone how to evade labels, botmaker rules, Grox, or ranking weights.
- Do not claim the drop is the live For You system.
- Do not publish `vendor/x-algorithm`.
- Do not replace EvidenceBlock / LimitBlock with unsourced UI.
- Do not turn the page into a marketing landing or a dashboard.

## 4. Page architecture

Same App Router app. Still `/` and `not-found` only.

| Unit | What it does | How you use it | Depends on |
| --- | --- | --- | --- |
| Masthead | Independent-explainer kicker, title, lede | `ArticleLayout` | none |
| `CreatorChecklist` | Named systems a creator can jump to | List of `{ label, href, citationId }` | existing card ids |
| Chapter TOC | Sticky chapter list; current chapter highlighted | headings from MDX | `extractHeadings` |
| Article MDX | Progressive chapters + cards | edit `content/article.mdx` | EvidenceBlock, LimitBlock |
| EvidenceBlock / LimitBlock | Layman text + excerpt + permalink | existing props | manifest |
| Motion | Chapter fade, TOC current, checklist hover | GSAP + `useGSAP`, skipped if reduced motion | `gsap`, `@gsap/react` |

**Vertical order**

1. Masthead  
2. Checklist: “What the files say can affect a post”  
3. How to read this page (one short box)  
4. Chapter: What this drop is  
5. Chapter: How a post is found  
6. Chapter: How it is scored  
7. Chapter: What can hide or cover it  
8. Chapter: What is missing  
9. Chapter: What you can actually run or reuse  
10. How we checked / sources  

Checklist rows (only if a citation already exists or is extracted in the same change):

- Visibility rules (blocks, mutes, show / drop / interstitial)  
- Labels from named systems (Grox, scarecrow, botmaker — as the README names them)  
- Grox prompt files not published  
- Ads / Who to Follow as extra slots around ranked posts  
- Phoenix practice run needs Linux + NVIDIA GPU  
- Scoring weights exist in published config (describe that they exist; do not coach how to farm them)

If a row cannot be quoted, it does not appear.

## 5. Visual system (warm paper)

Approved companion choice **A**.

- Page: cream `#f4efe6`, ink `#1c1914`, muted `#6b6358`, rule `#cfc6b8`, code well `#ece6da`.
- Type: Georgia / Iowan for body; system-ui for kicker, checklist, citations, TOC. Comfortable measure ~65–72ch.
- Checklist chips: 1px ink border, no pills-of-many-colors, no gradients, no glass.
- Cards: top rule, two columns from 900px, stack below. Code in a paper well, not a neon terminal.
- No unofficial X/xAI logos.
- Print: hide sticky TOC; keep cards readable.

## 6. Motion

Restrained. Purpose is orientation, not delight.

- Allowed: fade/slide chapter headings into place (~200–300ms, ease out); TOC current-item highlight; checklist row focus.
- Forbidden: bounce, parallax hero, pinned storytelling, scrolljacking, autoplay loops.
- Implementation: GSAP + `@gsap/react` `useGSAP`. If `prefers-reduced-motion: reduce`, apply no motion (instant state only).
- Animate only `transform` and `opacity`.

## 7. Copy rules

- Rewrite into creator-plain language. Short sentences.
- Keep every existing citation id unless a later extract adds a new one.
- New sentences must be supportable by a quoted file.
- Frame: “the files say X can happen,” never “you should post like Y.”
- Cannot-do section stays long and honest.

## 8. Skills used

Installed at `.grok/skills/` (see `.grok/skills/SOURCES.md`). Binding for this redesign:

- impeccable, design-taste-frontend, redesign-existing-projects, ui-ux-pro-max — visual discipline  
- emil-design-eng, animate, review-animations — restraint  
- gsap-react, gsap-core — motion implementation  
- original explainer spec — evidence contract still wins if a design skill conflicts  

Large skill trees stay on disk for the agent. They are not deployed to Vercel.

## 9. Testing and verification

1. `npm test` and `npm run verify` (vendor match when clone present).  
2. `npm run build` (verify is already a build gate).  
3. Browser: scroll full article; every checklist jump lands on the right card; TOC; 404; 390px width; reduced-motion.  
4. Copy check: no gaming advice; no unsourced checklist row.  
5. requesting-code-review before calling the job finished.

## 10. Implementation order (for the later plan)

1. Branch off current `main`.  
2. Restyle CSS + layout (warm paper) without changing MDX meaning.  
3. Add `CreatorChecklist` + chapter heading ids.  
4. Reorder/rewrite MDX into chapters; keep citation ids.  
5. Add GSAP with reduced-motion off-ramp.  
6. Verify, browser-check, review, deploy via existing GitHub → Vercel.

## 11. Resolved decisions

| Topic | Decision |
| --- | --- |
| Visual | Warm paper editorial |
| Scope | Checklist + long-read on one URL |
| Audience | Creators, no gaming |
| Motion | Quiet GSAP, reduced-motion safe |
| Cards | Restyle, do not replace evidence contract |

No remaining TBD.
