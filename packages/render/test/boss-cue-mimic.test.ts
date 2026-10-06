import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol, type World } from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { mimicTileAt } from "../src/mimic-board.js";
import { mimicPose } from "../src/mimic-pose.js";
import { CORE } from "../src/mimic-shape.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { CORE as CORE_STEP, posed, SIGN, SPLIT, stood } from "./mimic-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE MIMIC, and the words the field may say about it**
 * (`render/src/boss-cue-read-zt.ts`): `TAP` on the bare core's tile, and
 * nothing round a picture — the owner, 6 October 2026, took the box away and
 * put its words on the siren (`mimic-siren.test.ts`). What is *not* said:
 * the core's colour, and anything between asks.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** The one word this screen is owed on this frame, or nothing. */
function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE MIMIC", () => {
  it.each([
    ["a picture", SIGN],
    ["a split", SPLIT],
  ] as const)("says nothing round %s: the box went, and its words are the siren's", (_, step) => {
    const world = stood();
    posed(world, "sign", step);
    for (const role of ["p1", "p2", "test"] as const) expect(cue(world, role), role).toBeNull();
  });

  it("says nothing while it slaps in, wears a wrong sign, flinches, rolls, clenches or falls", () => {
    for (const phase of [
      "entering",
      "mimicking",
      "peeled",
      "rolling",
      "clench",
      "spent",
    ] as const) {
      const world = stood();
      posed(world, phase, SIGN, (s) => {
        s.signs = [-1, -1];
      });
      expect(cue(world, "p1"), phase).toBeNull();
      expect(cue(world, "p2"), phase).toBeNull();
    }
  });

  it("says TAP on the bare core's tile, and never the colour", () => {
    const world = stood();
    const s = posed(world, "core", CORE_STEP);
    for (const role of ["p1", "p2"] as const) {
      const said = cue(world, role);
      const p = mimicPose(LAYOUT[role], CFG, s, world.beat, 0);
      const at = mimicTileAt(LAYOUT[role], midCol(CFG), CFG.mimicCoreRow);
      expect(said?.word).toBe("TAP");
      expect(said?.x).toBeCloseTo(at.x);
      expect(said?.y).toBeCloseTo(at.y);
      expect(said?.aim?.x).toBeCloseTo(p.x, 5);
      expect(said?.aim?.y).toBeCloseTo(p.y, 5);
      expect(said?.aim?.r).toBeCloseTo(CORE * p.r, 5);
    }
  });
});
