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
