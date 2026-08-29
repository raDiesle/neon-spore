import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { computeLayout, tileCX } from "../src/layout.js";
import { drawShieldRim, ShieldBody } from "../src/shield.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The owner's `FAIL` on `bacca00` — "I still see the rock goes into the ship
 * (on cannon position)" — sent a previous lane looking for where the shield
 * is drawn versus where `resolveHull` tests it (`packages/sim/src/hull.ts`).
 * That lane found the sim correct (`packages/sim/test/guard.test.ts`'s "does
 * not hold a rock at the ship when it is parked under one" already passes)
 * and the mouse-seat bug ruled out (`tools/director/src/touch.ts`'s shield
 * strip answers by explicit player number, not by the hard-wired seat, so a
 * PC mouse does move the shield). The row gap between the armed dome's crown
 * and `shieldRow` is accounted for on purpose, in `shieldRow`'s own comment —
 * a rock's rendered radius reaches the crown before its tracked row does.
 *
 * What was still unguarded: nothing pinned the shield's drawn *column* to the
 * one the sim tests. `resolveHull` answers `world.shieldCol` — an integer,
 * read the instant it changes — while `ShieldBody` carries it across the
 * screen as a spring chain that only *converges* on it (`shield.ts`'s own
 * doc: "a worm does not move like that"). At rest the two have to agree, or a
 * held shield would read in one column and answer in another forever, not
 * only mid-slide. This is that guard, not a bug found and fixed.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
/** Long enough for every segment's spring (`OMEGA`, lowest 9) to settle. */
const SETTLE_TICKS = 600;
const DT = 1 / 60;

beforeAll(installCanvasGlobals);

describe("ShieldBody at rest", () => {
  it("converges its whole chain onto the exact column resolveHull tests", () => {
    const body = new ShieldBody();
    const targetCol = 5;
    for (let i = 0; i < SETTLE_TICKS; i++) body.update(targetCol, DT);
    expect(body.head).toBeCloseTo(targetCol, 4);
    const { from, to } = body.span;
    expect(from).toBeCloseTo(targetCol, 4);
    expect(to).toBeCloseTo(targetCol, 4);
    for (const seg of body.segments) expect(seg.col).toBeCloseTo(targetCol, 4);
  });
});

describe("drawShieldRim at rest", () => {
  it("centres the rim on tileCX(l, shieldCol) — the same function a rock's own column reads", () => {
    const body = new ShieldBody();
    const targetCol = 4;
    for (let i = 0; i < SETTLE_TICKS; i++) body.update(targetCol, DT);
    const expectedX = tileCX(L, targetCol);

    const xs: number[] = [];
    const surface = (x: number): { x: number; y: number } => {
      xs.push(x);
      return { x, y: 0 };
    };
    const { ctx } = stubCanvas();
    drawShieldRim(
      ctx as unknown as CanvasRenderingContext2D,
      L,
      1,
      0,
      { cannon: 0, shield: body.segments },
      surface,
    );

    expect(xs.length).toBeGreaterThan(0);
    const mid = (Math.min(...xs) + Math.max(...xs)) / 2;
    expect(mid).toBeCloseTo(expectedX, 1);
  });
});
