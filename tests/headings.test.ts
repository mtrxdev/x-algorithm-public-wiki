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
