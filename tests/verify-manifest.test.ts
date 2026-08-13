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
