# Creator Long-Read Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the existing one-page explainer as a warm-paper creator long-read with a sourced jump checklist and quiet GSAP, without adding gaming advice or breaking the evidence contract.

**Architecture:** Keep Next.js App Router, MDX, EvidenceBlock, LimitBlock, and `content/manifest.json`. Add `CreatorChecklist` (data + component) and a small motion helper that no-ops under `prefers-reduced-motion`. Rewrite `content/article.mdx` into fixed chapters; restyle `app/globals.css` to warm paper tokens.

**Tech Stack:** Next.js 15, React 19, MDX, existing verifier, GSAP + `@gsap/react`.

## Global Constraints

- Reader is a creator on X (and a journalist can still follow the page).
- One URL (`/`) only. No extra pages, accounts, CMS, or backend.
- Every teaching claim sits next to a real excerpt: file path, line range, upstream commit SHA.
- Dedicated cannot-do / missing section stays equal weight.
- If we cannot quote a file, the checklist row or sentence does not ship.
- Do not write how to evade filters, farm rank, or game For You.
- Do not claim the public drop is the full live For You system.
- Do not publish `vendor/x-algorithm/`.
- Visual: warm paper `#f4efe6` / ink `#1c1914` / muted `#6b6358` / rule `#cfc6b8` / code `#ece6da`.
- Motion: transform/opacity only; 200–300ms ease-out; skip all motion when `prefers-reduced-motion: reduce`.
- Evidence verifier remains a build gate (`tsx scripts/verify-manifest.ts && next build`).
- Keep existing citation ids unless adding a newly extracted one.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `lib/checklist.ts` | `ChecklistItem` list: label + `href` + `citationId` |
| `lib/motion.ts` | `shouldAnimate(): boolean` |
| `components/CreatorChecklist.tsx` | Renders the jump list |
| `components/ChapterMotion.tsx` | Optional GSAP fade on chapters |
| `app/globals.css` | Warm-paper tokens and layout |
| `components/ArticleLayout.tsx` | Masthead copy + checklist slot |
| `content/article.mdx` | Chaptered creator copy + existing cards |
| `package.json` | Add `gsap` and `@gsap/react` |
| `tests/checklist.test.ts` | Every item id exists in a fixture manifest |
| `tests/motion.test.ts` | `shouldAnimate` respects reduced-motion flag |

---

### Task 1: Checklist data (TDD)

**Files:**
- Create: `lib/checklist.ts`
- Test: `tests/checklist.test.ts`

**Interfaces:**
- Consumes: citation ids already in `content/manifest.json`
- Produces:
  - `ChecklistItem = { id: string; label: string; href: string; citationId: string }`
  - `CHECKLIST: ChecklistItem[]` in this exact order:

```ts
export type ChecklistItem = {
  id: string;
  label: string;
  href: string;
  citationId: string;
};

export const CHECKLIST: ChecklistItem[] = [
  { id: "vis", label: "Visibility rules (show, drop, or cover a post)", href: "#visibility-rules", citationId: "visibility-rules" },
  { id: "labels", label: "Named label systems (Grox, scarecrow, botmaker)", href: "#readme-not-published", citationId: "readme-not-published" },
  { id: "prompts", label: "Grox prompt files are not in this drop", href: "#grox-prompts-excluded", citationId: "grox-prompts-excluded" },
  { id: "ads", label: "Ads and Who to Follow sit around ranked posts", href: "#ads-who-to-follow", citationId: "ads-who-to-follow" },
  { id: "gpu", label: "The practice ranking run needs a Linux NVIDIA GPU", href: "#phoenix-quickstart-requirements", citationId: "phoenix-quickstart-requirements" },
  { id: "weights", label: "Published scoring weights exist in the code", href: "#scoring-weights", citationId: "scoring-weights" },
];
```

`href` is `#` + the **card section id** that implementers will put on each matching card wrapper as `id={citationId}` in Task 3 (EvidenceBlock already can wrap `<section className="card">` — add `id={id}` there so these hashes work).

- [ ] **Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { CHECKLIST } from "../lib/checklist";

test("every checklist citationId exists in the real manifest", () => {
  const manifest = JSON.parse(fs.readFileSync("content/manifest.json", "utf8")) as {
    citations: { id: string }[];
  };
  const ids = new Set(manifest.citations.map((c) => c.id));
  assert.ok(CHECKLIST.length >= 6);
  for (const item of CHECKLIST) {
    assert.equal(item.href, `#${item.citationId}`);
    assert.ok(ids.has(item.citationId), `missing ${item.citationId}`);
  }
});

test("checklist labels do not contain gaming verbs", () => {
  const banned = /evade|farm|game the|boost your|get more reach/i;
  for (const item of CHECKLIST) {
    assert.equal(banned.test(item.label), false, item.label);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/checklist.test.ts`  
Expected: FAIL — cannot find `../lib/checklist`.

- [ ] **Step 3: Implement `lib/checklist.ts`** with the exact `CHECKLIST` array above.

- [ ] **Step 4: Re-run test**

Run: `npx tsx --test tests/checklist.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/checklist.ts tests/checklist.test.ts
git commit -m "feat: add sourced creator checklist data"
```

---

### Task 2: Warm-paper visual system

**Files:**
- Modify: `app/globals.css`
- Modify: `components/ArticleLayout.tsx`
- Modify: `components/EvidenceBlock.tsx` (add `id={id}` on the `<section>`)
- Modify: `components/LimitBlock.tsx` (same)

**Interfaces:**
- Consumes: existing layout props
- Produces: CSS variables `--paper: #f4efe6; --ink: #1c1914; --muted: #6b6358; --line: #cfc6b8; --code: #ece6da;`
- Evidence/Limit sections expose `id={id}` so checklist hrefs work

- [ ] **Step 1: Set tokens and masthead copy**

Replace `:root` colors with the spec hex values. Keep the grid/TOC/card layout. Masthead title becomes: `What the public ranking files say about your posts`. Kicker stays `Independent explainer of public code`. Lede: this is not X, not the live feed, and not a score for your account.

EvidenceBlock / LimitBlock root:

```tsx
<section className="card" id={id}>
```

- [ ] **Step 2: Build check**

Run: `npx tsx --test tests/*.test.ts && npx next build`  
Expected: tests pass; build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css components/ArticleLayout.tsx components/EvidenceBlock.tsx components/LimitBlock.tsx
git commit -m "style: apply warm-paper editorial tokens"
```

---

### Task 3: CreatorChecklist component

**Files:**
- Create: `components/CreatorChecklist.tsx`
- Modify: `components/ArticleLayout.tsx` to render it under the lede
- Modify: `mdx-components.tsx` only if needed (not required)

**Interfaces:**
- Consumes: `CHECKLIST` from `lib/checklist.ts`
- Produces: `<nav aria-label="What the files say can affect a post">` with an `<ol>` of links

```tsx
import { CHECKLIST } from "@/lib/checklist";

export function CreatorChecklist() {
  return (
    <nav className="checklist" aria-label="What the files say can affect a post">
      <p className="kicker">What the files say can affect a post</p>
      <p>These are named systems in the public folder. This is not a score for your account.</p>
      <ol>
        {CHECKLIST.map((item) => (
          <li key={item.id}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

Style `.checklist` as ink-bordered rows (no colorful pills). Place `<CreatorChecklist />` in `ArticleLayout` after the lede.

- [ ] **Step 1: Add the component and mount it**
- [ ] **Step 2: `npx next build`** — Expected: success; view `/` HTML contains the six labels and `href="#visibility-rules"` etc.
- [ ] **Step 3: Commit**

```bash
git add components/CreatorChecklist.tsx components/ArticleLayout.tsx app/globals.css
git commit -m "feat: add creator jump checklist"
```

---

### Task 4: Chapter the article (copy only)

**Files:**
- Modify: `content/article.mdx`

**Interfaces:**
- Consumes: existing EvidenceBlock / LimitBlock ids
- Produces: these **exact** h2 strings (TOC ids depend on them):

1. `What this drop is`  
2. `How a post is found`  
3. `How it is scored`  
4. `What can hide or cover it`  
5. `What is missing`  
6. `What you can actually run or reuse`  
7. `How we checked`  
8. `Sources`  

Keep every current `id="..."` card. Move cards into the chapter they belong to:

- found: `readme-lede`, `readme-components`  
- scored: `scoring-weights`, `bidirectional-boost`, `phoenix-optimizer` (limit)  
- hide/cover: `visibility-rules`, `interstitial-not-drawn`, `readme-not-published`  
- missing: `grox-prompts-excluded`, `ads-who-to-follow`, `bdsm-thresholds-redacted`, `bdsm-backing-stores`, `readme-deployment`  
- run/reuse: `readme-phoenix-runnable`, `phoenix-quickstart-requirements`, `phoenix-quickstart-limits`, `readme-license`, `bdsm-lede`  

Rewrite prose in creator-plain language. Ban: evade, farm, game the algorithm, get more reach, you should post.

Keep a short “How to read this page” **paragraph inside chapter 1**, not a ninth h2 (so extractHeadings stays the eight titles above).

- [ ] **Step 1: Rewrite MDX** with those eight h2s and all existing cards.
- [ ] **Step 2: Verify**

Run: `npx tsx scripts/verify-manifest.ts && npx tsx --test tests/*.test.ts && npx next build`  
Expected: manifest ok; tests pass; build succeeds.

- [ ] **Step 3: Commit**

```bash
git add content/article.mdx
git commit -m "docs: chapter the article for a creator long-read"
```

---

### Task 5: Quiet GSAP

**Files:**
- Modify: `package.json` (add deps)
- Create: `lib/motion.ts`
- Create: `components/ChapterMotion.tsx`
- Modify: `app/layout.tsx` or `ArticleLayout.tsx` to mount ChapterMotion
- Test: `tests/motion.test.ts`

**Interfaces:**
- Consumes: `window.matchMedia("(prefers-reduced-motion: reduce)")`
- Produces:
  - `shouldAnimate(prefersReduced: boolean): boolean` — `return !prefersReduced`
  - `ChapterMotion` client component: if `shouldAnimate`, fade `h2` from `opacity: 0, y: 8` to `opacity: 1, y: 0` duration `0.25`, ease `power2.out`. No pin, no scrub, no bounce.

```ts
export function shouldAnimate(prefersReduced: boolean): boolean {
  return !prefersReduced;
}
```

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { shouldAnimate } from "../lib/motion";

test("skips motion when the reader asked for less", () => {
  assert.equal(shouldAnimate(true), false);
  assert.equal(shouldAnimate(false), true);
});
```

- [ ] **Step 1: Write failing motion test**
- [ ] **Step 2: Run** `npx tsx --test tests/motion.test.ts` — Expected: module missing
- [ ] **Step 3: Implement `shouldAnimate` and ChapterMotion**

```bash
npm install gsap @gsap/react
```

`ChapterMotion.tsx` is `"use client"`. Use `useGSAP` from `@gsap/react`. Query `h2` inside `.shell`. If `matchMedia` says reduce, do nothing.

- [ ] **Step 4: Tests + build** — Expected: pass
- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json lib/motion.ts tests/motion.test.ts components/ChapterMotion.tsx components/ArticleLayout.tsx
git commit -m "feat: add reduced-motion-safe chapter fades"
```

---

### Task 6: Verify, deploy, review

**Files:**
- Modify: `docs/research/inventory.md` — append a Redesign verification note
- Remote: existing `mtrxdev/x-algorithm-public-wiki`

- [ ] **Step 1: Run** `npm test && npm run verify && npm run build` — Expected: all green
- [ ] **Step 2: Browser** — `/`, every checklist hash, TOC, 404, 390px, reduced-motion. No overflow.
- [ ] **Step 3: Copy check** — no gaming verbs; eight chapters; cannot-do still substantial
- [ ] **Step 4: Push the feature branch** so Vercel git-deploys (do not CLI-upload `vendor/`)
- [ ] **Step 5: Commit verification note**

```bash
git add docs/research/inventory.md
git commit -m "docs: record redesign verification"
```

- [ ] **Step 6:** requesting-code-review on the branch before treating the job as finished

---

## Spec coverage

| Spec | Task |
| --- | --- |
| Warm paper visual | 2 |
| Checklist, no score | 1, 3 |
| Chapter order | 4 |
| Creator voice, no gaming | 1 test + 4 |
| Evidence contract | 4 verify |
| GSAP + reduced motion | 5 |
| One URL, no extra product | all |
| Browser + review + Vercel | 6 |
