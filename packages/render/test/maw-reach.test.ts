import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, ticksPerBeat } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { drawMawReach } from "../src/maw-reach.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, ROLES, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The maw's reach, drawn: nothing while SUCK is shut, a light over every
 * column the maw would take a pod from while it is open, and the whole field
 * through a canvas that refuses what a real one refuses, on every seat, with
 * the maw pressed over and over.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const flat = () => L.hullY;

describe("the maw's reach", () => {
  it("draws nothing while the maw is shut", () => {
    const { ctx } = stubCanvas();
    drawMawReach(ctx as unknown as CanvasRenderingContext2D, L, 0, 5, CFG.podCatchCols, flat);
    expect(ctx.tally.get("fillRect") ?? 0).toBe(0);
  });

  it("lights every column it reaches, and its two edges", () => {
    const { ctx } = stubCanvas();
    drawMawReach(ctx as unknown as CanvasRenderingContext2D, L, 1, 5, CFG.podCatchCols, flat);
    const columns = CFG.podCatchCols * 2 + 1;
    expect(ctx.tally.get("fillRect")).toBe(columns * 3 + 2);
  });

  it("stops at the side of the field", () => {
    const { ctx } = stubCanvas();
    drawMawReach(ctx as unknown as CanvasRenderingContext2D, L, 1, 0, CFG.podCatchCols, flat);
    // Column 0 and the two to its right, and only the right-hand edge.
    expect(ctx.tally.get("fillRect")).toBe((CFG.podCatchCols + 1) * 3 + 1);
  });

  it("survives a frame on every seat with the maw held open", () => {
    const tpb = ticksPerBeat(CFG);
    for (const role of ROLES) {
      const world = createWorld({ ...CFG }, 0, [], [{ beat: 0, col: 4, row: 4, kind: "pod" }]);
      const { ctx } = runFrames(world, role, tpb * 3, {
        onTick: (tick, w) => {
          if (tick % 30 === 0) w.intakeTick = w.tick;
        },
      });
      expect(ctx.calls).toBeGreaterThan(0);
    }
  });
});
