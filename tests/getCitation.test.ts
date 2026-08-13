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
