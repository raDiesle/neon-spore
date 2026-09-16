import { beforeAll, describe, expect, it } from "bun:test";
import { BALLOON, balloonOutline } from "@neon-spore/content";
import { balloonPopSkin } from "../src/balloon.js";
import { BALLOON_SKIN, balloonShreds, balloonTear } from "../src/balloon-burst.js";
import { BALLOON_HIT, hitFor } from "../src/body-hit.js";
import { BREAK_LOOK, fractureFrom } from "../src/break-look.js";
import { Debris } from "../src/debris.js";
import { breakSparks } from "../src/effects-break.js";
import { computeLayout } from "../src/layout.js";
import { shatter } from "../src/shatter.js";
import { CFG, installCanvasGlobals, stubCanvas, VIEWPORT } from "./frame-harness.js";

/**
 * THE BALLOON's pop, as a **break** (`balloon-burst.ts`).
 *
 * What an eye has to answer is whether sixteen shreds read as a skin rather
 * than as a flower coming apart, and that is this lane's own check and needs
 * the owner. What is held here is the three things that can go wrong without
 * anybody noticing: that the cut leaves no slab of invented interior, that
 * every piece leaves the middle rather than falling where it stood, and that
 * the squares the `destroy` beside it still throws have come down — because a
 * `sparkScale` left at one is the old effect playing over the new one and it
 * looks like a busier version of the right answer.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const SEED = 1234;

const SKIN = balloonPopSkin(L.tile);
const TEAR = balloonTear(SKIN, SEED);

function cut() {
  const outline = balloonOutline(SKIN.rx, SKIN.rx, SKIN.ry, BALLOON.wobble, 0, 3);
  return shatter(outline, fractureFrom(BALLOON_SKIN, L.tile, SEED, TEAR.x, TEAR.y));
}

describe("the cut a balloon's skin comes apart on", () => {
  it("is two rings, so the shreds are two sizes leaving at two speeds", () => {
    const pieces = cut();
    // Every way round the skin is cut twice, which is the whole reason the
    // ring of pieces comes apart instead of opening evenly (`balloon-burst.ts`
    // says what the one-ring version looked like).
    expect(pieces).toHaveLength(BALLOON_SKIN.wedges * 2);
    const speeds = pieces.map((p) => Math.hypot(p.vx, p.vy));
    expect(Math.max(...speeds)).toBeGreaterThan(Math.min(...speeds) * 1.5);
  });

  it("throws every shred away from where the skin gave, not from the middle", () => {
    // The tear is out on the rim, which is what stops the pieces opening as an
    // even ring — so *that* is the point they leave, and it is what the test
    // has to measure against rather than the body's centre.
    expect(Math.abs(TEAR.x)).toBeGreaterThan(SKIN.rx * 0.5);
    for (const p of cut()) {
      const dx = p.x - TEAR.x;
      const dy = p.y - TEAR.y;
      expect(dx * p.vx + dy * p.vy, `${p.x},${p.y}`).toBeGreaterThan(0);
    }
  });

  it("is bigger and faster than the break a struck body gets", () => {
    expect(BALLOON_SKIN.wedges).toBeGreaterThan(BREAK_LOOK.wedges);
    expect(BALLOON_SKIN.speedTiles).toBeGreaterThan(BREAK_LOOK.speedTiles);
    // **It was "and lighter" until 16 September 2026**, when the owner took
    // `creature:debris` / `drift` and the ordinary break's pull went from 14
    // tiles per second squared to 1. The pop's is still 11, so the two have
    // swapped: the skin now falls and the struck body hangs. That is not a
    // relationship anybody chose, so the clause is gone rather than reversed —
    // a test asserting the new order would make an accident into a rule. The
    // question of whether the pop should follow the break is the owner's, and
    // it is in `docs/queue.md`.
  });
});

describe("the shreds, through a canvas that refuses what a real one does", () => {
  it("draws them while they are flying and forgets them once they are gone", () => {
    const debris = new Debris();
    balloonShreds(debris, L, 0.5, { col: 3, row: 8 });
    debris.update(0.2);
    const flying = stubCanvas();
    debris.draw(flying.ctx as unknown as CanvasRenderingContext2D);
    expect(flying.ctx.calls).toBeGreaterThan(0);
    // Past its life, and nothing is left behind on the plating for ever.
    debris.update(BALLOON_SKIN.life);
    const gone = stubCanvas();
    debris.draw(gone.ctx as unknown as CanvasRenderingContext2D);
    expect(gone.ctx.calls).toBe(0);
  });

  it("draws nothing at all for a pop that never happened", () => {
    const debris = new Debris();
    const { ctx } = stubCanvas();
    debris.draw(ctx as unknown as CanvasRenderingContext2D);
    expect(ctx.calls).toBe(0);
  });
});

describe("the squares the pop's own `destroy` still throws", () => {
  it("come down to the flash, so the shreds are not drawn over the old burst", () => {
    expect(hitFor("balloon")).toBe(BALLOON_HIT);
    expect(BALLOON_HIT.pieces).toBe(BALLOON_SKIN);
    expect(BALLOON_SKIN.sparkScale).toBeLessThan(BREAK_LOOK.sparkScale);
    const pop = { type: "destroy", col: 3, row: 8, color: "cyan", kind: "balloon" } as const;
    expect(breakSparks(pop, 12)).toBe(Math.round(12 * BALLOON_SKIN.sparkScale));
  });

  it("leaves a body that is not a balloon exactly where it was", () => {
    const kill = { type: "destroy", col: 3, row: 8, color: "red", kind: "slick" } as const;
    expect(breakSparks(kill, 12)).toBe(Math.round(12 * BREAK_LOOK.sparkScale));
  });
});
