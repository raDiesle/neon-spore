import { beforeAll, describe, expect, it } from "bun:test";
import { ChuteCutFx } from "../src/chute-cut.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The owner's ask, in his own order: *the paraglider should be released from
 * the enemy and then vanish with effect to top, and the enemy falls down a
 * little bit, then vanishes with a nice animation as well.*
 *
 * Three claims, and all three are about direction and distance rather than
 * about pixels: the canopy goes **up**, the body goes **down**, and the body
 * does not go far enough to leave the lane the pair named it in. A frame is
 * pixels and pixels are not assertable, but a `translate` is — the same seam
 * `deflect.test.ts` reads a bounce through.
 */

const TILE = 75.6;
const X = 200;
const Y = 900;
/** What `ingest` hands a spawn — the 0.4 of a tile every living body is drawn
 * at, and what `DROP` and `RISE` are counted in. */
const R = TILE * 0.4;

beforeAll(installCanvasGlobals);

/** Every y a stub context was asked to translate to, in draw order: the canopy
 * first, then the body (`ChuteCutFx.draw`). */
function translateYs(fx: ChuteCutFx): number[] {
  const { ctx } = stubCanvas();
  const ys: number[] = [];
  const orig = ctx.translate.bind(ctx);
  ctx.translate = (...a: number[]) => {
    ys.push(a[1] as number);
    return orig(...a);
  };
  fx.draw(ctx as unknown as CanvasRenderingContext2D);
  return ys;
}

function cut(): ChuteCutFx {
  const fx = new ChuteCutFx();
  fx.spawn(X, Y, R, "red", "slick", 3);
  return fx;
}

describe("a chute cut out from under its canopy", () => {
  it("sends the canopy up and the body down, out of one tile", () => {
    const fx = cut();
    // The frame of the hit: both halves are still where the shot met them.
    const first = translateYs(fx);
    expect(first).toHaveLength(2);
    for (const y of first) expect(y).toBeCloseTo(Y, 5);

    for (let i = 0; i < 12; i++) fx.update(1 / 60);
    const later = translateYs(fx);
    expect(later).toHaveLength(2);
    // Up, and by more than a tile already — the canopy is leaving, not
    // drifting.
    expect(later[0] as number).toBeLessThan(Y - TILE);
    // Down, and the body is still coming down.
    expect(later[1] as number).toBeGreaterThan(Y);
  });

  it("drops the body under a tile and stops it there", () => {
    const fx = cut();
    let deepest = Y;
    for (let i = 0; i < 60; i++) {
      fx.update(1 / 60);
      const ys = translateYs(fx);
      const body = ys[ys.length - 1];
      if (body !== undefined) deepest = Math.max(deepest, body);
    }
    expect(deepest).toBeGreaterThan(Y);
    // Under a tile, so it dies in the lane it was named in rather than
    // reading as a body that moved to the row below.
    expect(deepest - Y).toBeLessThan(TILE);
  });

  it("is over inside a beat and leaves nothing behind", () => {
    const fx = cut();
    for (let i = 0; i < 60; i++) fx.update(1 / 60);
    expect(translateYs(fx)).toHaveLength(0);
    expect(fx).toEqual(new ChuteCutFx());
  });

  it("clears on a restart, so a cut cannot outlive the run it happened in", () => {
    const fx = cut();
    fx.update(1 / 60);
    expect(fx).not.toEqual(new ChuteCutFx());
    fx.clear();
    expect(fx).toEqual(new ChuteCutFx());
  });
});
