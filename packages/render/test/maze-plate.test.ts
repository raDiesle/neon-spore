import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { DEFAULT_CONFIG as CFG, MAZE_TURN, type MazeWheel, mazeWheel } from "@neon-spore/sim";
import { MAZE_WHOLE } from "../src/maze-fall.js";
import { drawMazeBed, drawMazeBezel } from "../src/maze-plate.js";
import { mazeCanvasAngle, mazeRimHalfGapMilli } from "../src/maze-walls.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MAZE's plate, held to the two things that would make it wrong.
 *
 * The bezel is **cut where the rim is cut**: a solid ring outside a way in
 * would say the way was shut, so no bolt stands in a cut and the band is one
 * sector per stretch of rim between two cuts. And every mark of it **goes with
 * the rim when the drum comes apart**: once the rim has faded, nothing of the
 * bezel is drawn.
 */

beforeAll(installCanvasGlobals);

const DRUM = { cx: 450, cy: 500, r: 300 };

/** Three rings, two ways in at the top and the bottom of the rim. */
function wheel(): MazeWheel {
  return mazeWheel(
    {
      rings: 3,
      coreMilli: 250,
      openMilli: 60,
      walls: [[], [0, 180_000], [0, 180_000], [0, 180_000]],
      openings: [
        [90_000, 270_000],
        [45_000, 225_000],
        [45_000, 225_000],
        [0, 180_000],
      ],
    },
    15_000,
  );
}

/** Every `arc` drawn, with its centre and radius. */
function arcsOf(draw: (ctx: CanvasRenderingContext2D) => void) {
  const { ctx } = stubCanvas();
  const arcs: { x: number; y: number; r: number }[] = [];
  const spy = new Proxy(ctx, {
    get(target, prop, receiver) {
      if (prop === "arc") {
        return (x: number, y: number, r: number, ...rest: number[]) => {
          arcs.push({ x, y, r });
          return (target.arc as (...a: number[]) => void)(x, y, r, ...rest);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  }) as unknown as CanvasRenderingContext2D;
  draw(spy);
  return arcs;
}

describe("THE MAZE's plate", () => {
  it("cuts the bezel where the rim is cut, one sector per stretch", () => {
    const w = wheel();
    const arcs = arcsOf((ctx) => drawMazeBezel(ctx, DRUM, w, 0, MAZE_WHOLE, CFG));
    const out = DRUM.r * 1.05;
    // Two cuts, two sectors: each is an outer arc, an inner arc and the
    // hairline on the outer edge — six arcs at the two radii, no full circle.
    const band = arcs.filter((a) => Math.abs(a.r - out) < 1e-6 || Math.abs(a.r - DRUM.r) < 1e-6);
    expect(band.length).toBe(6);
  });

  it("stands no bolt in a way in", () => {
    const w = wheel();
    const arcs = arcsOf((ctx) => drawMazeBezel(ctx, DRUM, w, 0, MAZE_WHOLE, CFG));
    const heads = arcs.filter((a) => a.r < DRUM.r * 0.02 && a.r > DRUM.r * 0.01);
    expect(heads.length).toBeGreaterThan(8);
    const half = mazeRimHalfGapMilli(w, DRUM.r);
    for (const cut of w.openings[w.rings] ?? []) {
      const p = mazeCanvasAngle(cut);
      const gx = DRUM.cx + DRUM.r * Math.cos(p);
      const gy = DRUM.cy + DRUM.r * Math.sin(p);
      const reach = (DRUM.r * Math.PI * 2 * half) / MAZE_TURN;
      for (const h of heads) {
        expect(Math.hypot(h.x - gx, h.y - gy)).toBeGreaterThan(reach);
      }
    }
  });

  it("goes with the rim when the drum comes apart", () => {
    const w = wheel();
    const gone = { fall: 1, crash: 0, hullY: 0 };
    expect(arcsOf((ctx) => drawMazeBezel(ctx, DRUM, w, 0, gone, CFG)).length).toBe(0);
    expect(arcsOf((ctx) => drawMazeBed(ctx, DRUM, w, gone)).length).toBe(0);
    expect(arcsOf((ctx) => drawMazeBed(ctx, DRUM, w, MAZE_WHOLE)).length).toBeGreaterThan(0);
  });
});
