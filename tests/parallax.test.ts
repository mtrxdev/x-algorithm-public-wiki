import assert from "node:assert/strict";
import test from "node:test";
import { shouldParallax, PARALLAX_FACTOR } from "../lib/parallax";

test("parallax is off when the reader asked for less motion", () => {
  assert.equal(shouldParallax(true), false);
  assert.equal(shouldParallax(false), true);
  assert.equal(PARALLAX_FACTOR, 0.28);
});
