import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { gallPointCol, type World } from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import { gallPointCircle } from "../src/gall-grip.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { FIRE, LEAP, posed, stood } from "./gall-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE GALL, and the three words the field may say about it**
 * (`render/src/boss-cue-read-zm.ts`): `TAP` on the alien to the seat whose
 * half it sits on, `PULL` there once its taps are in, going over with it when
 * it lands, and `FIRE` under its column on a fire step. What is *not* said:
 * nothing to the other seat, nothing between steps or in the air, and never
 * the shot's colour.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE GALL", () => {
  it.each([
    [0, "p1", "p2"],
    [1, "p1", "p2"],
    [2, "p2", "p1"],
    [3, "p2", "p1"],
  ] as const)("says TAP on point %i to %s, and nothing to %s", (point, presser, other) => {
    const world = stood();
    posed(world, LEAP, point);
    const said = cue(world, presser);
    const at = gallPointCircle(LAYOUT[presser], CFG, point);
    expect(said?.word).toBe("TAP");
    expect(said?.x).toBeCloseTo(at.x);
    expect(said?.y).toBeCloseTo(at.y);
    expect(cue(world, other)).toBeNull();
  });

  it("says PULL once the taps are in, nothing in the air, and goes over with the alien", () => {
    const world = stood();
    const s = posed(world, LEAP, 1, 1, LEAP.taps);
    expect(cue(world, "p1")?.word).toBe("PULL");
    s.phase = "leap";
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
    posed(world, LEAP, 3);
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")?.x).toBeCloseTo(gallPointCircle(LAYOUT.p2, CFG, 3).x);
  });

  it("says FIRE under the alien's column on a fire step, and never the colour", () => {
    const world = stood();
    posed(world, FIRE, 2);
    for (const role of ["p1", "p2"] as const) {
      const said = cue(world, role);
      expect(said?.word).toBe("FIRE");
      expect(said?.x).toBeCloseTo(fieldX(LAYOUT[role], gallPointCol(CFG, 2)));
      expect(said?.y).toBe(LAYOUT[role].hullY);
      // The owner, 29 September 2026, every boss: a shot cue carries a clear
      // aim target (`cue-helper.ts`). The word stays at the hull, where the
      // cannon goes; the crosshair rides the thing it is fired at.
      const want = gallPointCircle(LAYOUT[role], CFG, 2);
      expect(said?.aim?.x).toBeCloseTo(want.x, 5);
      expect(said?.aim?.y).toBeCloseTo(want.y, 5);
      expect(said?.aim?.y).toBeLessThan(LAYOUT[role].hullY);
    }
  });

  it("says nothing between steps", () => {
    const world = stood();
    posed(world, null);
    for (const role of ["p1", "p2", "test"] as const) expect(cue(world, role)).toBeNull();
  });
});
