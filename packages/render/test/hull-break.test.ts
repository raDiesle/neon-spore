import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, type Scar } from "@neon-spore/sim";
import { craters } from "../src/craters.js";
import { drawHullBreaks } from "../src/hull-break.js";
import { HULL_BREAK_LOOK, type HullBreakPaint } from "../src/hull-break-look.js";
import { computeLayout } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The seam the ship's own damage is offered through.
 *
 * The shipped record draws nothing (`hull-break-look.ts`), so what this holds
 * is the switch and the geometry: at `open: 0` the canvas is never touched,
 * and with an answer patched in every hole gets exactly one call carrying the
 * mouth `craters.ts` already measured — a break that re-derived a lip would
 * drift off the hole it belongs to the first time the crystal's rotation
 * changed.
 *
 * What the answers draw is held by `tools/versus/test/variants.test.ts`, which
 * runs every candidate's paint through a canvas that refuses an unparseable
 * colour, a NaN coordinate and a negative radius.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
const SKIN = (x: number): { x: number; y: number } => ({ x, y: L.hullY });

beforeAll(installCanvasGlobals);

const scar = (col: number, beat: number): Scar => ({ col, beat, kind: "meteor" });

function withLook<T>(open: number, paint: (b: HullBreakPaint) => void, run: () => T): T {
  const was = { open: HULL_BREAK_LOOK.open, paint: HULL_BREAK_LOOK.paint };
  Object.assign(HULL_BREAK_LOOK, {
    open,
    paint: (_ctx: unknown, b: HullBreakPaint) => paint(b),
  });
  try {
    return run();
  } finally {
    Object.assign(HULL_BREAK_LOOK, was);
  }
}

describe("what the ship wears where it was hit", () => {
  const holes = craters(L, [scar(3, 1), scar(8, 4)], SKIN);

  it("draws nothing at all at the shipped record", () => {
    const { ctx } = stubCanvas();
    drawHullBreaks(ctx as never, L, holes, 0, SKIN, "#C05CFF");
    expect(ctx.calls).toBe(0);
  });

  it("paints every hole once, on the mouth the crater already measured", () => {
    const seen: HullBreakPaint[] = [];
    withLook(
      1,
      (b) => seen.push(b),
      () => drawHullBreaks(stubCanvas().ctx as never, L, holes, 0, SKIN, "#C05CFF"),
    );
    expect(seen).toHaveLength(2);
    for (let i = 0; i < seen.length; i++) {
      const b = seen[i] as HullBreakPaint;
      const hole = holes[i];
      expect(b.left).toBe(hole?.left as number);
      expect(b.right).toBe(hole?.right as number);
      expect(b.right).toBeGreaterThan(b.left);
      expect(b.r).toBeGreaterThan(0);
    }
  });

  it("gives two holes two different seeds, without either being random", () => {
    const seen: number[] = [];
    const draw = () =>
      withLook(
        1,
        (b) => seen.push(b.seed),
        () => drawHullBreaks(stubCanvas().ctx as never, L, holes, 0, SKIN, "#C05CFF"),
      );
    draw();
    draw();
    expect(seen[0]).not.toBe(seen[1]);
    // And the same hole answers the same on the next frame.
    expect(seen.slice(0, 2)).toEqual(seen.slice(2));
  });
});
