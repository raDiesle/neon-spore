import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { flueBoss } from "@neon-spore/sim";
import { flueTallyLevel, flueTallyState } from "../src/flue-tally.js";
import { computeLayout } from "../src/layout.js";
import { stood } from "./flue-harness.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE FLUE's levels on its lobes (`render/src/flue-tally.ts`, the owner, 7
 * October 2026): one lobe a level, counted from the left of the screen on
 * every seat, each cleared, the one lit or next, or still to come.
 */

function flue() {
  const s = flueBoss(stood());
  if (s === null) throw new Error("the flue wave stood no flue");
  return s;
}

describe("THE FLUE's tally", () => {
  it.each(ROLES)("counts the lobes from the left of the screen, one level each, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const levels = Array.from({ length: CFG.cols }, (_, k) => flueTallyLevel(l, CFG, k));
    expect([...levels].sort((a, b) => a - b)).toEqual(
      levels.map((_, i) => i).sort((a, b) => a - b),
    );
  });

  it("is a lobe for every level of the shipped flue", () => {
    expect(flue().levels.length).toBe(CFG.cols);
  });

  it("says cleared, now and ahead as the fight goes, and every one cleared once spent", () => {
    const s = flue();
    s.hits = 3;
    s.cursor = 3;
    s.phase = "lit";
    expect([0, 2, 3, 4, 10].map((i) => flueTallyState(s, i))).toEqual([
      "cleared",
      "cleared",
      "now",
      "ahead",
      "ahead",
    ]);
    s.phase = "spent";
    expect(flueTallyState(s, 10)).toBe("cleared");
  });
});
