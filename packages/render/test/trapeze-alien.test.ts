import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { computeLayout } from "../src/layout.js";
import { drawTrapeze } from "../src/trapeze-draw.js";
import { TrapezeFx } from "../src/trapeze-fx.js";
import { stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { posed, stood } from "./trapeze-harness.js";

/**
 * **The alien on the swing** (`trapeze-alien.ts`): it faces the gong, turns
 * round on the seat when the next gong hangs on the other side, and throws
 * its legs out at a kick — each eased in `TrapezeFx`, and each gone again on
 * a restart.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);
installCanvasGlobals();
const L = computeLayout(VIEWPORT, CFG, "p1");

/** One second of frames, at thirty a second. */
function second(fx: TrapezeFx): void {
  for (let i = 0; i < 30; i++) fx.update(1 / 30);
}

describe("THE TRAPEZE's alien", () => {
  it("turns to face the lit level's gong, through edge-on", () => {
    const world = stood();
    const s = posed(world, "push", 0, (x) => {
      x.steps[0] = { ...x.steps[0], gongSide: -1 } as (typeof x.steps)[0];
    });
    const fx = new TrapezeFx();
    const { ctx } = stubCanvas();
    drawTrapeze(ctx as unknown as CanvasRenderingContext2D, L, world, s, world.beat, 0, 0, fx);
    expect(fx.face).toBe(-1);
    fx.update(1 / 30);
    expect(fx.facing).toBeGreaterThan(-1);
    expect(fx.facing).toBeLessThan(1);
    second(fx);
    expect(fx.facing).toBe(-1);
  });

  it("throws its legs out at the gong, and lets them fall back", () => {
    const fx = new TrapezeFx();
    fx.ingest([{ type: "trapezeGong", gongs: 1, col: 4 }], L, CFG, 0.5, () => {});
    expect(fx.kick).toBe(1);
    second(fx);
    expect(fx.kick).toBe(0);
  });

  it("faces right again, legs down, after a restart", () => {
    const fx = new TrapezeFx();
    fx.face = -1;
    fx.kick = 1;
    second(fx);
    fx.clear();
    expect([fx.facing, fx.face, fx.kick]).toEqual([1, 1, 0]);
  });
});
