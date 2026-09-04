import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { computeLayout, tileCY } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { RockImpactFx } from "../src/rock-impact.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

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
    let t = 0;
    for (let i = 0; i < 400; i++) {
      t += BEAT_SECONDS / 100;
      fx.update(BEAT_SECONDS / 100, L);
      fx.draw(ctx as unknown as CanvasRenderingContext2D, L, t, skinAt);
    }

    // The point handed to the bounce is already the shield's row — a `tile`
    // above the skin — and `DeflectFx` bounces from it as given.
    expect(arriveY).toBeCloseTo(L.hullY - L.tile, 5);
    // And the replayed sprite stops on that same point rather than sinking to
    // the skin, so the two halves of one motion meet.
    expect(translateYs.length).toBeGreaterThan(0);
    const lastY = translateYs[translateYs.length - 1] as number;
    expect(Math.abs(lastY - (L.hullY - L.tile))).toBeLessThan(3);
  });

  it("never bounces a last-beat catch back above where the rock was standing", () => {
    // The shield answers a rock a third and final time on the beat it is
    // standing on the plating (`hull.ts`), and `fromRow` is then the hull row
    // itself. Shifting up a `tile` from the skin would put the bounce above
    // the rock the player is looking at — a jump, not a deflection — so the
    // arrival never rises above where the replay began.
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
    expect(arriveY).toBeCloseTo(tileCY(L, fromRow), 5);
  });
});

/** Every colour the stub was asked to stroke in, in order. */
function trackStrokes(ctx: ReturnType<typeof stubCanvas>["ctx"]): unknown[] {
  const seen: unknown[] = [];
  const desc = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(ctx),
    "strokeStyle",
  ) as PropertyDescriptor;
  Object.defineProperty(ctx, "strokeStyle", {
    configurable: true,
    get: () => desc.get?.call(ctx),
    set: (v: unknown) => {
      seen.push(v);
      desc.set?.call(ctx, v);
    },
  });
  return seen;
}

/**
 * The owner's third report: *the meteor changes the colour of its border just
 * before it hits*. The last step of every rock's fall is replayed by this
 * file through `drawTorchRock`, and that body opens with the torch's ember
 * ring — so a plain grey meteor, drawn all the way down by `drawMeteor` with
 * no ring at all, grew an orange outline for its final moments. The ring
 * belongs to the one rock that carries a flame.
 */
describe("the ember ring in a replayed fall", () => {
  const replay = (kind: "meteor" | "torch"): unknown[] => {
    const fx = new RockImpactFx();
    const { ctx } = stubCanvas();
    const strokes = trackStrokes(ctx);
    fx.spawn(200, L, 0, BEAT_SECONDS, kind, 1, CFG.rows - 3, true, () => {});
    fx.draw(ctx as unknown as CanvasRenderingContext2D, L, 0, () => L.hullY);
    return strokes;
  };

  it("is not drawn around a plain meteor, which never has one on the field", () => {
    expect(replay("meteor")).not.toContain(PALETTE.ember);
  });

  it("is still drawn around the torch, whose flame it is", () => {
    expect(replay("torch")).toContain(PALETTE.ember);
  });
});
