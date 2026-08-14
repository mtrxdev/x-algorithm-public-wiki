# Cinematic Visual Lexicon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cream-paper look with a dark cinematic page whose chapter stills teach the topic and drift fluidly with scroll, while sourced quotes stay the authority.

**Architecture:** Keep Next.js, MDX, EvidenceBlock, LimitBlock, and the manifest. Add `ChapterOpener` (full-bleed 16:9 still + scrim + title). Imagine generates one lighting master then six stills via `image_edit`. `OpenerParallax` uses GSAP ScrollTrigger with `scrub: true` so the photo tracks the wheel; it no-ops under reduced motion.

**Tech Stack:** Next.js 15, existing GSAP + `@gsap/react`, ScrollTrigger, Imagine `image_gen` / `image_edit`.

## Global Constraints

- Throw out cream paper / Iowan-Georgia as the brand. Tokens: bg `#09090B`, surface `#18181B`, fg `#FAFAFA`, muted `#A1A1AA`, border `#27272A`.
- Headings: Newsreader. UI/kicker/cites: Roboto.
- Six teaching stills + one master. Fictional adults only. No named celebrities. No unofficial X/xAI logos.
- Imagine does not draw file names, weights, or fake For You chrome. Those stay HTML.
- Full-bleed chapter openers. Quote card in the dark band under the still.
- Fluid scroll parallax: factor **0.28**, `scrub: true`, transform only, **no pin**, no scroll-jack. Image ~125% tall, `overflow: hidden`.
- Title and scrim do not parallax.
- `prefers-reduced-motion: reduce` disables parallax, GSAP, and smooth scroll.
- Evidence contract and no-gaming rule unchanged. Verifier remains the build gate.
- Images: reserved 16:9, lazy load, descriptive alt. Checklist thumbs are CSS crops of the same files.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `app/globals.css` | Dark tokens, opener, scrim, checklist thumbs |
| `app/layout.tsx` | Newsreader + Roboto links |
| `components/ChapterOpener.tsx` | Full-bleed still + scrim + title + children |
| `components/OpenerParallax.tsx` | Client: scrubbed Y parallax on the img |
| `lib/parallax.ts` | `shouldParallax(prefersReduced: boolean): boolean` |
| `content/article.mdx` | Wrap each pictured chapter in ChapterOpener |
| `public/stills/*.jpg` | Master + six chapter stills |
| `lib/stills.ts` | `STILLS` map: chapter id → src + alt |
| `tests/parallax.test.ts` | reduced-motion gate |

---

### Task 1: Dark tokens and type

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: existing class names (`.shell`, `.card`, `.toc`, `.checklist`, `.kicker`)
- Produces: CSS variables `--paper: #09090B; --ink: #FAFAFA; --muted: #A1A1AA; --line: #27272A; --code: #18181B;` plus `--surface: #18181B`. Google fonts in `layout.tsx`:

```tsx
import { Newsreader, Roboto } from "next/font/google";

const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-display" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-ui" });
```

Apply `newsreader.variable` and `roboto.variable` on `<html>`. Body uses `var(--font-display)` for article text and `var(--font-ui)` for `.kicker`, `.toc`, `.cite`, `.checklist`.

- [ ] **Step 1: Replace warm-paper hex values** in `:root` with the spec tokens. Set `body { background: var(--paper); color: var(--ink); }`.
- [ ] **Step 2: Add fonts** in `layout.tsx` as above.
- [ ] **Step 3: Run** `npx tsx --test tests/*.test.ts && npx next build`  
  Expected: pass / success. Page background is zinc-black, not cream.
- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "style: switch explainer to dark cinematic tokens"
```

---

### Task 2: ChapterOpener + stills map (no photos yet)

**Files:**
- Create: `lib/stills.ts`
- Create: `components/ChapterOpener.tsx`
- Test: `tests/stills.test.ts`

**Interfaces:**
- Produces:

```ts
export type Still = {
  id: "drop" | "found" | "scored" | "hide" | "missing" | "run";
  src: string;
  alt: string;
};

export const STILLS: Record<Still["id"], Still> = {
  drop: { id: "drop", src: "/stills/drop.jpg", alt: "A printed dossier on a steel table at night. A published folder, not a live switch." },
  found: { id: "found", src: "/stills/found.jpg", alt: "Two people sorting two piles of printed cards: accounts you follow versus everyone else." },
  scored: { id: "scored", src: "/stills/scored.jpg", alt: "Hands ranking printed cards on a night desk. The published weights sit in the text, not in the photo." },
  hide: { id: "hide", src: "/stills/hide.jpg", alt: "A hand holding a phone with frosted glass over the post. Shown, dropped, or covered." },
  missing: { id: "missing", src: "/stills/missing.jpg", alt: "An open metal drawer with empty slots. Some files were not published." },
  run: { id: "run", src: "/stills/run.jpg", alt: "One adult at a Linux workstation with a visible GPU. The practice run needs that machine." },
};
```

```tsx
export function ChapterOpener({
  still,
  kicker,
  title,
  children,
}: {
  still: Still;
  kicker: string;
  title: string;
  children: React.ReactNode;
}): JSX.Element
```

Markup:

```tsx
<section className="opener">
  <div className="opener-frame">
    <img className="opener-img" src={still.src} alt={still.alt} width={1920} height={1080} />
    <div className="opener-scrim">
      <p className="kicker">{kicker}</p>
      <h2>{title}</h2>
    </div>
  </div>
  <div className="opener-body">{children}</div>
</section>
```

CSS: `.opener-frame` is `position: relative; aspect-ratio: 16/9; overflow: hidden;`. `.opener-img` is `position: absolute; inset: auto 0 0 0; width: 100%; height: 125%; object-fit: cover;`. `.opener-scrim` is a bottom gradient `linear-gradient(transparent, #09090B 80%)` with padding; h2/kicker sit here (no parallax).

- [ ] **Step 1: Failing test** that every `STILLS` entry has `src` starting with `/stills/` and a non-empty `alt` that does not include `evade|farm|game the`.
- [ ] **Step 2: Run** `npx tsx --test tests/stills.test.ts` — Expected: module missing
- [ ] **Step 3: Implement `lib/stills.ts` and `ChapterOpener`**
- [ ] **Step 4: Tests + build** — Expected: pass. Missing jpg is OK until Task 3; Next will 404 images.
- [ ] **Step 5: Commit**

```bash
git add lib/stills.ts tests/stills.test.ts components/ChapterOpener.tsx app/globals.css
git commit -m "feat: add chapter opener frame without stills"
```

---

### Task 3: Imagine stills

**Files:**
- Create: `public/stills/look-master.jpg` and the six chapter jpgs
- Do **not** commit huge PNG dumps; convert to JPEG quality ~82.

**Interfaces:**
- Consumes: Imagine `image_gen` then `image_edit`
- Produces: files listed in the spec

**Master prompt** (`image_gen`, aspect_ratio `16:9`):

Photoreal HDR night interior, a bare steel table in a dim documentary office, one warm tungsten practical lamp, cool fill from a window, no people yet, no readable text, no logos, 35mm, shallow depth of field, cinematic grade.

Then `image_edit` from `look-master` for each chapter. Restate: same room, same tungsten grade, no readable text, no logos, invented adults only, photoreal HDR.

| id | image_edit prompt (after “same night desk and tungsten grade as the reference”) |
| --- | --- |
| drop | A thick printed paper dossier closed on the steel table, one adult hand resting on it, no printed words visible. |
| found | Two adults sorting two distinct piles of blank printed cards on the table. |
| scored | Close on adult hands ranking a row of blank cards. No numbers on the paper. |
| hide | An adult hand holding a modern phone; a real sheet of frosted glass covers the dark screen. No UI text. |
| missing | An open metal filing drawer with empty unlabeled slots. No lettering. |
| run | One adult at a Linux-style tower workstation, a discrete GPU visible in the case, night office. No screen text. |

If a result shows readable text or a brand mark, discard and edit again. Do not ship it.

- [ ] **Step 1: Generate master**, save to `public/stills/look-master.jpg`
- [ ] **Step 2: Derive the six stills** with `image_edit`
- [ ] **Step 3: Convert/optimize** to JPEG if needed; confirm each file exists and is non-empty
- [ ] **Step 4: Commit**

```bash
git add public/stills
git commit -m "assets: add cinematic chapter stills"
```

---

### Task 4: Wire openers into the article

**Files:**
- Modify: `content/article.mdx`
- Modify: `mdx-components.tsx` to export `ChapterOpener`
- Modify: `components/CreatorChecklist.tsx` to show a cropped thumb from `STILLS` (same `src`, CSS `object-position` crop). Thumb `alt=""` if the opener alt already exists on the page; the label remains the accessible name.

**Interfaces:**
- Consumes: `ChapterOpener`, `STILLS`
- Keep the eight exact h2 strings. When a chapter is wrapped, **do not emit a second h2** — `ChapterOpener` already renders the title as `h2`. Remove the markdown `##` for those six chapters so TOC still sees one h2 per chapter (`extractHeadings` reads the MDX source).

Because `extractHeadings` parses `##` in the file, **keep the `## Title` lines in the MDX** and change `ChapterOpener` to render the title as a visually hidden or `aria-hidden` duplicate? That would duplicate headings in the accessibility tree.

**Required resolution (locked):** `ChapterOpener` takes `title` but renders it as `<p class="opener-title">`, not `<h2>`. The MDX keeps `## What this drop is` immediately inside or above the opener body so `extractHeadings` and the a11y tree stay one h2. Style that in-body `h2` into the scrim with CSS (`.opener-frame + .opener-body > h2:first-child` pulled up) **or** pass `title` only for the scrim `<p>` and leave the MDX `##` as the real heading just below the frame (visually under the photo). Prefer: real `h2` in MDX right under the frame; scrim shows the same string as `<p class="opener-title" aria-hidden="true">` for the cinematic overlay.

Wrap:

```mdx
<ChapterOpener still={STILLS.drop} kicker="Chapter" title="What this drop is">

## What this drop is

…existing prose and cards…

</ChapterOpener>
```

Import `STILLS` in MDX via `mdx-components` by passing it… MDX cannot import TS easily unless `page.tsx` provides it. **Locked:** add to `mdx-components.tsx`:

```tsx
import { STILLS } from "@/lib/stills";
import { ChapterOpener } from "@/components/ChapterOpener";
```

and put `ChapterOpener` and `STILLS` on the components map (`STILLS` as a dummy is wrong). Instead hardcode `still={STILLS.drop}` only works if MDX can import. Enable MDX imports in `next.config.mjs` if needed (`providerImportSource` already). In App Router with `@next/mdx`, local imports in MDX work:

```mdx
import { ChapterOpener } from "../components/ChapterOpener";
import { STILLS } from "../lib/stills";
```

Use those imports at the top of `article.mdx`.

- [ ] **Step 1: Wrap the six pictured chapters**
- [ ] **Step 2: Add checklist thumbs** (same src, `aria-hidden` on img)
- [ ] **Step 3:** `npx tsx scripts/verify-manifest.ts && npx tsx --test tests/*.test.ts && npx next build`  
  Expected: pass; HTML contains `/stills/drop.jpg` and the six alts
- [ ] **Step 4: Commit**

```bash
git add content/article.mdx mdx-components.tsx components/CreatorChecklist.tsx next.config.mjs
git commit -m "feat: wire chapter stills into the long-read"
```

---

### Task 5: Fluid scroll parallax

**Files:**
- Create: `lib/parallax.ts`
- Create: `components/OpenerParallax.tsx`
- Modify: `components/ChapterOpener.tsx` to wrap `.opener-img` with `OpenerParallax`
- Modify: `package.json` if `ScrollTrigger` needs nothing extra (it ships inside `gsap`)
- Test: `tests/parallax.test.ts`

**Interfaces:**
- Consumes: `shouldAnimate` from `lib/motion.ts` **or** new `shouldParallax` that is the same boolean
- Produces:

```ts
export function shouldParallax(prefersReduced: boolean): boolean {
  return !prefersReduced;
}

export const PARALLAX_FACTOR = 0.28;
```

`OpenerParallax` is `"use client"`. `useGSAP` + `ScrollTrigger` registered once. For the img: `yPercent` from `-14` to `14` (≈ 0.28 of the extra 25% height) with `scrub: true`, `trigger` = `.opener-frame`, `start: "top bottom"`, `end: "bottom top"`. **No `pin`.** If `shouldParallax` is false, do not create the tween.

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { shouldParallax, PARALLAX_FACTOR } from "../lib/parallax";

test("parallax is off when the reader asked for less motion", () => {
  assert.equal(shouldParallax(true), false);
  assert.equal(shouldParallax(false), true);
  assert.equal(PARALLAX_FACTOR, 0.28);
});
```

- [ ] **Step 1: Write failing test**
- [ ] **Step 2: Run** `npx tsx --test tests/parallax.test.ts` — Expected: missing module
- [ ] **Step 3: Implement helper + OpenerParallax + wire into ChapterOpener**
- [ ] **Step 4: Tests + build**
- [ ] **Step 5: Commit**

```bash
git add lib/parallax.ts tests/parallax.test.ts components/OpenerParallax.tsx components/ChapterOpener.tsx
git commit -m "feat: add fluid scroll-scrubbed opener parallax"
```

---

### Task 6: Verify

**Files:**
- Modify: `docs/research/inventory.md` — short “Visual lexicon” verification note

- [ ] **Step 1:** `npm test && npm run verify && npm run build`
- [ ] **Step 2:** Browser: scroll the full page — stills must drift continuously with the wheel, reverse on scroll-up, no pin. 390px: no overflow. Reduced-motion: stills static. Checklist thumbs match chapters. Contrast on scrim text.
- [ ] **Step 3:** Confirm no Imagine text/logos in the stills.
- [ ] **Step 4:** Commit note; push `feat/creator-longread-redesign`

```bash
git add docs/research/inventory.md
git commit -m "docs: record visual-lexicon verification"
```

---

## Spec coverage

| Spec | Task |
| --- | --- |
| Dark Swiss tokens + Newsreader/Roboto | 1 |
| ChapterOpener + mapping | 2, 4 |
| Imagine master + six stills | 3 |
| Checklist crops | 4 |
| Fluid scrubbed parallax 0.28, no pin | 5 |
| Reduced motion | 1, 5 |
| Evidence / no gaming | 4 (unchanged cards) |
| Verify + browser | 6 |
