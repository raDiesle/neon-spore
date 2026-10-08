import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { World } from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import {
  lampreyGulletCircle,
  lampreyHeadCircle,
  lampreyTailAt,
  lampreyTailCircle,
  lampreyToothCircle,
} from "../src/lamprey-grip.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { APART, BITE, GULLET, PULL, posed, stood } from "./lamprey-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE LAMPREY, and the words the field may say about it**
 * (`render/src/boss-cue-read-zs.ts`): `HOLD` on the tail to the holder before
 * the thumb is on it and after, `TAP` on the lit tooth and `PULL UP` on the head to the
 * other seat, `PULL` on the tail in an `apart`, and `FIRE` under the eel's
 * column on the lit gullet. What is *not* said: the tail to the worker or the
 * head to the holder, anything between stays, and never the gullet's colour.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** The words this screen is owed on this frame. */
function cues(world: World, role: ViewRole): BossCue[] {
  const l = LAYOUT[role];
  const one = bossCue(l, world, 0, () => l.hullY);
  return one === null ? [] : [one];
}

const words = (world: World, role: ViewRole): string[] => cues(world, role).map((c) => c.word);

describe("THE LAMPREY", () => {
  it.each([
    [1, "p1", "p2"],
    [2, "p2", "p1"],
  ] as const)(
    "says HOLD on the tail to the holder, seat %i, and TAP to the other",
    (holder, holds, taps) => {
      const world = stood();
      const s = posed(world, "bite", { ...BITE, holder });
      const hold = cues(world, holds)[0];
      const tail = lampreyTailCircle(LAYOUT[holds], CFG, s);
      expect(hold?.word).toBe("HOLD");
      expect(hold?.x).toBeCloseTo(tail?.x ?? Number.NaN);
      const tap = cues(world, taps)[0];
      const tooth = lampreyToothCircle(LAYOUT[taps], CFG, s, world.beat, 0);
      expect(tap?.word).toBe("TAP");
      expect(tap?.x).toBeCloseTo(tooth?.x ?? Number.NaN);
      expect(tap?.y).toBeCloseTo(tooth?.y ?? Number.NaN);
    },
  );

  it("keeps HOLD once the holder's thumb is on the tail", () => {
    const world = stood();
    posed(world, "bite", BITE, (t) => {
      t.tailDown = [true, false];
    });
    expect(words(world, "p1")).toContain("HOLD");
    expect(words(world, "p2")).not.toContain("HOLD");
  });

  it("says PULL UP on the head to the other seat in a pull", () => {
    const world = stood();
    const s = posed(world, "bite", PULL, (t) => {
      t.tailDown = [true, false];
    });
    const up = cues(world, "p2")[0];
    const head = lampreyHeadCircle(LAYOUT.p2, CFG, s);
    expect(up?.word).toBe("PULL UP");
    expect(up?.x).toBeCloseTo(head?.x ?? Number.NaN);
    expect(words(world, "p1")).not.toContain("PULL UP");
  });

  it("says PULL on the tail to the holder in an apart", () => {
    const world = stood();
    posed(world, "bite", APART);
    expect(words(world, "p1")).toContain("PULL");
    expect(words(world, "p2")).toContain("PULL UP");
  });

  it("says HOLD in an apart once the tail is all the way out, where it is", () => {
    const world = stood();
    const s = posed(world, "bite", APART, (t) => {
      t.tailMilli = [CFG.lampreyTailPullMilli, 0];
    });
    const hold = cues(world, "p1")[0];
    const at = lampreyTailAt(LAYOUT.p1, CFG, s);
    expect(hold?.word).toBe("HOLD");
    expect(hold?.x).toBeCloseTo(at.x);
    expect(hold?.y).toBeCloseTo(at.y);
  });

  it("moves TAP with the light, on a seed of its own", () => {
    const world = stood();
    const s = posed(world, "bite", BITE, (t) => {
      t.tailDown = [true, false];
    });
    const first = cues(world, "p2")[0];
    s.litTooth = 2;
    const next = cues(world, "p2")[0];
    expect(next?.x).not.toBeCloseTo(first?.x ?? Number.NaN);
    expect(next?.seed).not.toBe(first?.seed);
  });

  it("says nothing while the eel swims in, leaps, recoils or is spent", () => {
    for (const phase of ["entering", "leap", "recoil", "spent"] as const) {
      const world = stood();
      posed(world, phase);
      expect(cues(world, "p1"), phase).toEqual([]);
      expect(cues(world, "p2"), phase).toEqual([]);
    }
  });

  it("says FIRE under the eel's column on the lit gullet, and never the colour", () => {
    const world = stood();
    const s = posed(world, "rearing", GULLET);
    for (const role of ["p1", "p2"] as const) {
      const said = cues(world, role)[0];
      expect(said?.word).toBe("FIRE");
      expect(said?.x).toBeCloseTo(fieldX(LAYOUT[role], s.col));
      expect(said?.y).toBe(LAYOUT[role].hullY);
      const want = lampreyGulletCircle(LAYOUT[role], CFG, s, world.beat, 0);
      expect(said?.aim?.x).toBeCloseTo(want.x, 5);
      expect(said?.aim?.y).toBeCloseTo(want.y, 5);
      expect(said?.aim?.r).toBeCloseTo(want.r, 5);
      expect(said?.aim?.y).toBeLessThan(LAYOUT[role].hullY);
    }
  });
});
