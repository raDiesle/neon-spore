import { beforeAll, describe, expect, it } from "bun:test";
import { computeLayout } from "../src/layout.js";
import { drawShieldFlashes } from "../src/shield-flash.js";
import { drawShieldSparks, resonantLook, SHIELD_SPARK_LOOK } from "../src/shield-spark.js";
import { CFG, installCanvasGlobals, stubCanvas, VIEWPORT } from "./frame-harness.js";

beforeAll(installCanvasGlobals);

/**
 * The shield's ambient arcs ship now — the owner asked for them back by name,
 * so `SHIELD_SPARK_LOOK.perSecond` is no longer 0 and the record's old proof
 * ("makes no canvas call at all") has nothing left to prove.
 *
 * What replaces it is the pair of properties that actually matter about an
 * effect that is on the screen for the whole game, and neither is safe to
 * leave to the next reader's eye: it draws *something* at the shipped record,
 * and it is off far more often than on. An arc that crackles continuously is a
 * texture on the rim rather than a shield under load, and that failure is
 * invisible in a still.
 */
describe("the shield's ambient arcs (shield-spark.ts)", () => {
  const L = computeLayout(VIEWPORT, CFG, "test");
  const cols = [3, 3.4, 3.8, 4.1];
  const surface = (x: number) => ({ x, y: L.hullY });

  it("draws at the shipped record — the shield is never a dark rim", () => {
    const { ctx } = stubCanvas();
    for (let t = 0; t < 40; t += 0.1) {
      drawShieldSparks(ctx as unknown as CanvasRenderingContext2D, L, t, cols, surface);
    }
    expect(ctx.calls).toBeGreaterThan(0);
  });

  it("fires only a few, briefly — not a steady crackle", () => {
    const dt = 1 / 60;
    const duration = 20;
    let framesLit = 0;
    let total = 0;
    for (let t = 0; t < duration; t += dt) {
      const { ctx } = stubCanvas();
      drawShieldSparks(ctx as unknown as CanvasRenderingContext2D, L, t, cols, surface);
      total++;
      if (ctx.calls > 0) framesLit++;
    }
    const share = framesLit / total;
    // "A few small ones, irregularly", the owner's ask — on often enough to
    // notice, off far more often than on.
    expect(share).toBeGreaterThan(0.02);
    expect(share).toBeLessThan(0.35);
  });

  it("reaches much further while a clasp is answering in the column", () => {
    // The resonance the owner asked for, as the one number that carries it:
    // the arcs grow rather than a second effect arriving.
    expect(resonantLook(SHIELD_SPARK_LOOK, 1).reachMul).toBeGreaterThan(
      SHIELD_SPARK_LOOK.reachMul * 3,
    );
    expect(resonantLook(SHIELD_SPARK_LOOK, 0).reachMul).toBe(SHIELD_SPARK_LOOK.reachMul);
  });
});

/**
 * `shield-flash.ts` is the same kind of lift as `shield-spark.ts`: a soft
 * patch of light beside `shield-spark.ts`'s jagged arc, both saying the
 * shield is charged. Shipped, not offered — `SHIELD_FLASH_LOOK` carries its
 * real, non-zero defaults, so the first test pins that the shipped record
 * actually draws something, and the second pins "a few, briefly" as a number
 * rather than leaving it to a reader's eye.
 */
describe("the shield's ambient flashes (shield-flash.ts)", () => {
  const L = computeLayout(VIEWPORT, CFG, "test");
  const from = 200;
  const to = 500;
  const surface = (x: number) => ({ x, y: L.hullY });

  it("draws nothing when the rim has no span", () => {
    const { ctx } = stubCanvas();
    for (let t = 0; t < 40; t += 0.1) {
      drawShieldFlashes(ctx as unknown as CanvasRenderingContext2D, L, t, from, from, surface);
    }
    expect(ctx.calls).toBe(0);
  });

  it("pops up only a little, at the shipped record — not a steady glow", () => {
    const dt = 1 / 60;
    const duration = 20;
    let framesLit = 0;
    let total = 0;
    for (let t = 0; t < duration; t += dt) {
      const { ctx } = stubCanvas();
      drawShieldFlashes(ctx as unknown as CanvasRenderingContext2D, L, t, from, to, surface);
      total++;
      if (ctx.calls > 0) framesLit++;
    }
    const share = framesLit / total;
    // "A few random places, in random timings" — on often enough to notice,
    // off far more often than on, at most four flashes overlapping.
    expect(share).toBeGreaterThan(0.02);
    expect(share).toBeLessThan(0.6);
  });
});
