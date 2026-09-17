import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { DEFAULT_CONFIG, type Scar } from "@neon-spore/sim";
import { craters } from "../src/craters.js";
import { drawHullBreaks } from "../src/hull-break.js";
import { gape } from "../src/hull-break-gape.js";
import { HULL_BREAK_LOOK, type HullBreakPaint } from "../src/hull-break-look.js";
import { computeLayout } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

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
 * What `gape` itself draws — the answer the owner took on 16 September 2026 —
 * is at the foot of this file, because the one thing he asked for by name is
 * the one thing a later edit could quietly undo: *the crater shape must stay
 * like current in game untouched*, with exactly one line allowed out of it.
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

  it("draws nothing at all while the look asks for no reach", () => {
    // `open: 0` is the whole switch, and it was the shipped record until the
    // owner took `gape` on 16 September 2026 (`hull-break-gape.ts`). It is
    // still the switch every future candidate is offered through.
    const { ctx } = stubCanvas();
    withLook(
      0,
      () => {},
      () => drawHullBreaks(ctx as never, L, holes, 0, SKIN, "#C05CFF", "#0B0512"),
    );
    expect(ctx.calls).toBe(0);
  });

  it("draws the shipped record's own picture, on a real canvas", () => {
    const { ctx } = stubCanvas();
    drawHullBreaks(ctx as never, L, holes, 0, SKIN, "#C05CFF", "#0B0512");
    expect(ctx.calls).toBeGreaterThan(0);
  });

  it("hands every answer the hole's real outline, and its floor", () => {
    // The owner's rule about this slot is that the crater is not the answer's
    // to change, and the only thing that can hold an answer to it is being
    // handed the hole rather than a radius (`hull-break-look.ts`).
    const seen: HullBreakPaint[] = [];
    withLook(
      1,
      (b) => seen.push(b),
      () => drawHullBreaks(stubCanvas().ctx as never, L, holes, 0, SKIN, "#C05CFF", "#0B0512"),
    );
    for (const b of seen) {
      expect(b.dark).toBeDefined();
      // The crystal hangs half a radius below the skin at most (`centreY`), so
      // a floor below the mouth and inside the rock's own reach is the whole
      // of what "not lower than the crater" can mean.
      expect(b.floor).toBeGreaterThan(b.y);
      expect(b.floor).toBeLessThan(b.y + b.r);
    }
  });

  it("paints every hole once, on the mouth the crater already measured", () => {
    const seen: HullBreakPaint[] = [];
    withLook(
      1,
      (b) => seen.push(b),
      () => drawHullBreaks(stubCanvas().ctx as never, L, holes, 0, SKIN, "#C05CFF", "#0B0512"),
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
        () => drawHullBreaks(stubCanvas().ctx as never, L, holes, 0, SKIN, "#C05CFF", "#0B0512"),
      );
    draw();
    draw();
    expect(seen[0]).not.toBe(seen[1]);
    // And the same hole answers the same on the next frame.
    expect(seen.slice(0, 2)).toEqual(seen.slice(2));
  });
});

/** Every y the paint drew at, off the stub's ordered log. */
function ys(log: readonly string[]): number[] {
  const out: number[] = [];
  for (const call of log) {
    const open = call.indexOf("(");
    if (open < 0 || !call.endsWith(")")) continue;
    const name = call.slice(0, open);
    if (!name.includes("moveTo") && !name.includes("lineTo") && !name.includes("CurveTo")) continue;
    const nums = call
      .slice(open + 1, -1)
      .split(",")
      .map(Number);
    for (let i = 1; i < nums.length; i += 2) out.push(nums[i] as number);
  }
  return out;
}

describe("gape stays inside the hole the game already cut", () => {
  const hole = craters(L, [scar(5, 2)], SKIN)[0];

  function painted(): { log: readonly string[]; b: HullBreakPaint } {
    let seen: HullBreakPaint | undefined;
    withLook(
      1,
      (b) => {
        seen = b;
      },
      () => drawHullBreaks(stubCanvas().ctx as never, L, [hole!], 0, SKIN, "#C05CFF", "#0B0512"),
    );
    const { ctx } = stubCanvas();
    ctx.log = [];
    gape(ctx as never, seen as HullBreakPaint);
    return { log: ctx.log ?? [], b: seen as HullBreakPaint };
  }

  it("keeps everything but the cut and the lip within a whisker of the hole", () => {
    // The ribs are clipped to `dark` and cannot be measured through the log — a
    // clip is not a coordinate. What *can* be caught is a later edit reaching
    // deep with something the clip does not cover: nothing may be drawn more
    // than the cut's own reach below the hole's floor.
    const { log, b } = painted();
    // A hundredth of slack because the stub's log rounds to three decimals,
    // and the deepest thing here is a rib ending at exactly this line.
    expect(Math.max(...ys(log))).toBeLessThanOrEqual(b.floor + b.r + 0.01);
  });

  it("sends something below the floor, which is the cut and only the cut", () => {
    // The owner asked for *a little bit of vertical glowing line going further
    // from the dark*. If this ever reads false, the one addition he made to the
    // candidate has been drawn back inside the hole.
    const { log, b } = painted();
    expect(ys(log).some((y) => y > b.floor)).toBe(true);
  });
});
