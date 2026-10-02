import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol, type World } from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import { lampreyGulletCircle, lampreyJawCircle, lampreyToothCircle } from "../src/lamprey-grip.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { BITE, GULLET, posed, stood } from "./lamprey-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE LAMPREY, and the three words the field may say about it**
 * (`render/src/boss-cue-read-zs.ts`): `HOLD` on the jaw's band to the pinner
 * until the thumb is on it, `TAP` on the lit tooth to the tapper, and `FIRE`
 * under the middle column on the lit gullet. What is *not* said: the jaw to
 * the tapper or the tooth to the pinner, anything between bites, and never
 * the gullet's colour.
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

describe("THE LAMPREY", () => {
  it.each([
    [1, "p1", "p2"],
    [2, "p2", "p1"],
  ] as const)(
    "says HOLD on the jaw to the pinner, seat %i, and TAP to the other",
    (pinner, pins, taps) => {
      const world = stood();
      const s = posed(world, "bite", { ...BITE, pinner });
      const hold = cue(world, pins);
      const jaw = lampreyJawCircle(LAYOUT[pins], CFG, s, world.beat, 0);
      expect(hold?.word).toBe("HOLD");
      expect(hold?.x).toBeCloseTo(jaw?.x ?? Number.NaN);
      const tap = cue(world, taps);
      const tooth = lampreyToothCircle(LAYOUT[taps], CFG, s, world.beat, 0);
      expect(tap?.word).toBe("TAP");
      expect(tap?.x).toBeCloseTo(tooth?.x ?? Number.NaN);
      expect(tap?.y).toBeCloseTo(tooth?.y ?? Number.NaN);
    },
  );

  it("drops HOLD once the pinner's thumb is on the jaw, and says it again when it lags", () => {
    const world = stood();
    const s = posed(world, "bite", BITE, (t) => {
      t.holdCol = [BITE.col, -1];
    });
    expect(cue(world, "p1")).toBeNull();
    s.holdCol = [BITE.col + CFG.lampreyGripCols + 1, -1];
    expect(cue(world, "p1")?.word).toBe("HOLD");
  });

  it("moves TAP with the light, on a seed of its own", () => {
    const world = stood();
    const s = posed(world);
    const first = cue(world, "p2");
    s.litTooth = 2;
    const next = cue(world, "p2");
    expect(next?.x).not.toBeCloseTo(first?.x ?? Number.NaN);
    expect(next?.seed).not.toBe(first?.seed);
  });

  it("says nothing while the eel swims in or pulls loose", () => {
    for (const phase of ["entering", "loose", "recoil", "spent"] as const) {
      const world = stood();
      posed(world, phase);
      expect(cue(world, "p1"), phase).toBeNull();
      expect(cue(world, "p2"), phase).toBeNull();
    }
  });

  it("says FIRE under the middle column on the lit gullet, and never the colour", () => {
    const world = stood();
    const s = posed(world, "rearing", GULLET);
    for (const role of ["p1", "p2"] as const) {
      const said = cue(world, role);
      expect(said?.word).toBe("FIRE");
      expect(said?.x).toBeCloseTo(fieldX(LAYOUT[role], midCol(CFG)));
      expect(said?.y).toBe(LAYOUT[role].hullY);
      const want = lampreyGulletCircle(LAYOUT[role], CFG, s, world.beat, 0);
      expect(said?.aim?.x).toBeCloseTo(want.x, 5);
      expect(said?.aim?.y).toBeCloseTo(want.y, 5);
      expect(said?.aim?.r).toBeCloseTo(want.r, 5);
      expect(said?.aim?.y).toBeLessThan(LAYOUT[role].hullY);
    }
  });
});
