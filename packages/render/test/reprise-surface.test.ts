import { afterEach, beforeAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { DEG } from "../src/idle-drift.js";
import { computeLayout } from "../src/layout.js";
import { OUTLINE_DRIFT } from "../src/outline-drift.js";
import { drawReprise } from "../src/reprise-draw.js";
import { RepriseFx } from "../src/reprise-fx.js";
import { REPRISE_SURFACE, REPRISE_VEINS, repriseTurn, veinAt } from "../src/reprise-surface.js";
import { FPS } from "./drift-stats.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

/**
 * **THE REPRISE's veins, placed by longitude** (`reprise-surface.ts`): at no
 * turn each sample lies on the curve the sac always drew and the far pair is
 * hidden; a turn moves every sample by its own longitude — fastest through
 * the middle — takes a near vein over the rim and brings a far one round;
 * the skin ships turning, and at no amount turns nothing; and a frame turning costs within a
 * tenth of one standing still.
 */

const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const saved = { surface: { ...REPRISE_SURFACE }, drift: OUTLINE_DRIFT.reprise };
afterEach(() => {
  Object.assign(REPRISE_SURFACE, saved.surface);
  OUTLINE_DRIFT.reprise = saved.drift;
});

/** The shipped curve's point at `t` along it, in the sac's units. */
function shipped(side: number, k: number, t: number): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: side * (u * u * k + 2 * u * t * (k + 0.12) + t * t * (k - 0.1)),
    y: u * u * -0.6 + t * t * 0.8,
  };
}

const near = (theta: number) => REPRISE_VEINS.map((v) => veinAt(v, theta).some((q) => q.near));

describe("THE REPRISE's veins by longitude", () => {
  test("at no turn the four near veins lie on the shipped curve and the far pair is hidden", () => {
    expect(REPRISE_VEINS).toHaveLength(6);
    expect(near(0)).toEqual([true, true, false, true, true, false]);
    for (const [i, [side, k]] of [
      [-1, 0.62],
      [-1, 0.8],
      [1, 0.62],
      [1, 0.8],
    ].entries()) {
      const vein = REPRISE_VEINS[i < 2 ? i : i + 1] ?? [];
      veinAt(vein, 0).forEach((q, n) => {
        const c = shipped(side as number, k as number, n / (vein.length - 1));
        // A sample the shipped curve put outside the sac sits a hair outside it still, under the clip.
        expect(Math.abs(q.x - c.x)).toBeLessThan(0.03);
        expect(q.y).toBeCloseTo(c.y, 9);
      });
    }
  });

  test("a turn moves each sample by its longitude, fast in the middle and slow at the rim", () => {
    const theta = 10 * DEG;
    for (const vein of REPRISE_VEINS) {
      const rest = veinAt(vein, 0);
      veinAt(vein, theta).forEach((q, n) => {
        const p = vein[n];
        if (p === undefined || !q.near) return;
        expect(q.x).toBeCloseTo(p.k * Math.sin(p.lon + theta), 9);
        expect(q.y).toBe(rest[n]?.y as number);
      });
    }
    // Low on the lobe the inner vein, nearer the middle, travels farther than the outer one.
    const travel = (i: number) =>
      (veinAt(REPRISE_VEINS[i] ?? [], theta)[7]?.x ?? 0) -
      (veinAt(REPRISE_VEINS[i] ?? [], 0)[7]?.x ?? 0);
    expect(travel(3)).toBeGreaterThan(0);
    expect(travel(3)).toBeGreaterThan(travel(4));
  });

  test("turned its widest, the near veins go behind the rim and the far one comes round", () => {
    // At 40° turning right takes the right lobe's outer vein over the edge
    // and brings the left lobe's far vein round; turning left, the mirror.
    expect(near(40 * DEG)).toEqual([true, true, true, true, false, false]);
    expect(near(-40 * DEG)).toEqual([true, false, false, true, true, true]);
    // At the shipped 65° the inner vein has gone behind the rim too, and the
    // whole of the far lobe's skin is out of sight.
    const widest = REPRISE_SURFACE.degrees * DEG;
    expect(widest).toBeGreaterThan(50 * DEG);
    expect(near(widest)).toEqual([true, true, true, false, false, false]);
    expect(near(-widest)).toEqual([false, false, false, true, true, true]);
    // A far vein brought round lands inside the sac, never past its rim.
    for (const q of veinAt(REPRISE_VEINS[2] ?? [], widest)) {
      if (q.near) expect(Math.abs(q.x)).toBeLessThanOrEqual(1);
    }
  });

  test("ships turning (the owner, 2 October 2026), none at 0, and none hushed", () => {
    expect(saved.surface.amount).toBe(1);
    expect(saved.drift).toBe(1);
    expect(repriseTurn(41.3, 0)).toBe(0);
    REPRISE_SURFACE.amount = 0;
    expect(repriseTurn(41.3, 1)).toBe(0);
    REPRISE_SURFACE.amount = 1;
    let widest = 0;
    for (let f = 0; f < 120 * FPS; f++)
      widest = Math.max(widest, Math.abs(repriseTurn(f / FPS, 1)));
    expect(widest).toBeGreaterThan(REPRISE_SURFACE.degrees * DEG * 0.5);
    expect(widest).toBeLessThanOrEqual(REPRISE_SURFACE.degrees * DEG + 1e-9);
  });
});

describe("what a frame of THE REPRISE costs turning", () => {
  const KEYS = ["fill", "stroke", "drawImage", "createLinearGradient", "createRadialGradient"];
  const worst = (): Map<string, number> => {
    const most = new Map<string, number>();
    const fx = new RepriseFx();
    for (let f = 0; f < 20 * FPS; f += 7) {
      const { ctx } = stubCanvas();
      drawReprise(ctx as unknown as CanvasRenderingContext2D, L, CFG, {
        hush: 1,
        phase: "rec",
        eggs: 2,
        standing: 0,
        fx,
        beatPhase: 0.2,
        time: f / FPS,
      });
      for (const [k, v] of ctx.tally) most.set(k, Math.max(most.get(k) ?? 0, v));
    }
    return most;
  };

  test("draws within a tenth of the still sac", () => {
    REPRISE_SURFACE.amount = 0;
    OUTLINE_DRIFT.reprise = 0;
    const still = worst();
    REPRISE_SURFACE.amount = 1;
    OUTLINE_DRIFT.reprise = 1;
    const turning = worst();
    expect(still.get("stroke") ?? 0).toBeGreaterThan(0);
    for (const key of KEYS) {
      expect(turning.get(key) ?? 0, key).toBeLessThanOrEqual(
        Math.ceil((still.get(key) ?? 0) * 1.1),
      );
    }
  });
});
