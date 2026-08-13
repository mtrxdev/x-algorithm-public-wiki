import assert from "node:assert/strict";
import test from "node:test";
import { shouldAnimate } from "../lib/motion";

test("skips motion when the reader asked for less", () => {
  assert.equal(shouldAnimate(true), false);
  assert.equal(shouldAnimate(false), true);
});
