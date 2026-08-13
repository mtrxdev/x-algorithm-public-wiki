# X Algorithm Public Wiki — Design Spec

Date: 2026-08-13  
Status: Approved in conversation; awaiting user review of this written spec  
Workspace: `/home/ubuntu/x-algorithm`  
Upstream source of truth: https://github.com/xai-org/x-algorithm

## 1. Purpose

Build a **public, evidence-backed explainer website** that answers one question in plain language:

> What can a regular person actually make, build, or run from the public `xai-org/x-algorithm` drop?

The reader is a **journalist or curious member of the public**, not an engineer looking for a tutorial.

This is **not** a product that runs X’s live For You ranking. It is a report about the public repository.

## 2. Success criteria

Done means all of the following are true:

- A **single long article** is live on **Vercel**, deployed from a **new public GitHub repo** created from this workspace.
- The article lists **concrete, realistic** things a person could make, build, or run, written so a non-engineer can follow.
- Every capability claim sits next to a **real excerpt** from the public repo (file path, line range, upstream commit SHA).
- A dedicated **“what this drop does not include / what you cannot do”** section has equal weight and is also evidence-backed.
- No claim goes beyond what the public tree supports. If a file cannot be quoted, the item does not ship.
- The site was checked in a browser (desktop and a narrow viewport): the article renders, the table of contents works, excerpts are readable.
- A review pass is completed before calling the job finished.

## 3. Non-goals

- Do not speculate about X’s private production ranking stack.
- Do not write “how to game the algorithm” or growth-hacking advice.
- Do not claim the public drop is the full live For You system unless a file in the repo says that.
- Do not publish the full upstream clone on our site or in our GitHub repo.
- Do not add extra pages, search, accounts, a CMS, or a backend.
- Do not pre-invent a capability list in this spec. The list is a research output.

## 4. Approach chosen

**Next.js + MDX long article** (Approach B).

Rejected:

- Approach A (static HTML from markdown) — simpler, but the user chose Next.js for sticky TOC, typography, and code blocks.
- Approach C (Astro/Docusaurus wiki chrome) — extra docs tooling for content that is one article.

Keep the Next.js surface small: one route, one layout, no app features.

## 5. Architecture

Four pieces, kept separate:

### 5.1 Research clone (local only)

- Read-only checkout of `https://github.com/xai-org/x-algorithm`.
- Path: `vendor/x-algorithm/` (gitignored; never committed).
- Used only to inventory files and copy short excerpts.
- Record the exact **commit SHA** and fetch date. That SHA is shown in the article footer.

### 5.2 Wiki site (this repository)

A small Next.js app in `/home/ubuntu/x-algorithm`:

| Unit | What it does | How you use it | Depends on |
| --- | --- | --- | --- |
| `app/page` (or equivalent) | Renders the one long article at `/` | Default Vercel URL | MDX article + layout |
| Article MDX | The report prose and headings | Edit markdown | Excerpt components |
| `EvidenceBlock` | Layman text beside a cited code excerpt | Pass headline, prose, citation | Excerpt files + manifest |
| `LimitBlock` | Same card shape for cannot-do items | Pass headline, prose, citation | Excerpt files + manifest |
| Article layout | Header, sticky TOC from headings, footer | Wraps the MDX | Headings in the article |
| Excerpt store | Copied snippets + citation metadata | Build reads these files | Research clone (at copy time) |
| Excerpt manifest | Path, SHA, start line, end line, excerpt file | Tests and footer | Upstream commit |

Suggested layout (implementation may rename files as long as the units stay this small):

```
/
  app/
    layout.tsx
    page.tsx          # loads the MDX article
    not-found.tsx     # link back to /
  content/
    article.mdx
    excerpts/         # one file per cited snippet
    manifest.json     # citations
  components/
    ArticleLayout.tsx
    EvidenceBlock.tsx
    LimitBlock.tsx
    TableOfContents.tsx
  vendor/             # gitignored upstream clone
  docs/superpowers/   # this spec and later plan
```

### 5.3 GitHub

- Create a **new public repository** from this workspace.
- Contains the Next.js app, article, excerpts, manifest, README.
- README states: this site is an independent explainer; source of claims is `xai-org/x-algorithm` at commit SHA; not affiliated with X or xAI beyond using their public code.

### 5.4 Vercel

- Deploy the GitHub repo with the default Next.js preset.
- No serverless APIs, no environment secrets required for the article to render.
- Public URL is the deliverable surface.

### 5.5 Data flow

1. Clone upstream into `vendor/x-algorithm`.
2. Inventory the tree: README, license, scripts, configs, models, tests, comments that describe what is or is not included.
3. Draft only claims a file can support.
4. Copy short excerpts into `content/excerpts/` and record citations in `manifest.json`.
5. Write `content/article.mdx` in layman terms, using `EvidenceBlock` / `LimitBlock`.
6. Build and deploy.
7. Verify in the browser; then review.

## 6. Article shape

One scrollable page. Sticky table of contents. Fixed headings; **capability items are filled only after reading the repo**.

### 6.1 Fixed skeleton

1. **Title + lede** — This page is a layman report on what the public `x-algorithm` drop actually lets a person make, build, or run.
2. **What X released** — The repo’s own words (README, license, top-level folders). A plain map of the tree, not a theory of the live feed.
3. **How to read this page** — Every claim has a file path, line range, and upstream commit SHA. Code boxes are evidence, not tutorials.
4. **What you can actually run** — Commands, scripts, tests, or other runnable pieces the repo ships and a regular person could realistically attempt.
5. **What you can actually build or reuse** — Libraries, models, configs, or copyable pieces, only if the files support that use.
6. **What you cannot do / what is missing** — Equal weight. Only limits the repo supports: missing data, unreleased services, license limits, unfinished pipelines, comments that say something is not included.
7. **How we checked** — Date, exact upstream commit, method (read the public tree; we did not infer private systems).
8. **Sources** — Links to the upstream GitHub repo and cited files (permalinks at the recorded SHA).

### 6.2 Card shape (run items, build items, and cannot-do items)

Each item includes:

- A headline a non-engineer can repeat.
- Two to four sentences of plain English. Jargon is explained in the same sentence or dropped.
- What you would need, if that need is stated in the repo (for run/build cards).
- A side-by-side (or stacked on small screens) pair: layman text | real excerpt.
- A visible citation: `path`, line range, commit SHA, link to the file at that SHA on GitHub.

If we cannot quote a file, the item does not ship.

### 6.3 Voice

- Short sentences. Everyday words.
- Say “this folder,” “this script,” “this license,” not “the candidate retrieval subsystem” unless the article immediately defines it.
- Do not anthropomorphize the algorithm.
- Do not pad with history or culture-war framing. Stay on what the files show.

## 7. Evidence contract

This is the hard rule of the project.

### 7.1 What counts as evidence

- A file that exists in `xai-org/x-algorithm` at the recorded commit.
- Quoted with enough surrounding lines to be fair (do not crop a comment so it reverses meaning).
- Citation fields: `repo`, `commit`, `path`, `start_line`, `end_line`.

### 7.2 What does not count

- News articles about the algorithm, unless we are only linking them as optional further reading and not as proof of a capability.
- “Everyone knows X does Y.”
- Behavior inferred from older Twitter/X algorithm leaks or the 2023 open source drop, unless that same file is in **this** repo.
- Claims about live traffic, private models, or unreleased services.

### 7.3 Manifest

`content/manifest.json` is a list of citations. Every `EvidenceBlock` and `LimitBlock` must reference a manifest id. The build or a test fails if:

- the article references a missing id, or
- a manifest entry has no excerpt file, or
- (when `vendor/x-algorithm` is present) the excerpt bytes do not match that path and line range at the recorded SHA.

### 7.4 Excerpt length

- Prefer the smallest quote that supports the sentence.
- Do not dump whole files onto the page.
- If a license or README is long, quote the relevant paragraph and link the rest.

## 8. Error handling

- **Missing excerpt or manifest mismatch:** fail the build or the verification script. Do not ship an unsourced card.
- **Unknown routes:** `not-found` page with a link back to `/`.
- **No user input:** no forms, no query-driven content, nothing to sanitize beyond normal Next.js page rendering.
- **Upstream clone missing on a fresh machine:** the committed excerpts still render; the match-against-vendor check is skipped or reported as “clone not present,” and is required before we claim verification is complete on the authoring machine.

## 9. Testing and verification

Before claiming done:

1. **Inventory note** — A short research note at `docs/research/inventory.md` listing top-level paths we read and the SHA. This is for reviewers, not for the public lede.
2. **Manifest check** — Script or test: every card id exists; every excerpt file exists; when vendor is present, excerpts match.
3. **Copy check** — Read the article as a non-engineer: every section in the skeleton is present; no unsourced capability; cannot-do section is not an afterthought.
4. **Browser check** — Open the deployed or local site. Scroll the full article. Click TOC anchors. Confirm desktop and a narrow (mobile) width. Confirm code excerpts are readable and citations are visible.
5. **Review pass** — Follow the requesting-code-review skill on the uncommitted or branch work before treating the job as finished.

## 10. Visual design (minimal)

Not a visual product. Requirements only:

- Readable serif or clean sans, comfortable measure (~65–75 characters).
- Sticky TOC on wide screens; a compact in-page contents list on small screens.
- Evidence cards: text and code stacked on mobile, two columns on desktop when space allows.
- High contrast. No dark-pattern chrome. A short header: article title + one line that this is an independent explainer of public code.
- Print/PDF friendly enough that a journalist can print the page.

No brand of X or xAI beyond factual names and links. No unofficial logos.

## 11. Implementation order (for the later plan)

1. Add `.gitignore` for `vendor/`, `node_modules/`, Next.js build output.
2. Scaffold the minimal Next.js + MDX app with layout, TOC, and empty article skeleton.
3. Clone upstream; record SHA; write the inventory note.
4. Select run/build/cannot-do items that the files actually support.
5. Copy excerpts; write the manifest.
6. Write the article in layman terms.
7. Add the manifest verification script.
8. Create the GitHub repo; deploy to Vercel.
9. Browser-verify; run requesting-code-review; fix issues.

## 12. Open decisions (resolved)

| Topic | Decision |
| --- | --- |
| Folder | `/home/ubuntu/x-algorithm` |
| Audience | Curious public / journalists |
| Shape | One long article |
| Limits | Dedicated cannot-do section, evidence-backed |
| Site stack | Next.js + MDX |
| Hosting | New GitHub repo → Vercel |
| Capability list | Not specified here; produced from the repo |

No remaining TBD in this spec.
