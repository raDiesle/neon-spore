import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { beatSeconds, type SimEvent } from "@neon-spore/sim";
import { computeLayout, tileCY } from "../src/layout.js";
import { ShotOutFx } from "../src/shot-out.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt out of the top row flies on to the top of the screen, and stops
 * there.** Two ways to get it wrong that no eye would name at once: a flight
 * that never ends is a dot parked above the field for the rest of the run, and
 * one that ends at row 0 is the bug this was written to fix (`shot-out.ts`).
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "p1");
const OUT: SimEvent = {
  type: "shotOut",
  col: 3,
  driftMilli: 0,
  atMilli: -80,
  color: "cyan",
  taken: false,
};

function drawCalls(fx: ShotOutFx): number {
  const { ctx } = stubCanvas();
  fx.draw(ctx as unknown as CanvasRenderingContext2D, L);
  return ctx.calls;
}

describe("a bolt carried on past the top row", () => {
  it("is drawn from the frame it leaves the field", () => {
    const fx = new ShotOutFx();
    fx.ingest([OUT], CFG, false);
    expect(drawCalls(fx)).toBeGreaterThan(0);
  });

  it("is still in the sky while there is sky above it, and gone once it is past the top", () => {
    // There is sky to fly through at all: the field stops short of the stage.
    expect(tileCY(L, 0)).toBeGreaterThan(L.tile);
    const fx = new ShotOutFx();
    fx.ingest([OUT], CFG, false);
    const rowsPerSecond = CFG.bulletTilesPerBeat / beatSeconds(CFG);
    // Half a tile's climb: past row 0, short of the top.
    fx.update(0.5 / rowsPerSecond, L);
    expect(drawCalls(fx)).toBeGreaterThan(0);
    // Every row of the stage's height and two more: gone.
    fx.update((L.height / L.tile + 2) / rowsPerSecond, L);
    expect(drawCalls(fx)).toBe(0);
  });

  it("is not carried when something above the field took it, nor on THE WELL", () => {
    const taken = new ShotOutFx();
    taken.ingest([{ ...OUT, taken: true }], CFG, false);
    expect(drawCalls(taken)).toBe(0);
    const well = new ShotOutFx();
    well.ingest([OUT], CFG, true);
    expect(drawCalls(well)).toBe(0);
  });
});
