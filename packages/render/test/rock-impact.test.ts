import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
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

describe.each([["torch", 2] as const, ["meteorFastest", 1] as const])(
  "RockImpactFx with %s",
  (kind, hullGap) => {
    it("does not fire onArrive before the replayed fall reaches the hull", () => {
      const fx = new RockImpactFx();
      const { ctx } = stubCanvas();
      let arrived = false;
      const fromRow = CFG.rows - 1 - hullGap;
      fx.spawn(200, L, 0, BEAT_SECONDS, kind, fromRow, () => {
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
      fx.spawn(200, L, 0, BEAT_SECONDS, kind, fromRow, () => {
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
