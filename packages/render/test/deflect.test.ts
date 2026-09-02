import { beforeAll, describe, expect, it } from "bun:test";
import { DeflectFx } from "../src/deflect.js";
import { DEFLECT_LOOK } from "../src/deflect-look.js";
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

/**
 * The owner's ask — "A DEFLECTED ROCK SHOULD PRESS INTO THE SHIELD BEFORE IT
 * LEAVES": a rock that reverses on one tick reads as a rock
 * that teleported, so the moment of contact needs a shape — the rock presses
 * into the shield and the shield gives, and both spring back, before the
 * ordinary bounce carries them on. `DEFLECT_LOOK` is the adopted `heave`/`tick`
 * merge (`docs/versus.md`): the give is deliberately long and deep — "a long
 * deep heave you can arrive late to" — not the slight dip shipped before it.
 */
describe("DeflectFx press-and-release", () => {
  it("presses the rock into the shield before it springs away", () => {
    const fx = new DeflectFx();
    fx.spawn(200, 1130, TILE, 1);
    const spawnY = 1130 - TILE;
    const { ctx } = stubCanvas();
    const { translateYs } = trackY(ctx);
    // Covers the whole press window (`PRESS_LIFE`) and well beyond it, at a
    // frame-sized step.
    for (let i = 0; i < 20; i++) {
      fx.update(0.01, TILE);
      fx.draw(ctx as unknown as CanvasRenderingContext2D);
    }
    // Some frame during the press reads as deeper into the hull (greater
    // screen y) than where it was handed — that is the press.
    expect(Math.max(...translateYs)).toBeGreaterThan(spawnY);
    // By the last sampled frame the ordinary bounce has taken over and
    // carried it back up past where it started — the spring-back and leave.
    expect(translateYs[translateYs.length - 1]).toBeLessThan(spawnY);
  });

  it("keeps the press a fraction of a tile, not a lurch off the field", () => {
    const fx = new DeflectFx();
    fx.spawn(200, 1130, TILE, 1);
    const spawnY = 1130 - TILE;
    const { ctx } = stubCanvas();
    const { translateYs } = trackY(ctx);
    for (let i = 0; i < 5; i++) {
      fx.update(0.02, TILE);
      fx.draw(ctx as unknown as CanvasRenderingContext2D);
    }
    const maxDip = Math.max(...translateYs) - spawnY;
    expect(maxDip).toBeGreaterThan(0);
    // The adopted heave/tick merge presses deep on purpose — the ceiling is
    // `pressDepthFrac`'s own bound, not the shipped-shallow number.
    expect(maxDip).toBeLessThan(TILE * (DEFLECT_LOOK.pressDepthFrac + 0.1));
  });

  it("starts the shockwave ring compressed, then springs it back out", () => {
    const fx = new DeflectFx();
    fx.spawn(200, 1130, TILE, 1);
    // The ring's resting radius — `DeflectFx.spawn`'s own `shockR`, not a
    // copy of it, so a future look's `ringSpanFrac` cannot drift this stale.
    const baseR = TILE * DEFLECT_LOOK.ringSpanFrac;
    const { ctx } = stubCanvas();
    const arcRs: number[] = [];
    const origArc = ctx.arc.bind(ctx);
    ctx.arc = (x: number, y: number, r: number, from: number, to: number) => {
      arcRs.push(r);
      return origArc(x, y, r, from, to);
    };
    // The moment of contact: no time has passed, so the ring reads as the
    // shield having already given, not yet sprung back. `rings` draws more
    // than one arc per call now (the adopted `heave`/`tick` merge), so the
    // outermost of the first group — index 0 — is the one this bound is about.
    const ringsPerDraw = Math.max(1, Math.round(DEFLECT_LOOK.rings));
    fx.draw(ctx as unknown as CanvasRenderingContext2D);
    expect(arcRs[0]).toBeLessThan(baseR);
    // Past the press window and well into ordinary growth.
    for (let i = 0; i < 10; i++) fx.update(0.02, TILE);
    fx.draw(ctx as unknown as CanvasRenderingContext2D);
    expect(arcRs[ringsPerDraw]).toBeGreaterThan(baseR);
  });
});
