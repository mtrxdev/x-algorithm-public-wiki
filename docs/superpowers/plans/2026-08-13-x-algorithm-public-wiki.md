# X Algorithm Public Wiki Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship one long, layman-language Next.js article on Vercel that lists only what a regular person can actually make, build, or run from the public `xai-org/x-algorithm` repo, with a real code excerpt beside every claim.

**Architecture:** A tiny Next.js App Router site at `/` renders one MDX article. Evidence lives in committed excerpt files plus `content/manifest.json`. A gitignored clone at `vendor/x-algorithm/` is the authoring source of truth. A verify function fails the build if a card cites a missing id or an excerpt that does not match the clone.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, `@next/mdx`, Node.js built-in test runner via `tsx`, GitHub (`mtrxdev/x-algorithm-public-wiki`), Vercel.

## Global Constraints

- Reader is a journalist or curious member of the public, not an engineer looking for a tutorial.
- One long article at `/` only. No extra pages, search, accounts, CMS, or backend.
- Every capability claim sits next to a real excerpt: file path, line range, upstream commit SHA.
- Dedicated cannot-do section has equal weight and is also evidence-backed.
- If we cannot quote a file, the item does not ship.
- Do not speculate about X’s private production ranking stack.
- Do not write how to game the algorithm.
- Do not claim the public drop is the full live For You system unless a file in the repo says that.
- Do not publish the full upstream clone. Path `vendor/x-algorithm/` is gitignored.
- Voice: short sentences, everyday words. Jargon is explained in the same sentence or dropped.
- Independent explainer: no unofficial X/xAI logos; factual names and links only.
- Upstream repo: `xai-org/x-algorithm`. Authoring SHA at plan time: `a389166f6cf5da70a286b568c87695d4dcdce3a1` (re-record after clone).
- Workspace: `/home/ubuntu/x-algorithm`. New public GitHub repo → Vercel is the deliverable surface.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `.gitignore` | Ignore `vendor/`, `node_modules/`, `.next/`, Vercel junk |
| `package.json` | Next.js app, `test` and `verify` scripts |
| `tsconfig.json` | TypeScript for the app and `lib/` |
| `next.config.mjs` | Enable MDX |
| `mdx-components.tsx` | Map MDX tags to React components |
| `app/layout.tsx` | HTML shell, title, independent-explainer note |
| `app/page.tsx` | Load the MDX article |
| `app/globals.css` | Readable long-article styles |
| `app/not-found.tsx` | Link back to `/` |
| `lib/types.ts` | `Citation`, `Manifest`, `VerifyResult` |
| `lib/loadManifest.ts` | `loadManifest(rootDir)` |
| `lib/verifyManifest.ts` | `verifyManifest(rootDir, articleIds?)` |
| `lib/githubPermalink.ts` | `githubPermalink(citation)` |
| `lib/headings.ts` | `extractHeadings(markdown)` for the TOC |
| `components/EvidenceBlock.tsx` | Run/build card: prose + excerpt + citation |
| `components/LimitBlock.tsx` | Cannot-do card: same shape |
| `components/ArticleLayout.tsx` | Header, article column, footer with SHA |
| `components/TableOfContents.tsx` | Sticky TOC on wide screens |
| `content/manifest.json` | All citations |
| `content/excerpts/*.txt` | Copied snippets, one file per citation |
| `content/article.mdx` | The public article |
| `scripts/verify-manifest.ts` | CLI wrapper; also used as `next.config` check |
| `scripts/extract-excerpt.ts` | Copy line ranges from `vendor/` into `content/excerpts/` |
| `tests/verify-manifest.test.ts` | Evidence-contract tests |
| `tests/githubPermalink.test.ts` | Permalink formatter tests |
| `tests/headings.test.ts` | TOC heading parser tests |
| `docs/research/inventory.md` | Reviewer inventory (not the public lede) |
| `README.md` | What this site is; SHA; not affiliated |

---

### Task 1: Evidence contract library (TDD)

The site must not be able to ship an unsourced card. Build the checker first.

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `lib/types.ts`
- Create: `lib/loadManifest.ts`
- Create: `lib/verifyManifest.ts`
- Create: `lib/githubPermalink.ts`
- Create: `scripts/verify-manifest.ts`
- Test: `tests/verify-manifest.test.ts`
- Test: `tests/githubPermalink.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `Citation = { id: string; repo: "xai-org/x-algorithm"; commit: string; path: string; start_line: number; end_line: number; excerpt_file: string }`
  - `Manifest = { repo: "xai-org/x-algorithm"; commit: string; fetched_at: string; citations: Citation[] }`
  - `VerifyError = { code: "missing_excerpt" \| "missing_citation" \| "excerpt_mismatch" \| "invalid_range" \| "article_unknown_id"; message: string }`
  - `VerifyResult = { ok: boolean; errors: VerifyError[]; vendorPresent: boolean }`
  - `loadManifest(rootDir: string): Manifest`
  - `verifyManifest(rootDir: string, articleIds?: string[]): VerifyResult`
  - `githubPermalink(citation: Citation): string` → `https://github.com/xai-org/x-algorithm/blob/${commit}/${path}#L${start_line}-L${end_line}`

- [ ] **Step 1: Write package.json, tsconfig, gitignore**

```json
{
  "name": "x-algorithm-public-wiki",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "tsx --test tests/*.test.ts",
    "verify": "tsx scripts/verify-manifest.ts"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "typescript": "^5.6.3",
    "@types/node": "^22.10.0"
  }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "jsx": "preserve",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["app", "components", "lib", "scripts", "tests", "mdx-components.tsx"]
}
```

`.gitignore`:

```
node_modules
.next
out
vendor
.vercel
*.log
.env*
```

- [ ] **Step 2: Install and write the failing tests**

Run: `npm install`

Create `tests/githubPermalink.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { githubPermalink } from "../lib/githubPermalink";
import type { Citation } from "../lib/types";

test("builds a GitHub blob permalink with line range", () => {
  const citation: Citation = {
    id: "readme-lede",
    repo: "xai-org/x-algorithm",
    commit: "a389166f6cf5da70a286b568c87695d4dcdce3a1",
    path: "README.md",
    start_line: 1,
    end_line: 3,
    excerpt_file: "readme-lede.txt",
  };
  assert.equal(
    githubPermalink(citation),
    "https://github.com/xai-org/x-algorithm/blob/a389166f6cf5da70a286b568c87695d4dcdce3a1/README.md#L1-L3",
  );
});
```

Create `tests/verify-manifest.test.ts`:

```ts
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { verifyManifest } from "../lib/verifyManifest";
import type { Manifest } from "../lib/types";

function writeFixture(opts: {
  excerpt?: string;
  vendorText?: string;
  citationId?: string;
  start?: number;
  end?: number;
}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wiki-"));
  fs.mkdirSync(path.join(root, "content", "excerpts"), { recursive: true });
  const id = opts.citationId ?? "readme-lede";
  const manifest: Manifest = {
    repo: "xai-org/x-algorithm",
    commit: "abc123",
    fetched_at: "2026-08-13T00:00:00Z",
    citations: [
      {
        id,
        repo: "xai-org/x-algorithm",
        commit: "abc123",
        path: "README.md",
        start_line: opts.start ?? 1,
        end_line: opts.end ?? 1,
        excerpt_file: "readme-lede.txt",
      },
    ],
  };
  fs.writeFileSync(path.join(root, "content", "manifest.json"), JSON.stringify(manifest));
  if (opts.excerpt !== undefined) {
    fs.writeFileSync(path.join(root, "content", "excerpts", "readme-lede.txt"), opts.excerpt);
  }
  if (opts.vendorText !== undefined) {
    fs.mkdirSync(path.join(root, "vendor", "x-algorithm"), { recursive: true });
    fs.writeFileSync(path.join(root, "vendor", "x-algorithm", "README.md"), opts.vendorText);
  }
  return root;
}

test("fails when excerpt file is missing", () => {
  const root = writeFixture({});
  const result = verifyManifest(root);
  assert.equal(result.ok, false);
  assert.equal(result.errors[0]?.code, "missing_excerpt");
});

test("passes without vendor when excerpt exists", () => {
  const root = writeFixture({ excerpt: "hello\n" });
  const result = verifyManifest(root);
  assert.equal(result.ok, true);
  assert.equal(result.vendorPresent, false);
});

test("fails when vendor is present and excerpt does not match lines", () => {
  const root = writeFixture({
    excerpt: "wrong\n",
    vendorText: "hello\nworld\n",
    start: 1,
    end: 1,
  });
  const result = verifyManifest(root);
  assert.equal(result.ok, false);
  assert.equal(result.errors[0]?.code, "excerpt_mismatch");
  assert.equal(result.vendorPresent, true);
});

test("passes when vendor lines match the excerpt", () => {
  const root = writeFixture({
    excerpt: "hello\n",
    vendorText: "hello\nworld\n",
    start: 1,
    end: 1,
  });
  const result = verifyManifest(root);
  assert.equal(result.ok, true);
});

test("fails when article references an unknown citation id", () => {
  const root = writeFixture({ excerpt: "hello\n" });
  const result = verifyManifest(root, ["readme-lede", "not-real"]);
  assert.equal(result.ok, false);
  assert.equal(result.errors.some((e) => e.code === "article_unknown_id"), true);
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx tsx --test tests/githubPermalink.test.ts tests/verify-manifest.test.ts`

Expected: FAIL — `Cannot find module '../lib/githubPermalink'` and `Cannot find module '../lib/verifyManifest'`.

- [ ] **Step 4: Implement types and functions**

`lib/types.ts`:

```ts
export type Citation = {
  id: string;
  repo: "xai-org/x-algorithm";
  commit: string;
  path: string;
  start_line: number;
  end_line: number;
  excerpt_file: string;
};

export type Manifest = {
  repo: "xai-org/x-algorithm";
  commit: string;
  fetched_at: string;
  citations: Citation[];
};

export type VerifyError = {
  code:
    | "missing_excerpt"
    | "missing_citation"
    | "excerpt_mismatch"
    | "invalid_range"
    | "article_unknown_id";
  message: string;
};

export type VerifyResult = {
  ok: boolean;
  errors: VerifyError[];
  vendorPresent: boolean;
};
```

`lib/githubPermalink.ts`:

```ts
import type { Citation } from "./types";

export function githubPermalink(citation: Citation): string {
  return `https://github.com/${citation.repo}/blob/${citation.commit}/${citation.path}#L${citation.start_line}-L${citation.end_line}`;
}
```

`lib/loadManifest.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import type { Manifest } from "./types";

export function loadManifest(rootDir: string): Manifest {
  const raw = fs.readFileSync(path.join(rootDir, "content", "manifest.json"), "utf8");
  return JSON.parse(raw) as Manifest;
}
```

`lib/verifyManifest.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { loadManifest } from "./loadManifest";
import type { VerifyError, VerifyResult } from "./types";

function excerptPath(rootDir: string, excerptFile: string): string {
  return path.join(rootDir, "content", "excerpts", excerptFile);
}

function vendorFile(rootDir: string, rel: string): string {
  return path.join(rootDir, "vendor", "x-algorithm", rel);
}

function sliceLines(text: string, start: number, end: number): string {
  const lines = text.split("\n");
  return lines.slice(start - 1, end).join("\n") + (end >= start ? "\n" : "");
}

export function verifyManifest(rootDir: string, articleIds?: string[]): VerifyResult {
  const errors: VerifyError[] = [];
  const manifest = loadManifest(rootDir);
  const vendorRoot = path.join(rootDir, "vendor", "x-algorithm");
  const vendorPresent = fs.existsSync(vendorRoot);
  const ids = new Set(manifest.citations.map((c) => c.id));

  for (const citation of manifest.citations) {
    const file = excerptPath(rootDir, citation.excerpt_file);
    if (!fs.existsSync(file)) {
      errors.push({
        code: "missing_excerpt",
        message: `missing excerpt ${citation.excerpt_file} for ${citation.id}`,
      });
      continue;
    }
    if (citation.start_line < 1 || citation.end_line < citation.start_line) {
      errors.push({
        code: "invalid_range",
        message: `invalid range for ${citation.id}`,
      });
    }
    if (vendorPresent) {
      const source = vendorFile(rootDir, citation.path);
      if (!fs.existsSync(source)) {
        errors.push({
          code: "excerpt_mismatch",
          message: `vendor missing ${citation.path} for ${citation.id}`,
        });
        continue;
      }
      const expected = sliceLines(
        fs.readFileSync(source, "utf8"),
        citation.start_line,
        citation.end_line,
      );
      const actual = fs.readFileSync(file, "utf8");
      if (actual !== expected) {
        errors.push({
          code: "excerpt_mismatch",
          message: `excerpt does not match ${citation.path}:${citation.start_line}-${citation.end_line}`,
        });
      }
    }
  }

  if (articleIds) {
    for (const id of articleIds) {
      if (!ids.has(id)) {
        errors.push({
          code: "article_unknown_id",
          message: `article cites unknown id ${id}`,
        });
      }
    }
  }

  return { ok: errors.length === 0, errors, vendorPresent };
}
```

`scripts/verify-manifest.ts`:

```ts
import { verifyManifest } from "../lib/verifyManifest";

const root = process.cwd();
const result = verifyManifest(root);
if (!result.ok) {
  for (const error of result.errors) {
    console.error(`${error.code}: ${error.message}`);
  }
  process.exit(1);
}
console.log(
  result.vendorPresent
    ? "manifest ok (checked against vendor clone)"
    : "manifest ok (excerpt files present; vendor clone not present)",
);
```

Normalize excerpt comparison: when implementing, if the vendor slice test fails because of a trailing newline difference, make `sliceLines` match whatever `extract-excerpt` writes in Task 4 (always end excerpts with a single trailing newline). Adjust the test fixture excerpts to the same rule.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx tsx --test tests/githubPermalink.test.ts tests/verify-manifest.test.ts`

Expected: PASS (5 tests). If `excerpt_mismatch` fails on newline, fix `sliceLines` so both sides use `lines.slice(start-1, end).join("\n") + "\n"`, and write fixtures with that same ending.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json .gitignore lib tests scripts
git commit -m "feat: add evidence manifest verifier"
```

---

### Task 2: Next.js shell and article layout

**Files:**
- Modify: `package.json` (add next, react, MDX deps)
- Create: `next.config.mjs`
- Create: `mdx-components.tsx`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `app/not-found.tsx`
- Create: `components/ArticleLayout.tsx`
- Create: `lib/headings.ts`
- Create: `components/TableOfContents.tsx`
- Create: `content/article.mdx` (skeleton headings only)
- Test: `tests/headings.test.ts`

**Interfaces:**
- Consumes: none of the verifier APIs yet
- Produces:
  - `Heading = { id: string; text: string; level: 2 | 3 }`
  - `extractHeadings(markdown: string): Heading[]` — `##` and `###` only; `id` is kebab-case of the text
  - `ArticleLayout({ children, headings, commit, fetchedAt })`
  - `TableOfContents({ headings }: { headings: Heading[] })`
  - Route `/` renders the article; unknown routes render `not-found` with a link to `/`

- [ ] **Step 1: Write the failing headings test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { extractHeadings } from "../lib/headings";

test("extracts h2 and h3 with kebab ids", () => {
  const md = [
    "# Ignored title",
    "## What X released",
    "body",
    "### Deployment-related code",
    "## What you can actually run",
  ].join("\n");
  assert.deepEqual(extractHeadings(md), [
    { id: "what-x-released", text: "What X released", level: 2 },
    { id: "deployment-related-code", text: "Deployment-related code", level: 3 },
    { id: "what-you-can-actually-run", text: "What you can actually run", level: 2 },
  ]);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx tsx --test tests/headings.test.ts`

Expected: FAIL — `Cannot find module '../lib/headings'`.

- [ ] **Step 3: Implement extractHeadings**

`lib/headings.ts`:

```ts
export type Heading = { id: string; text: string; level: 2 | 3 };

export function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  for (const line of markdown.split("\n")) {
    const match = /^(#{2,3}) (.+)$/.exec(line);
    if (!match) continue;
    const level = match[1].length as 2 | 3;
    const text = match[2].trim();
    headings.push({ id: slug(text), text, level });
  }
  return headings;
}
```

- [ ] **Step 4: Re-run headings test**

Run: `npx tsx --test tests/headings.test.ts`

Expected: PASS.

- [ ] **Step 5: Add Next.js + MDX and the shell**

```bash
npm install next@15 react@19 react-dom@19 @next/mdx @mdx-js/loader @mdx-js/react
npm install -D @types/react @types/react-dom
```

`next.config.mjs`:

```js
import createMDX from "@next/mdx";

const withMDX = createMDX({ extension: /\.mdx?$/ });

export default withMDX({
  pageExtensions: ["ts", "tsx", "mdx"],
});
```

`mdx-components.tsx`:

```tsx
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => {
      const text = String(children);
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      return <h2 id={id}>{children}</h2>;
    },
    h3: ({ children }) => {
      const text = String(children);
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      return <h3 id={id}>{children}</h3>;
    },
    ...components,
  };
}
```

`app/globals.css` — readable long article:

```css
:root {
  color-scheme: light;
  --ink: #1a1a1a;
  --muted: #4a4a4a;
  --line: #d6d6d0;
  --paper: #f7f4ee;
  --code: #f0ece4;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font: 20px/1.55 "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
}
.shell { display: grid; grid-template-columns: 240px minmax(0, 72ch) ; gap: 2.5rem; max-width: 1100px; margin: 0 auto; padding: 2rem 1.25rem 6rem; }
.lede { font-size: 1.15rem; }
.kicker { font-size: 0.85rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); font-family: system-ui, sans-serif; }
.toc { position: sticky; top: 1.5rem; align-self: start; font-family: system-ui, sans-serif; font-size: 0.85rem; }
.toc a { color: var(--muted); text-decoration: none; }
.toc ol { list-style: none; padding: 0; }
.toc .h3 { padding-left: 0.8rem; }
article h2 { margin-top: 2.5rem; }
pre, code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.82rem; }
pre { background: var(--code); padding: 1rem; overflow: auto; border: 1px solid var(--line); }
.card { border-top: 1px solid var(--line); padding: 1.25rem 0 1.75rem; display: grid; gap: 1rem; }
@media (min-width: 900px) {
  .card { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 899px) {
  .shell { grid-template-columns: 1fr; }
  .toc { position: static; }
}
.cite { font-family: system-ui, sans-serif; font-size: 0.78rem; color: var(--muted); }
```

`components/TableOfContents.tsx`:

```tsx
import type { Heading } from "@/lib/headings";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  return (
    <nav className="toc" aria-label="Contents">
      <p className="kicker">Contents</p>
      <ol>
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "h3" : "h2"}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

`components/ArticleLayout.tsx`:

```tsx
import type { ReactNode } from "react";
import { TableOfContents } from "./TableOfContents";
import type { Heading } from "@/lib/headings";

export function ArticleLayout({
  children,
  headings,
  commit,
  fetchedAt,
}: {
  children: ReactNode;
  headings: Heading[];
  commit: string;
  fetchedAt: string;
}) {
  const short = commit.slice(0, 7);
  return (
    <div className="shell">
      <TableOfContents headings={headings} />
      <div>
        <p className="kicker">Independent explainer of public code</p>
        <header>
          <h1>What you can actually make from X’s public ranking code</h1>
          <p className="lede">
            A plain-language report on the public GitHub repository
            xai-org/x-algorithm. This page is not X, not xAI, and not the live
            For You feed.
          </p>
        </header>
        {children}
        <footer className="cite">
          Checked against xai-org/x-algorithm commit {short} on {fetchedAt}.
        </footer>
      </div>
    </div>
  );
}
```

`content/article.mdx` — skeleton only, exact heading text (TOC ids depend on these strings):

```mdx
## What X released

The public folder list and the repository’s own words go here after the inventory.

## How to read this page

Every claim on this page quotes a real file. The box next to the words is the evidence, not a tutorial.

## What you can actually run

Cards go here after excerpts exist.

## What you can actually build or reuse

Cards go here after excerpts exist.

## What you cannot do / what is missing

Cards go here after excerpts exist.

## How we checked

Method and commit go here.

## Sources

Links go here.
```

`app/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "What you can actually make from X’s public ranking code",
  description:
    "A layman report on what the public xai-org/x-algorithm repository lets a person make, build, or run.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`app/page.tsx` — for this task, render the MDX inside `ArticleLayout` with headings parsed from the MDX file on the server:

```tsx
import fs from "node:fs";
import path from "path";
import Article from "../content/article.mdx";
import { ArticleLayout } from "@/components/ArticleLayout";
import { extractHeadings } from "@/lib/headings";

export default function Page() {
  const source = fs.readFileSync(path.join(process.cwd(), "content/article.mdx"), "utf8");
  const headings = extractHeadings(source);
  return (
    <ArticleLayout headings={headings} commit="unknown" fetchedAt="not-yet">
      <Article />
    </ArticleLayout>
  );
}
```

`app/not-found.tsx`:

```tsx
export default function NotFound() {
  return (
    <main style={{ padding: "2rem", fontFamily: "Georgia, serif" }}>
      <p>That page is not part of this report.</p>
      <p>
        <a href="/">Back to the article</a>
      </p>
    </main>
  );
}
```

Add `"types": ["@types/mdx"]` if the Article import type-errors; or `npm install -D @types/mdx`.

- [ ] **Step 6: Run the site and confirm the skeleton**

Run: `npx next build`

Expected: successful build.

Then: `npx next dev --port 3000` and open `/`. Expected: title, seven h2s, TOC anchors. Open `/nope`. Expected: not-found with a link home.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json next.config.mjs mdx-components.tsx app components content/article.mdx lib/headings.ts tests/headings.test.ts
git commit -m "feat: add Next.js article shell and table of contents"
```

---

### Task 3: Evidence and limit cards

**Files:**
- Create: `components/EvidenceBlock.tsx`
- Create: `components/LimitBlock.tsx`
- Create: `content/manifest.json` (empty citations array is not allowed to ship; this task adds one fixture citation used only in tests, then the real seed citations)
- Create: `lib/getCitation.ts`
- Test: `tests/getCitation.test.ts`
- Modify: `mdx-components.tsx` to expose `EvidenceBlock` and `LimitBlock`
- Modify: `app/page.tsx` to pass commit/fetchedAt from the manifest once it exists

**Interfaces:**
- Consumes: `Citation`, `Manifest`, `loadManifest`, `githubPermalink`
- Produces:
  - `getCitation(manifest: Manifest, id: string): Citation` — throws `Error("unknown citation: " + id)` if missing
  - `EvidenceBlock({ id, headline, prose, need? }: { id: string; headline: string; prose: string; need?: string })`
  - `LimitBlock({ id, headline, prose }: { id: string; headline: string; prose: string })`
  - Both read `content/manifest.json` and `content/excerpts/${excerpt_file}` at render time
  - Both render: headline, 2–4 sentence prose, optional need line, `<pre>` of the excerpt, and a citation line `path:start-end · sha · link`

- [ ] **Step 1: Write the failing getCitation test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { getCitation } from "../lib/getCitation";
import type { Manifest } from "../lib/types";

const manifest: Manifest = {
  repo: "xai-org/x-algorithm",
  commit: "abc",
  fetched_at: "2026-08-13T00:00:00Z",
  citations: [
    {
      id: "readme-lede",
      repo: "xai-org/x-algorithm",
      commit: "abc",
      path: "README.md",
      start_line: 1,
      end_line: 3,
      excerpt_file: "readme-lede.txt",
    },
  ],
};

test("returns the citation with the matching id", () => {
  assert.equal(getCitation(manifest, "readme-lede").path, "README.md");
});

test("throws on unknown id", () => {
  assert.throws(() => getCitation(manifest, "nope"), /unknown citation: nope/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/getCitation.test.ts`

Expected: FAIL — module not found.

- [ ] **Step 3: Implement getCitation**

```ts
import type { Citation, Manifest } from "./types";

export function getCitation(manifest: Manifest, id: string): Citation {
  const found = manifest.citations.find((c) => c.id === id);
  if (!found) throw new Error(`unknown citation: ${id}`);
  return found;
}
```

- [ ] **Step 4: Re-run test**

Run: `npx tsx --test tests/getCitation.test.ts`

Expected: PASS.

- [ ] **Step 5: Implement the two card components**

`components/EvidenceBlock.tsx`:

```tsx
import fs from "node:fs";
import path from "node:path";
import { getCitation } from "@/lib/getCitation";
import { githubPermalink } from "@/lib/githubPermalink";
import { loadManifest } from "@/lib/loadManifest";

export function EvidenceBlock({
  id,
  headline,
  prose,
  need,
}: {
  id: string;
  headline: string;
  prose: string;
  need?: string;
}) {
  const manifest = loadManifest(process.cwd());
  const citation = getCitation(manifest, id);
  const excerpt = fs.readFileSync(
    path.join(process.cwd(), "content", "excerpts", citation.excerpt_file),
    "utf8",
  );
  return (
    <section className="card">
      <div>
        <h3>{headline}</h3>
        <p>{prose}</p>
        {need ? <p>{need}</p> : null}
        <p className="cite">
          <a href={githubPermalink(citation)}>
            {citation.path}:{citation.start_line}-{citation.end_line} · {citation.commit.slice(0, 7)}
          </a>
        </p>
      </div>
      <pre><code>{excerpt}</code></pre>
    </section>
  );
}
```

`components/LimitBlock.tsx` is the same markup without `need`. Do not share a vague `Card` helper unless both files stay under ~40 lines; duplication is fine.

Register them in `mdx-components.tsx`:

```tsx
import { EvidenceBlock } from "@/components/EvidenceBlock";
import { LimitBlock } from "@/components/LimitBlock";
```

and add `EvidenceBlock` and `LimitBlock` to the returned map.

- [ ] **Step 6: Commit**

```bash
git add lib/getCitation.ts tests/getCitation.test.ts components/EvidenceBlock.tsx components/LimitBlock.tsx mdx-components.tsx
git commit -m "feat: add evidence and limit cards"
```

---

### Task 4: Clone upstream and write the inventory

**Files:**
- Create: `docs/research/inventory.md`
- Create: `scripts/extract-excerpt.ts`
- Local only: `vendor/x-algorithm/` (must remain untracked)

**Interfaces:**
- Consumes: nothing from the site
- Produces:
  - `vendor/x-algorithm` at a recorded SHA
  - `extractExcerpt({ rootDir, relPath, startLine, endLine, outName })` written as CLI:
    `tsx scripts/extract-excerpt.ts --path README.md --start 1 --end 3 --out readme-lede`
    writes `content/excerpts/readme-lede.txt` using the same `sliceLines` rule as `verifyManifest`
  - Inventory file with the sections below filled from the clone, not from memory

- [ ] **Step 1: Clone the public repo**

```bash
mkdir -p vendor
git clone --depth 1 https://github.com/xai-org/x-algorithm.git vendor/x-algorithm
git -C vendor/x-algorithm rev-parse HEAD
date -u +%Y-%m-%dT%H:%M:%SZ
```

Expected: clone succeeds. Record SHA and UTC timestamp. Confirm `git check-ignore -v vendor/x-algorithm` reports `.gitignore`. If `vendor/` is not ignored, stop and fix `.gitignore` before anything else.

- [ ] **Step 2: Write extract-excerpt.ts**

```ts
import fs from "node:fs";
import path from "node:path";

function arg(name: string): string {
  const i = process.argv.indexOf(name);
  if (i === -1 || !process.argv[i + 1]) throw new Error(`missing ${name}`);
  return process.argv[i + 1];
}

const relPath = arg("--path");
const start = Number(arg("--start"));
const end = Number(arg("--end"));
const out = arg("--out");
const source = fs.readFileSync(path.join("vendor/x-algorithm", relPath), "utf8");
const lines = source.split("\n");
const text = lines.slice(start - 1, end).join("\n") + "\n";
fs.mkdirSync("content/excerpts", { recursive: true });
fs.writeFileSync(path.join("content/excerpts", `${out}.txt`), text);
console.log(`wrote content/excerpts/${out}.txt (${end - start + 1} lines)`);
```

- [ ] **Step 3: Walk the clone and fill the inventory**

List top-level names:

```bash
ls -1 vendor/x-algorithm
```

For **every** top-level file and directory, open its README or first source file and write one bullet in `docs/research/inventory.md` using this exact template:

```markdown
# Inventory of xai-org/x-algorithm

- SHA: <full sha>
- Fetched at: <ISO UTC>
- Method: read the public tree only. Did not infer private production systems.

## Top-level map

| Path | What the files themselves say it is | Runnable from this drop? | Notes / evidence file |
| --- | --- | --- | --- |
| README.md | ... | n/a | |
| LICENSE | ... | n/a | |
| phoenix/ | ... | yes / no / partial | QUICKSTART.md |
| ... | | | |

## Candidate run items

Each row must quote a file. Reject a row if you only “know” it from news.

| Working title | Evidence path | Why a regular person could attempt it |
| --- | --- | --- |

## Candidate build/reuse items

| Working title | Evidence path | Why reuse is realistic |
| --- | --- | --- |

## Candidate cannot-do items

| Working title | Evidence path | Limit the file actually states |
| --- | --- | --- |

## Rejected ideas

| Idea | Why it is not in the article |
| --- | --- |
```

Required starting rows for cannot-do (confirm line numbers in the clone; they were these at `a389166f6cf5da70a286b568c87695d4dcdce3a1` and may shift):

- Grox prompts and some botmaker rules are not published — `README.md` “What's not in this repo?”
- Production data, checkpoints, orchestration, and scale are not included — `phoenix/QUICKSTART.md` lines 3–6
- Many services may lack build/deploy files — `README.md` “Deployment-related code”
- Phoenix quickstart needs Linux, NVIDIA GPU, CUDA 12, uv, Python 3.11+, Rust, protoc — `phoenix/QUICKSTART.md` Requirements

Required starting rows for run:

- Proof-of-concept Phoenix train/serve on synthetic data — `phoenix/QUICKSTART.md` plus `README.md` line about phoenix shipping Cargo + pyproject + quickstart

Required starting rows for build/reuse:

- Apache License 2.0 — `README.md` License section and `LICENSE`
- Inspectable ranking/filter source a person can read and copy under that license — `README.md` “All of the code here is inspectable”
- Scoring-weight configuration the README says was added — only if you open the actual config file and quote it; do not claim weights you have not opened

Do not add “run the live For You feed.” The README’s “What's not in this repo?” and Phoenix quickstart contradict that.

- [ ] **Step 4: Commit the inventory and extractor only**

```bash
git add docs/research/inventory.md scripts/extract-excerpt.ts
git status
```

Expected: `vendor/` does not appear as untracked (ignored). Then:

```bash
git commit -m "docs: inventory the public x-algorithm tree"
```

---

### Task 5: Seed excerpts, manifest, and first cards

**Files:**
- Create: `content/excerpts/readme-lede.txt`
- Create: `content/excerpts/readme-phoenix-runnable.txt`
- Create: `content/excerpts/readme-not-published.txt`
- Create: `content/excerpts/readme-deployment.txt`
- Create: `content/excerpts/phoenix-quickstart-limits.txt`
- Create: `content/excerpts/phoenix-quickstart-requirements.txt`
- Create: `content/excerpts/readme-license.txt`
- Create: additional excerpt files named in the inventory
- Create: `content/manifest.json`
- Modify: `content/article.mdx`
- Modify: `app/page.tsx` to read `commit` and `fetched_at` from the manifest

**Interfaces:**
- Consumes: `extract-excerpt.ts`, `verifyManifest`, `EvidenceBlock`, `LimitBlock`
- Produces: a manifest whose `citations[].id` values are exactly the ids used in `article.mdx`

Citation ids locked by this plan (add more ids from the inventory; do not rename these):

| id | path | purpose |
| --- | --- | --- |
| `readme-lede` | `README.md` | What X released |
| `readme-phoenix-runnable` | `README.md` | Phoenix can be trained/served end to end |
| `readme-not-published` | `README.md` | Grox prompts / some botmaker rules missing |
| `readme-deployment` | `README.md` | Not every folder is meant to be deployed |
| `phoenix-quickstart-limits` | `phoenix/QUICKSTART.md` | Not production; no prod data |
| `phoenix-quickstart-requirements` | `phoenix/QUICKSTART.md` | Hardware/tooling needed to run Phoenix |
| `readme-license` | `README.md` | Apache 2.0 |

At SHA `a389166f6cf5da70a286b568c87695d4dcdce3a1` the ranges were:

```bash
npx tsx scripts/extract-excerpt.ts --path README.md --start 1 --end 3 --out readme-lede
npx tsx scripts/extract-excerpt.ts --path README.md --start 417 --end 419 --out readme-phoenix-runnable
npx tsx scripts/extract-excerpt.ts --path README.md --start 399 --end 406 --out readme-not-published
npx tsx scripts/extract-excerpt.ts --path README.md --start 417 --end 419 --out readme-deployment
npx tsx scripts/extract-excerpt.ts --path phoenix/QUICKSTART.md --start 1 --end 6 --out phoenix-quickstart-limits
npx tsx scripts/extract-excerpt.ts --path phoenix/QUICKSTART.md --start 10 --end 14 --out phoenix-quickstart-requirements
npx tsx scripts/extract-excerpt.ts --path README.md --start 467 --end 469 --out readme-license
```

Re-check line numbers with `nl -ba vendor/x-algorithm/README.md` after clone. If they shifted, extract the same *paragraphs*, then put the new numbers in the manifest. Do not keep stale line numbers.

- [ ] **Step 1: Extract the seed excerpts**

Run the commands above (or the updated line numbers). Expected: seven files under `content/excerpts/`.

- [ ] **Step 2: Write content/manifest.json**

Replace `COMMIT` and `FETCHED` with the values from Task 4.

```json
{
  "repo": "xai-org/x-algorithm",
  "commit": "COMMIT",
  "fetched_at": "FETCHED",
  "citations": [
    {
      "id": "readme-lede",
      "repo": "xai-org/x-algorithm",
      "commit": "COMMIT",
      "path": "README.md",
      "start_line": 1,
      "end_line": 3,
      "excerpt_file": "readme-lede.txt"
    },
    {
      "id": "readme-phoenix-runnable",
      "repo": "xai-org/x-algorithm",
      "commit": "COMMIT",
      "path": "README.md",
      "start_line": 417,
      "end_line": 419,
      "excerpt_file": "readme-phoenix-runnable.txt"
    },
    {
      "id": "readme-not-published",
      "repo": "xai-org/x-algorithm",
      "commit": "COMMIT",
      "path": "README.md",
      "start_line": 399,
      "end_line": 406,
      "excerpt_file": "readme-not-published.txt"
    },
    {
      "id": "readme-deployment",
      "repo": "xai-org/x-algorithm",
      "commit": "COMMIT",
      "path": "README.md",
      "start_line": 417,
      "end_line": 419,
      "excerpt_file": "readme-deployment.txt"
    },
    {
      "id": "phoenix-quickstart-limits",
      "repo": "xai-org/x-algorithm",
      "commit": "COMMIT",
      "path": "phoenix/QUICKSTART.md",
      "start_line": 1,
      "end_line": 6,
      "excerpt_file": "phoenix-quickstart-limits.txt"
    },
    {
      "id": "phoenix-quickstart-requirements",
      "repo": "xai-org/x-algorithm",
      "commit": "COMMIT",
      "path": "phoenix/QUICKSTART.md",
      "start_line": 10,
      "end_line": 14,
      "excerpt_file": "phoenix-quickstart-requirements.txt"
    },
    {
      "id": "readme-license",
      "repo": "xai-org/x-algorithm",
      "commit": "COMMIT",
      "path": "README.md",
      "start_line": 467,
      "end_line": 469,
      "excerpt_file": "readme-license.txt"
    }
  ]
}
```

If inventory produced more evidence-backed rows, append more citations the same way. Do not append a citation without an excerpt file.

- [ ] **Step 3: Run the verifier against the vendor clone**

Run: `npx tsx scripts/verify-manifest.ts`

Expected: `manifest ok (checked against vendor clone)`. If mismatch, fix the line ranges, do not “fix” the excerpt by hand-editing to make the test pass.

- [ ] **Step 4: Write the article cards in layman English**

Replace the placeholder paragraphs in `content/article.mdx` with real prose plus cards. Keep the seven h2 titles exactly as in Task 2. Required cards (more from inventory are allowed):

```mdx
## What X released

X published a public folder of code that, in the repository’s own words, is the core code that decides which posts a viewer sees in the For You feed. That is a statement about this folder, not a promise that you can turn on X’s live feed from your laptop.

<EvidenceBlock
  id="readme-lede"
  headline="This folder is the published For You ranking code"
  prose="The first lines of the repository say this is the core code that picks which posts a viewer sees in For You. It says those posts come from accounts the viewer follows and from accounts they do not, then get filtered and ranked."
/>

Then add a short folder map in everyday words, taken only from README names you opened (Thunder = recent posts from people you follow, Phoenix = the ranking model, visibility filtering = hide / show / cover a post, and so on). One or two sentences per folder you mention. If you did not open it, do not describe it.

## How to read this page

Every gray box is a quote from a file in that public folder. The small line under it is the file name, line numbers, and the exact commit we copied from. If a sentence cannot point at a box, it does not belong on this page.

## What you can actually run

<EvidenceBlock
  id="readme-phoenix-runnable"
  headline="You can try a tiny practice run of the ranking model"
  prose="The repository says some of this code is meant to be run from start to finish. The example it gives is training and running the Phoenix scoring model. That is a practice-size run they describe, not flipping on the real X feed."
  need="The Phoenix folder ships its own quickstart, a Python project file, and a Rust project file."
/>

<EvidenceBlock
  id="phoenix-quickstart-requirements"
  headline="That practice run expects a Linux computer with an NVIDIA graphics card"
  prose="The quickstart is blunt about the tools. You need Linux, an NVIDIA GPU with CUDA 12, a Python installer called uv, Python 3.11 or newer, a Rust compiler, and a program called protoc. If you do not have that machine, you can still read the code. You should not expect the training walkthrough to work on a normal laptop."
  need="These are the requirements printed in phoenix/QUICKSTART.md."
/>

## What you can actually build or reuse

<EvidenceBlock
  id="readme-license"
  headline="You may reuse the published files under the Apache 2.0 license"
  prose="The repository says it is licensed under Apache License 2.0 and points at the LICENSE file. That is permission to read, copy, and build on the published files under that license. It is not permission to use X’s name, private data, or unreleased files."
/>

## What you cannot do / what is missing

<LimitBlock
  id="phoenix-quickstart-limits"
  headline="You cannot recreate X’s live ranking setup from this walkthrough"
  prose="The Phoenix quickstart says the walkthrough is not a production-quality model and not a production-scale setup. It says production data, saved models, the computers that run the real feed, and that scale are not included. A successful practice run still is not the For You feed."
/>

<LimitBlock
  id="readme-not-published"
  headline="Some of the real decision text is not in the folder"
  prose="The repository says a limited set of files is not published. The examples it gives are the Grox prompt files and some botmaker rules. So you cannot audit those exact prompts from this drop, even though nearby folders are public."
/>

<LimitBlock
  id="readme-deployment"
  headline="Most of these services are here to be read, not launched"
  prose="The same README says the point of the folder is so people can inspect the code that affects whether a post is shown. It says that outside Phoenix, a service may not include the files you would need to build or deploy it. Reading a filter is not the same as running X’s filter in production."
/>

## How we checked

We cloned the public GitHub repository, recorded the commit, and copied short passages. We did not use leaked older trees, news stories, or guesses about private servers as proof.

## Sources

- https://github.com/xai-org/x-algorithm
- Permalinks are the citation links on each card
```

Add every extra inventory row the same way. Keep prose at 2–4 sentences. No growth-hacking. No “this is how For You secretly works in production” beyond what the file says.

- [ ] **Step 5: Point the page footer at the manifest and verify article ids**

In `app/page.tsx`, `loadManifest(process.cwd())` and pass `manifest.commit` and `manifest.fetched_at` into `ArticleLayout`.

Extend `scripts/verify-manifest.ts` to also scan `content/article.mdx` for `id="..."` and pass those ids into `verifyManifest(root, ids)`.

Run: `npx tsx --test tests/*.test.ts && npx tsx scripts/verify-manifest.ts && npx next build`

Expected: all pass / ok / build succeeds.

- [ ] **Step 6: Commit**

```bash
git add content app/page.tsx scripts/verify-manifest.ts
git commit -m "feat: add sourced article cards from the public repo"
```

---

### Task 6: README, GitHub repo, Vercel

**Files:**
- Create: `README.md`
- Remote: `https://github.com/mtrxdev/x-algorithm-public-wiki`
- Vercel project linked to that repo

**Interfaces:**
- Consumes: built Next.js app
- Produces: public GitHub repo and a public Vercel HTTPS URL

- [ ] **Step 1: Write README.md**

```markdown
# What you can actually make from X’s public ranking code

An independent, layman-language report on
[xai-org/x-algorithm](https://github.com/xai-org/x-algorithm).

This site is **not affiliated with X or xAI**. It only quotes their public
repository. It does not run the live For You feed.

## Development

```bash
npm install
npm test
npm run verify
npm run dev
```

`vendor/x-algorithm/` is a local clone used to check quotes. It is not
committed. Create it with:

```bash
git clone --depth 1 https://github.com/xai-org/x-algorithm.git vendor/x-algorithm
```

## Source of quotes

See `content/manifest.json` for the commit SHA and file ranges.
```

- [ ] **Step 2: Create the GitHub repo and push**

```bash
gh repo create mtrxdev/x-algorithm-public-wiki --public --source . --remote origin --push
```

If `gh repo create` refuses `--source` in this environment, run:

```bash
gh repo create mtrxdev/x-algorithm-public-wiki --public --description "Independent explainer of the public xai-org/x-algorithm drop"
git remote add origin https://github.com/mtrxdev/x-algorithm-public-wiki.git
git push -u origin main
```

Expected: the GitHub UI shows the Next.js app and does **not** contain `vendor/x-algorithm`.

- [ ] **Step 3: Deploy to Vercel**

Use the Vercel integration if it is connected; otherwise:

```bash
npx vercel --yes --prod
```

Link the project to `mtrxdev/x-algorithm-public-wiki`, framework Next.js, root `.`, no env vars. Record the production URL in `docs/research/inventory.md` under a short “Deploy” heading.

Expected: `https://<project>.vercel.app` serves the article.

- [ ] **Step 4: Commit README if not already committed**

```bash
git add README.md docs/research/inventory.md
git commit -m "docs: add project README and deploy note"
git push origin main
```

---

### Task 7: Browser verification and review

**Files:**
- Modify: none unless verification finds a bug
- Test: live or local site, desktop and a 390px-wide viewport

**Interfaces:**
- Consumes: local `next dev` or the Vercel URL
- Produces: a short “Verification” section appended to `docs/research/inventory.md`

- [ ] **Step 1: Exercise the article like a reader**

Open `/`. Scroll the full page. Click every TOC link. Confirm each card has readable prose, a code box, and a working GitHub permalink. Open `/missing-page` and use the home link. Repeat at a narrow width (~390px): TOC must not cover the article; cards stack; code does not overflow the viewport without a scrollbar.

- [ ] **Step 2: Copy check**

Read the article out loud as a non-engineer. Confirm:

- All seven skeleton headings exist
- Every run/build/cannot-do claim has a quote
- The cannot-do section is not a short afterthought
- No sentence claims to describe private production systems
- No sentence tells anyone how to game ranking

- [ ] **Step 3: Write the verification note**

Append to `docs/research/inventory.md`:

```markdown
## Verification

- Tests: `npm test` <pass/fail + date>
- Verifier: `npm run verify` <output>
- Build: `npx next build` <pass/fail>
- Browser desktop: <what you clicked>
- Browser narrow: <what you checked>
- Vercel URL: <url>
```

```bash
git add docs/research/inventory.md
git commit -m "docs: record browser verification"
```

- [ ] **Step 4: Review pass**

Use the requesting-code-review skill on this branch / GitHub repo. Fix every issue that breaks the evidence contract, layman voice, or deploy. Do not treat the job as finished until that review is done and verification-before-completion has command output in hand.

---

## Spec coverage (self-review)

| Spec section | Task |
| --- | --- |
| Purpose / journalist audience / layman voice | Task 5 article copy; Task 7 copy check |
| One long article on Vercel from a new GitHub repo | Tasks 2, 6 |
| Every claim has path + lines + SHA | Tasks 1, 3, 5 |
| Dedicated cannot-do section | Tasks 4–5 |
| No speculation / no gaming advice / no “this is live For You” | Task 5 prose + Task 7 |
| Do not publish the upstream clone | Tasks 1 gitignore, 4, 6 |
| Next.js + MDX, one route, sticky TOC | Task 2 |
| EvidenceBlock / LimitBlock / manifest / excerpts | Tasks 1, 3, 5 |
| Inventory note at `docs/research/inventory.md` | Task 4 |
| Manifest check when vendor present | Tasks 1, 5 |
| not-found → `/` | Task 2 |
| Browser desktop + narrow | Task 7 |
| requesting-code-review before done | Task 7 |
| Capability list not invented in the spec | Task 4 inventory produces the list; Task 5 seeds only quotes already in the public README/QUICKSTART |

No remaining TBD. `readme-phoenix-runnable` and `readme-deployment` may share the same README paragraph (lines 417–419 at the planned SHA). That is allowed: two claims, one passage, two ids pointing at the same range.
