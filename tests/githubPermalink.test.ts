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
