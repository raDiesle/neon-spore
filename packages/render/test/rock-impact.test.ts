import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { clearBakedCaches } from "../src/baked.js";
import { computeLayout, tileCY } from "../src/layout.js";
import { drawRockBody } from "../src/meteor.js";
import { RockImpactFx } from "../src/rock-impact.js";
import { rockRadius } from "../src/rock-size.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The bug this guards: the sim removes a creature the same tick the beat's
 * fall is computed, so render never gets a frame to glide it through that
 * last, biggest step. Fixed once for the torch (rock-impact.ts); this test
 * keeps it fixed for every rock kind, torch or not, so the next rock added
 * with a `fallTilesPerBeat` above 1 does not quietly reopen it.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
const BEAT_SECONDS = 60 / CFG.bpm;

beforeAll(installCanvasGlobals);

describe.each([["torch", 2, 2] as const, ["meteorFastest", 1, 1] as const])(
  "RockImpactFx with %s",
  (kind, hullGap, span) => {
    it("does not fire onArrive before the replayed fall reaches the hull", () => {
      const fx = new RockImpactFx();
      const { ctx } = stubCanvas();
      let arrived = false;
      const fromRow = CFG.rows - 1 - hullGap;
      fx.spawn(200, L, 0, BEAT_SECONDS, kind, span, fromRow, true, () => {
        arrived = true;
      });

      const skinAt = () => L.hullY;
      // One tick's worth of frames: far short of a whole beat, so the replay —
      // which only has to cover `hullGap` tiles at the kind's own fall speed —
      // has not reached the skin yet.
      fx.draw(ctx as unknown as CanvasRenderingContext2D, L, 0, skinAt);
      expect(arrived).toBe(false);

      // The full beat the fall's last step takes at this tempo, plus a margin,
      // is enough for any kind to have closed the remaining `hullGap` tiles.
      let t = 0;
      for (let i = 0; i < 200; i++) {
        t += BEAT_SECONDS / 100;
        fx.update(BEAT_SECONDS / 100, L);
        fx.draw(ctx as unknown as CanvasRenderingContext2D, L, t, skinAt);
      }
      expect(arrived).toBe(true);
    });

    it("fires onArrive exactly once", () => {
      const fx = new RockImpactFx();
      const { ctx } = stubCanvas();
      let arrivals = 0;
      const fromRow = CFG.rows - 1 - hullGap;
      fx.spawn(200, L, 0, BEAT_SECONDS, kind, span, fromRow, true, () => {
        arrivals += 1;
      });

      const skinAt = () => L.hullY;
      let t = 0;
      for (let i = 0; i < 400; i++) {
        t += BEAT_SECONDS / 100;
        fx.update(BEAT_SECONDS / 100, L);
        fx.draw(ctx as unknown as CanvasRenderingContext2D, L, t, skinAt);
      }
      expect(arrivals).toBe(1);
    });
  },
);

/**
 * The other half of the same fix: a deflected rock's replayed *fall* and the
 * bounce it hands off to have to stop at the same point, or for a frame the
 * rock sits almost touching the ship while its own bounce is already a row
 * above it. `RockImpactFx` is the half that knows where the rock is, so it
 * is the half that decides the point and reports it through `onArrive`.
 */
describe("RockImpactFx deflect arrival target", () => {
  it("replays a deflected rock's fall to the shield row, not the hull skin", () => {
    const fx = new RockImpactFx();
    const { ctx } = stubCanvas();
    const translateYs: number[] = [];
    const origTranslate = ctx.translate.bind(ctx);
    ctx.translate = (...a: number[]) => {
      translateYs.push(a[1] as number);
      return origTranslate(...a);
    };
    let arriveY = Number.NaN;
    const fromRow = CFG.rows - 4;
    fx.spawn(200, L, 0, BEAT_SECONDS, "meteorFastest", 1, fromRow, false, (_x, y) => {
      arriveY = y;
    });

    const skinAt = () => L.hullY;
    // The rock's own look translates again for its smoke and fire; the
    // frame's first `translate` is the one that places the rock, and the
    // last frame that placed one is the frame to read.
    const placedYs: number[] = [];
    let t = 0;
    for (let i = 0; i < 400; i++) {
      t += BEAT_SECONDS / 100;
      fx.update(BEAT_SECONDS / 100, L);
      const before = translateYs.length;
      fx.draw(ctx as unknown as CanvasRenderingContext2D, L, t, skinAt);
      if (translateYs.length > before) placedYs.push(translateYs[before] as number);
    }

    // The point handed to the bounce is already the shield's row — a `tile`
    // above the skin — and `DeflectFx` bounces from it as given.
    expect(arriveY).toBeCloseTo(L.hullY - L.tile, 5);
    // And the replayed sprite stops on that same point rather than sinking to
    // the skin, so the two halves of one motion meet. The slack is a share of a
    // tile and not a count of pixels: the fall is sampled once a frame, so what
    // is left over on the last one is a fraction of how far it moves in a
    // frame, and that scales with the tile. Written as a constant, it went red
    // the day the test view's band gave the field a bigger tile back.
    expect(placedYs.length).toBeGreaterThan(0);
    const lastY = placedYs[placedYs.length - 1] as number;
    expect(Math.abs(lastY - (L.hullY - L.tile))).toBeLessThan(L.tile * 0.12);
  });

  it("never bounces a last-beat catch back above where the rock was standing", () => {
    // The shield answers a rock a third and final time on the beat it is
    // standing on the plating (`hull.ts`), and `fromRow` is then the hull row
    // itself. Shifting up a `tile` from the skin would put the bounce above
    // the rock the player is looking at — a jump, not a deflection — so the
    // arrival never rises above where the replay began. Where it began is
    // where the field pass left the rock: touching the skin, which is above
    // the hull row's centre (`rock-fall.ts`), never under the membrane.
    const fx = new RockImpactFx();
    const { ctx } = stubCanvas();
    let arriveY = Number.NaN;
    const fromRow = CFG.rows - 1;
    fx.spawn(200, L, 0, BEAT_SECONDS, "meteor", 1, fromRow, false, (_x, y) => {
      arriveY = y;
    });

    const skinAt = () => L.hullY;
    let t = 0;
    for (let i = 0; i < 40; i++) {
      t += BEAT_SECONDS / 100;
      fx.update(BEAT_SECONDS / 100, L);
      fx.draw(ctx as unknown as CanvasRenderingContext2D, L, t, skinAt);
    }
    expect(arriveY).toBeGreaterThan(L.hullY - L.tile);
    const touching = L.hullY - rockRadius(L, 1);
    expect(touching).toBeLessThan(tileCY(L, fromRow));
    expect(arriveY).toBeCloseTo(touching, 5);
  });
});

/**
 * The owner's third report: *the meteor changes the colour of its border just
 * before it hits*. The last step of every rock's fall is replayed by this file
 * through `drawTorchRock`, and that body opens with the torch's fire — so a
 * plain grey meteor, drawn all the way down by `drawMeteor` with no flame at
 * all, grew an orange outline for its final moments. The fire belongs to the
 * one rock that carries one.
 *
 * It is counted as **radial gradients** rather than as a stroke colour, and
 * that is the fire itself moving under the test rather than the test changing
 * its mind: the flame was one stroked ring until 9 September 2026 and is a
 * fireball now — two lobed shells filled with radial ramps, plus a halo and
 * nine plumes (`torch-fire.ts`). Nothing else in a replayed fall builds a
 * radial gradient, so the count is still the presence of the flame and nothing
 * else, and it survives the flame being repainted again.
 */
describe("the look of a replayed fall", () => {
  const replay = (kind: "meteor" | "torch"): string[] => {
    const fx = new RockImpactFx();
    const { ctx } = stubCanvas();
    ctx.log = [];
    // Cold, like the reference below: a rock holds the gradients that never
    // move (`gradient-held.ts`), and two draws at one radius would otherwise
    // log different `createRadialGradient` lines.
    clearBakedCaches();
    fx.spawn(200, L, 0, BEAT_SECONDS, kind, 1, CFG.rows - 3, false, () => {}, false, 7, 3);
    fx.draw(ctx as unknown as CanvasRenderingContext2D, L, 0, () => L.hullY);
    return ctx.log;
  };
  // Everything but where it is: the look is placed by a `translate` and its
  // cached halo by a `drawImage`, and those two are the only ops that differ
  // between a rock at the hull and the same rock drawn at the origin.
  const placesNothing = (e: string): boolean =>
    !e.startsWith("translate(") && !e.startsWith("drawImage(");
  const ops = (log: string[]): string => log.filter(placesNothing).join("\n");

  it("is the plain rock's own — seed, pits and all — not a stone of greys", () => {
    // The replay is the last frames of the fall the field was drawing; the
    // owner saw it switch to *old simple grey graphic* the moment the sim let
    // go of the body. So it draws by `drawRockBody` with the body's seed.
    const ref = stubCanvas().ctx;
    ref.log = [];
    clearBakedCaches();
    drawRockBody(ref as unknown as CanvasRenderingContext2D, 0, 0, rockRadius(L, 1), 0, 7, 3);
    expect(ops(replay("meteor"))).toContain(ops(ref.log));
  });

  it("is still the torch's fire around the torch", () => {
    expect(replay("torch").some((e) => e.startsWith("createRadialGradient("))).toBe(true);
  });
});
