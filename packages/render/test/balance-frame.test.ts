import { beforeAll, describe, expect, it } from "bun:test";
import { buildQueue } from "@neon-spore/content";
import { createWorld, step, ticksPerBeat } from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, stubCanvas, VIEWPORT } from "./frame-harness.js";

/**
 * The screen after the run draws numbers no other frame does — a percentage
 * that can be null, bars whose width comes from a division, and a run that
 * ended before anything was asked of the pair. All three used to be
 * unreachable, because no frame in this package ever set `over`.
 */

beforeAll(installCanvasGlobals);

describe("the balance sheet", () => {
  function overFrame(role: ViewRole, fill: (world: ReturnType<typeof createWorld>) => void) {
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    const { canvas, ctx } = stubCanvas();
    const renderer = new Canvas2DRenderer(canvas);
    renderer.resize(VIEWPORT);

    for (let tick = 0; tick < ticksPerBeat(CFG) * 4; tick++) step(world, []);
    fill(world);
    world.over = true;

    for (let frame = 0; frame < 4; frame++) {
      renderer.draw({
        world,
        beatPhase: 0,
        role,
        time: frame / 15,
        dt: 1 / 15,
        events: [],
        running: true,
      });
    }
    return ctx;
  }

  for (const role of ROLES) {
    it(`draws a run worth talking about for ${role}`, () => {
      const ctx = overFrame(role, (world) => {
        world.guard.tries = 9;
        world.guard.deflected = 6;
        world.guard.mistimed = 2;
        world.balance.podsFreed = 4;
        world.balance.podsTaken = 3;
        world.balance.podsLost = 1;
        world.balance.colorHits = 14;
        world.balance.colorMisses = 3;
        world.balance.bestStreak = 11;
        world.balance.wavesCleared = 3;
      });
      expect(ctx.calls).toBeGreaterThan(50);
    });
  }

  it("draws a run that asked nothing of the pair", () => {
    // Every tally empty: the sync value is null and every bar is a dash.
    expect(() => overFrame("test", () => {})).not.toThrow();
  });

  it("fits a viewport narrower than the sheet's own column", () => {
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    const { canvas, ctx } = stubCanvas();
    const renderer = new Canvas2DRenderer(canvas);
    renderer.resize({ width: 240, height: 420, dpr: 1 });
    world.over = true;
    renderer.draw({
      world,
      beatPhase: 0,
      role: "test",
      time: 0,
      dt: 1 / 60,
      events: [],
      running: true,
    });
    expect(ctx.calls).toBeGreaterThan(20);
  });
});
