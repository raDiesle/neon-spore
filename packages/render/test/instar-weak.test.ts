import { afterEach, beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import { NOT_DONE } from "@neon-spore/sim";
import { instarWeak, NO_WEAK, WEAK_LOOK, WEAK_PARTS, type WeakPart } from "../src/instar-weak.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";
import { acting, hung } from "./instar-kit.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The part to shoot glows red, and no other** — the owner, 27 September
 * 2026 (`instar-weak.ts`). On every step of the shipped script with a shoot
 * mark, the glow is found drawn on the part that mark names and on nothing
 * else, and it goes when the mark is done or the window is not open.
 */

beforeAll(installCanvasGlobals);
const paint = WEAK_LOOK.paint;
afterEach(() => {
  WEAK_LOOK.paint = paint;
});

const SHOOT_STEPS = INSTAR_SCRIPT.flatMap((step, cursor) => {
  const parts = new Set(step.marks.filter((m) => m.gesture === "shoot").map((m) => m.part));
  return parts.size > 0 ? [{ cursor, parts: [...parts] as WeakPart[] }] : [];
});

/** The parts the glow was laid on over a few frames of `cursor`'s window. */
function glowed(cursor: number): Set<WeakPart> {
  const world = hung();
  acting(world, cursor);
  const seen = new Set<WeakPart>();
  WEAK_LOOK.paint = (_ctx, _outline, _k, part) => {
    seen.add(part);
  };
  runFrames(world, "p1", 6, { every: 3 });
  return seen;
}

describe("THE INSTAR's part to shoot", () => {
  it("has a shoot step for every part that can glow", () => {
    const named = new Set(SHOOT_STEPS.flatMap((s) => s.parts));
    expect([...named].sort()).toEqual([...WEAK_PARTS].sort());
  });

  for (const { cursor, parts } of SHOOT_STEPS) {
    it(`glows on step ${cursor}'s ${parts.join(" and ")} and nowhere else`, () => {
      const s = acting(hung(), cursor);
      const weak = instarWeak(s, 0);
      for (const part of WEAK_PARTS) {
        expect(weak[part] > 0, part).toBe(parts.includes(part));
      }
      expect([...glowed(cursor)].sort()).toEqual([...parts].sort());
    });
  }

  it("pulses on the beat, strongest on the thump", () => {
    const first = SHOOT_STEPS[0];
    if (first === undefined) throw new Error("no shoot step");
    const s = acting(hung(), first.cursor);
    const part = first.parts[0] as WeakPart;
    expect(instarWeak(s, 0)[part]).toBe(1);
    expect(instarWeak(s, 0.9)[part]).toBeLessThan(instarWeak(s, 0.2)[part]);
    expect(instarWeak(s, 0.9)[part]).toBeGreaterThan(0.5);
  });

  it("stops once every shoot mark on the part is done, and outside the window", () => {
    for (const { cursor } of SHOOT_STEPS) {
      const s = acting(hung(), cursor);
      const marks = s.steps[cursor]?.marks ?? [];
      s.doneBeat = marks.map((m) => (m.gesture === "shoot" ? 1 : NOT_DONE));
      expect(instarWeak(s, 0)).toEqual(NO_WEAK);
      const morphing = acting(hung(), cursor);
      morphing.phase = "morph";
      expect(instarWeak(morphing, 0)).toEqual(NO_WEAK);
    }
  });

  it("keeps a part glowing while one of its two marks is still open", () => {
    const pair = SHOOT_STEPS.find(({ cursor }) => {
      const marks = INSTAR_SCRIPT[cursor]?.marks ?? [];
      return marks.filter((m) => m.gesture === "shoot").length > 1;
    });
    if (pair === undefined) throw new Error("no step shoots two marks");
    const s = acting(hung(), pair.cursor);
    const first = s.steps[pair.cursor]?.marks.findIndex((m) => m.gesture === "shoot") ?? 0;
    s.doneBeat[first] = 1;
    expect(instarWeak(s, 0)[pair.parts[0] as WeakPart]).toBeGreaterThan(0);
  });
});
