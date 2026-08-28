import { beforeAll, describe, expect, it } from "bun:test";
import { DeflectFx } from "../src/deflect.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The bug this guards: `rock-impact.ts` hands `DeflectFx.spawn` the point it
 * last saw the rock, which is the hull's own breathing skin (`hullSkinY`) —
 * the same point an *undeflected* rock sinks into. The rule answers a
 * deflected meteor a whole row higher, at `shieldRow` (`packages/sim/src/
 * hull.ts`), and by the time the replayed fall actually reaches the hull the
 * shield's armed bulge has almost always eased back off, so that point reads
 * as the plain hull surface regardless of how armed the shield was at the
 * moment of the block. `DeflectFx.spawn` corrects for the one row that gap
 * always is — see the comment on `spawn` for why a fixed `tile` shift is the
 * part of this that does not need to know any of that.
 */

const TILE = 75.6;

beforeAll(installCanvasGlobals);

/** Records the y a stub context was asked to `translate` or `arc` to. */
function trackY(ctx: ReturnType<typeof stubCanvas>["ctx"]): {
  translateYs: number[];
  arcYs: number[];
} {
  const translateYs: number[] = [];
  const arcYs: number[] = [];
  const origTranslate = ctx.translate.bind(ctx);
  ctx.translate = (...a: number[]) => {
    translateYs.push(a[1] as number);
    return origTranslate(...a);
  };
  const origArc = ctx.arc.bind(ctx);
  ctx.arc = (x, y, r, from, to) => {
    arcYs.push(y);
    return origArc(x, y, r, from, to);
  };
  return { translateYs, arcYs };
}

describe("DeflectFx.spawn", () => {
  it("starts the bounced rock a tile above the point it is given, not on it", () => {
    const fx = new DeflectFx();
    fx.spawn(200, 1130, TILE, 1);
    const { ctx } = stubCanvas();
    const { translateYs } = trackY(ctx);
    fx.draw(ctx as unknown as CanvasRenderingContext2D);
    expect(translateYs.length).toBeGreaterThan(0);
    for (const y of translateYs) expect(y).toBeCloseTo(1130 - TILE, 5);
  });

  it("never draws the shockwave below the point it started at", () => {
    // The shockwave only ever grows outward from where it started
    // (`update`'s `s.r += ...`), so the arc's own y never moves — this is the
    // one call that would catch a regression back to the un-shifted height.
    const fx = new DeflectFx();
    fx.spawn(200, 1130, TILE, 2);
    const { ctx } = stubCanvas();
    const { arcYs } = trackY(ctx);
    fx.update(0.1, TILE);
    fx.draw(ctx as unknown as CanvasRenderingContext2D);
    expect(arcYs.length).toBeGreaterThan(0);
    for (const y of arcYs) expect(y).toBeCloseTo(1130 - TILE, 5);
  });
});
