import { afterEach, beforeAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { STILL } from "../src/idle-drift-parts.js";
import { computeLayout } from "../src/layout.js";
import { OUTLINE_PARTS, PART } from "../src/outline-parts.js";
import { drawReprise, repriseFrame, repriseTearCenter } from "../src/reprise-draw.js";
import { RepriseFx } from "../src/reprise-fx.js";
import { lensRadius } from "../src/reprise-lens.js";
import { cordPoints, cordSwing, eyeFreedom, repriseEye, swungCord } from "../src/reprise-parts.js";
import { correlation, FPS, maxSpeed, sample } from "./drift-stats.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

/**
 * THE REPRISE's parts (`reprise-parts.ts`): each cord's slack middle and the
 * eye move far enough to be seen and no further, the cords are a mirror pair
 * tied to the sac and to the field's top edge however they swing, the eye is
 * home while an echo plays, every mark on the eye is drawn where it has looked
 * to, and no part keeps step with another.
 */

const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const F = repriseFrame(L, CFG);
const saved = { ...OUTLINE_PARTS };
afterEach(() => Object.assign(OUTLINE_PARTS, saved));

/** How far a cord's bend has swung from where it hangs at rest at `t`, in tiles. */
function bendShift(t: number, side: -1 | 1 = 1): { x: number; y: number } {
  const rest = cordPoints(F, side, t)[1] as { x: number; y: number };
  const moved = swungCord(F, side, t, cordSwing(F, L.tile, t, 1))[1] as { x: number; y: number };
  return { x: (moved.x - rest.x) / L.tile, y: (moved.y - rest.y) / L.tile };
}

/** How far the eye has looked from the middle at `t`, in tiles. */
function glance(t: number): number {
  const e = repriseEye(F, L.tile, t, 1, 1);
  return Math.hypot(e.x - F.x, e.y - F.cy) / L.tile;
}

describe("THE REPRISE's parts", () => {
  test("ship moving, and stand at rest when hushed or held at 0", () => {
    expect(saved.reprise).toBe(1);
    expect(cordSwing(F, L.tile, 41.3, 0)).toEqual(STILL);
    expect(repriseEye(F, L.tile, 41.3, 0, 1)).toEqual({ x: F.x, y: F.cy });
    OUTLINE_PARTS.reprise = 0;
    expect(cordSwing(F, L.tile, 41.3, 1)).toEqual(STILL);
    expect(repriseEye(F, L.tile, 41.3, 1, 1)).toEqual({ x: F.x, y: F.cy });
  });

  test("a cord's middle and the eye move far enough to be seen, and never past `PART.tip`", () => {
    // The cord turns about its end on the edge, so its bend, halfway down,
    // swings half as far as a tip would.
    const bends = sample((t) => Math.hypot(bendShift(t).x, bendShift(t).y), 600);
    expect(Math.max(...bends)).toBeLessThanOrEqual(PART.tip * 0.6);
    expect(Math.max(...bends)).toBeGreaterThan(PART.tip * 0.3);
    const eyes = sample(glance, 600);
    expect(Math.max(...eyes)).toBeLessThanOrEqual(PART.tip + 1e-9);
    expect(Math.max(...eyes)).toBeGreaterThan(PART.tip * 0.6);
  });

  test("the cords are exact mirrors, tied to the sac and to the field's top edge", () => {
    for (const t of [0.4, 17.2, 311.9]) {
      const r = bendShift(t, 1);
      const lf = bendShift(t, -1);
      expect(lf.x).toBeCloseTo(-r.x, 9);
      expect(lf.y).toBeCloseTo(r.y, 9);
    }
    for (let f = 0; f <= 600 * 4; f++) {
      const t = f / 4;
      for (const side of [-1, 1] as const) {
        const [root, , end, past] = swungCord(F, side, t, cordSwing(F, L.tile, t, 1));
        expect(root).toEqual({ x: F.x + side * F.rx * 0.42, y: F.cy - F.ry * 0.8 });
        expect(end?.y).toBe(F.y0);
        expect(past?.y).toBeLessThan(F.y0);
        expect(past?.y).toBeGreaterThan(F.y0 - F.u * 0.5);
      }
    }
  });

  test("no part is faster than 30° a second, and the cords and the eye keep no step", () => {
    const cord = sample((t) => cordSwing(F, L.tile, t, 1).rotate, 120);
    const eye = sample((t) => (repriseEye(F, L.tile, t, 1, 1).x - F.x) / (F.ry * 0.8), 120);
    expect(maxSpeed(cord)).toBeLessThanOrEqual(30);
    expect(maxSpeed(eye.map(Math.asin))).toBeLessThanOrEqual(30);
    expect(Math.abs(correlation(cord, eye))).toBeLessThan(0.3);
  });

  test("the eye comes home as an echo opens and goes out again after it shuts", () => {
    expect(eyeFreedom("play", "rec", 0)).toBe(1);
    expect(eyeFreedom("play", "rec", 0.125)).toBeCloseTo(0.5, 9);
    expect(eyeFreedom("play", "rec", 0.25)).toBe(0);
    expect(eyeFreedom("rec", "play", 0)).toBe(0);
    expect(eyeFreedom("rec", "play", 0.5)).toBeCloseTo(0.5, 9);
    expect(eyeFreedom("rec", null, 0)).toBe(1);
    expect(eyeFreedom(null, undefined, 0)).toBe(1);
    // Home is exactly where the navigator's word stands.
    const tear = repriseTearCenter(L, CFG);
    expect(repriseEye(F, L.tile, 12.7, 1, 0)).toEqual({ x: tear.x, y: tear.y });
  });

  test("the lens, and the dot in it, are drawn where the eye has looked to", () => {
    let at = 0;
    let far = 0;
    for (let f = 0; f < 60 * FPS; f++) {
      const g = glance(f / FPS);
      if (g > far) [far, at] = [g, f / FPS];
    }
    expect(far).toBeGreaterThan(0.3);
    const eye = repriseEye(F, L.tile, at, 1, 1);
    const fx = new RepriseFx();
    fx.note(null, 0, at - 10);
    fx.note("rec", 2, at - 5);
    const { ctx } = stubCanvas();
    ctx.log = [];
    drawReprise(ctx as unknown as CanvasRenderingContext2D, L, CFG, {
      hush: 1,
      phase: "rec",
      eggs: 2,
      standing: 0,
      fx,
      beatPhase: 0.2,
      time: at,
    });
    const R = lensRadius(F);
    const arcs = (ctx.log ?? [])
      .filter((op) => op.startsWith("Path2D.arc("))
      .map((op) => op.slice("Path2D.arc(".length).split(",").map(Number));
    const socket = arcs.find((a) => Math.abs((a[2] as number) - R * 1.12) < 0.01);
    const dot = arcs.find((a) => Math.abs((a[2] as number) - R * 0.2) < 0.01);
    for (const mark of [socket, dot]) {
      expect(mark).toBeDefined();
      expect(Math.abs((mark?.[0] as number) - eye.x)).toBeLessThan(0.01);
      expect(Math.abs((mark?.[1] as number) - eye.y)).toBeLessThan(0.01);
    }
  });
});
