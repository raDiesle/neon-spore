import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol, type World } from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import { gallPointCircle } from "../src/gall-grip.js";
import { gallRootAt, gallRootR } from "../src/gall-shape.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { CLOSE, FIRE, posed, stood } from "./gall-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE GALL, and the two words the field may say about it**
 * (`render/src/boss-cue-read-zm.ts`): `PINCH` on the nodule to the seat whose
 * half it sits on, gone once it is shut and jumping with it, and `FIRE` under
 * the middle column on the bared root. What is *not* said: nothing to the
 * other seat, nothing between steps, and never the shot's colour.
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
  ] as const)("says PINCH on point %i to %s, and nothing to %s", (point, pincher, other) => {
    const world = stood();
    posed(world, CLOSE, point);
    const said = cue(world, pincher);
    const at = gallPointCircle(LAYOUT[pincher], CFG, point);
    expect(said?.word).toBe("PINCH");
    expect(said?.kind).toBe("HOLD");
    expect(said?.x).toBeCloseTo(at.x);
    expect(said?.y).toBeCloseTo(at.y);
    expect(cue(world, other)).toBeNull();
  });

  it("goes once the pinch is shut, is owed again on a slip, and jumps with the gall", () => {
    const world = stood();
    const s = posed(world, CLOSE, 1);
    s.gapMilli = CFG.gallShutMilli;
    expect(cue(world, "p1")).toBeNull();
    s.gapMilli = CFG.gallShutMilli + 1;
    expect(cue(world, "p1")?.word).toBe("PINCH");
    s.point = 3;
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")?.x).toBeCloseTo(gallPointCircle(LAYOUT.p2, CFG, 3).x);
  });

  it("says FIRE under the middle column on a bared root, and never the colour", () => {
    const world = stood();
    const s = posed(world, FIRE);
    expect(cue(world, "p1")).toBeNull();
    s.bared = true;
    for (const role of ["p1", "p2"] as const) {
      const said = cue(world, role);
      expect(said?.word).toBe("FIRE");
      expect(said?.x).toBeCloseTo(fieldX(LAYOUT[role], midCol(CFG)));
      expect(said?.y).toBe(LAYOUT[role].hullY);
      // The owner, 29 September 2026, every boss: a shot cue carries a clear
      // aim target (`cue-helper.ts`). The word stays at the hull, where the
      // cannon goes; the crosshair rides the thing it is fired at.
      const want = { ...gallRootAt(LAYOUT[role], CFG), r: gallRootR(LAYOUT[role]) };
      expect(said?.aim?.x).toBeCloseTo(want.x, 5);
      expect(said?.aim?.y).toBeCloseTo(want.y, 5);
      expect(said?.aim?.r).toBeCloseTo(want.r, 5);
      expect(said?.aim?.y).toBeLessThan(LAYOUT[role].hullY);
    }
  });

  it("says nothing between steps", () => {
    const world = stood();
    posed(world, null);
    for (const role of ["p1", "p2", "test"] as const) expect(cue(world, role)).toBeNull();
  });
});
