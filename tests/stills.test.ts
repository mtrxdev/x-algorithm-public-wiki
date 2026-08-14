import assert from "node:assert/strict";
import test from "node:test";
import { STILLS } from "../lib/stills";

test("every still has a public src and a non-empty alt without gaming verbs", () => {
  const banned = /evade|farm|game the/i;
  const ids = Object.keys(STILLS);
  assert.ok(ids.length > 0);
  for (const still of Object.values(STILLS)) {
    assert.equal(still.src.startsWith("/stills/"), true, still.src);
    assert.ok(still.alt.length > 0, still.id);
    assert.equal(banned.test(still.alt), false, still.alt);
  }
});
