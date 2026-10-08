import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, tileCX, type ViewRole } from "../src/layout.js";
import { trapezeAlienCircle, trapezeZoneCircle } from "../src/trapeze-grip.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { BACK_LEFT, BACK_RIGHT, posed, Q, stood } from "./trapeze-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE TRAPEZE, and the three words the field may say about it**
 * (`render/src/boss-cue-read-zn.ts`): `SWIPE` in the open zone to the seat
 * that pushes there, `TAP` on the alien to the pilot in a lock level, and
 * `FIRE` at the cannon in a shot level. What is *not* said: anything while
 * the swing goes out, or between levels.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function cue(world: Parameters<typeof bossCue>[1], role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE TRAPEZE", () => {
  it("says SWIPE in the open zone, to the seat that pushes there", () => {
    const world = stood();
    const s = posed(world, "push", BACK_LEFT);
    const left = cue(world, "p1");
    const at = trapezeZoneCircle(LAYOUT.p1, CFG, s, -1);
    expect(left).toMatchObject({ word: "SWIPE", kind: "CARRY" });
    expect(left?.x).toBeCloseTo(at?.x ?? Number.NaN);
    expect(cue(world, "p2")).toBeNull();
    posed(world, "push", BACK_RIGHT);
    expect(cue(world, "p2")?.word).toBe("SWIPE");
    expect(cue(world, "p1")).toBeNull();
  });

  it("follows a call: the seat called to a side is the one told", () => {
    const world = stood();
    posed(world, "call", BACK_LEFT, (s) => {
      s.callers = [1, 1];
    });
    expect(cue(world, "p2")?.word).toBe("SWIPE");
    expect(cue(world, "p1")).toBeNull();
  });

  it("says nothing while the swing goes out, or once its side is pushed", () => {
    const world = stood();
    posed(world, "push", Q + Q / 2);
    for (const role of ["p1", "p2"] as const) expect(cue(world, role)).toBeNull();
    posed(world, "push", BACK_LEFT, (s) => {
      s.pushedHalf = s.half;
    });
    for (const role of ["p1", "p2"] as const) expect(cue(world, role)).toBeNull();
  });

  it("says TAP on the alien to the pilot in a lock level, then FIRE once it is locked", () => {
    const world = stood();
    const s = posed(world, "lock");
    const tap = cue(world, "p1");
    const alien = trapezeAlienCircle(LAYOUT.p1, CFG, s);
    expect(tap).toMatchObject({ word: "TAP", kind: "PRESS" });
    expect(tap?.x).toBeCloseTo(alien.x);
    expect(cue(world, "p2")).toBeNull();
    s.lockBeats = 3;
    expect(cue(world, "p2")?.word).toBe("FIRE");
  });

  it("says FIRE at the cannon in a shot level, aimed at the alien", () => {
    const world = stood();
    const s = posed(world, "shoot");
    for (const role of ["p1", "p2"] as const) {
      const said = cue(world, role);
      const l = LAYOUT[role];
      expect(said).toMatchObject({ word: "FIRE", kind: "PRESS" });
      expect(said?.x).toBeCloseTo(tileCX(l, world.cannonCol));
      expect(said?.y).toBeCloseTo(l.hullY);
      const alien = trapezeAlienCircle(l, CFG, s);
      expect(said?.aim?.x).toBeCloseTo(alien.x, 5);
      expect(said?.aim?.y).toBeLessThan(l.hullY);
    }
  });

  it("says nothing between levels", () => {
    const world = stood();
    posed(world, null, BACK_LEFT);
    for (const role of ["p1", "p2"] as const) expect(cue(world, role)).toBeNull();
  });
});
