import { beforeAll, describe, expect, it } from "bun:test";
import type { Creature } from "@neon-spore/sim";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { drawMeteor } from "../src/meteor.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * `drawMeteor` through the strict canvas stub: no assertion here says the
 * rock looks like a rock — that question is for a phone, not `bun test` — but
 * every colour, coordinate and gradient stop it hands the canvas has to be one
 * a real canvas would accept. The pits used to be a flat fill and a
 * fixed-alpha stroke, neither of which could go wrong this way; now each one
 * builds two gradients from the same key axis the body's own light comes
 * from, and that is exactly the kind of change this file exists to catch —
 * an out-of-range gradient stop or a non-finite coordinate the type checker
 * cannot see.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");

beforeAll(installCanvasGlobals);

function meteor(id: number, holes: number): Creature {
  return {
    id,
    kind: "meteor",
    col: 3,
    row: 4,
    fromRow: 3,
    color: null,
    holes,
    petals: 0,
    dragMilli: 0,
    shell: 0,
  };
}

describe("drawMeteor", () => {
  it("draws a bare rock, with no pits, without the canvas objecting", () => {
    const { ctx } = stubCanvas();
    expect(() =>
      drawMeteor(ctx as unknown as CanvasRenderingContext2D, L, meteor(1, 0), 200, 300, 0),
    ).not.toThrow();
  });

  it("draws every pit count a meteor can carry, across a spin and a wobble", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    for (let holes = 0; holes <= 5; holes++) {
      for (let id = 0; id < 13; id++) {
        for (let t = 0; t < 20; t++) {
          const time = t * 0.31;
          expect(() => drawMeteor(c, L, meteor(id, holes), 220, 900, time)).not.toThrow();
        }
      }
    }
  });

  it("keeps a pit's own gradient stops inside 0..1, at every id and spin", () => {
    // The stub's `addColorStop` fails outside 0..1, so this is really the
    // same claim as the loop above — spelled out because a gradient stop is
    // the one place a fixed table (`PIT_FLOOR`, `PIT_LIP`) and a computed
    // one (`u` from the pit's own position) both have to land, and the
    // fixed table was hand-checked while the computed one was not.
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    for (let id = 0; id < 13; id++) {
      expect(() => drawMeteor(c, L, meteor(id, 5), 220, 900, 4.7)).not.toThrow();
    }
  });
});
