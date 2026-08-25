import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import type { ViewRole } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * Draw the game and see whether the canvas objects. This is the check that was
 * missing when a colour went out as `rgb(...)` where a `#rrggbb` was required:
 * every type was right, every test was green, and the first frame threw.
 *
 * It asserts nothing about how the game looks — that is what
 * `tools/shape-sheet` is for. It asserts only that every value handed to the
 * canvas is one a canvas accepts, over enough frames that the moving parts
 * (the film drift, the sweep, a wave arriving, a hit, the end of a run) have
 * all been through it.
 */

const CFG = DEFAULT_CONFIG;
const ROLES: ViewRole[] = ["p1", "p2", "test"];

beforeAll(installCanvasGlobals);

function frames(role: ViewRole, ticks: number, viewport = { width: 900, height: 1600, dpr: 2 }) {
  const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize(viewport);

  const tpb = ticksPerBeat(CFG);
  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    step(world, []);
    if (world.events.length) events.push(...world.events);
    // Every fourth tick is a frame, which is about what 60 Hz gives at 120 Hz.
    if (tick % 4 !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % tpb) / tpb,
      role,
      time: tick / CFG.tickHz,
      dt: 4 / CFG.tickHz,
      events,
      running: true,
      banner: tick < 60 ? { title: "Wave", hint: "hint", remaining: 1.2 } : null,
    });
    events = [];
  }
  return { world, ctx };
}

function queenFrames(
  role: ViewRole,
  ticks: number,
  viewport = { width: 900, height: 1600, dpr: 2 },
) {
  const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize(viewport);

  const index = WAVES.length - 1;
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));

  const tpb = ticksPerBeat(CFG);
  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    step(world, []);
    if (world.events.length) events.push(...world.events);

    if (tick === tpb * 2) {
      if (world.boss) {
        world.boss.tellColor = "red";
        world.boss.openBeat = world.beat + 2;
      }
    }
    if (tick === tpb * 6) {
      const queen = world.creatures.find((c) => c.kind === "queen");
      if (queen) queen.color = "red";
    }
    if (tick === tpb * 10) {
      const queen = world.creatures.find((c) => c.kind === "queen");
      if (queen) queen.petals = 0;
    }

    if (tick % 4 !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % tpb) / tpb,
      role,
      time: tick / CFG.tickHz,
      dt: 4 / CFG.tickHz,
      events,
      running: true,
      banner: tick < 60 ? { title: "Wave", hint: "hint", remaining: 1.2 } : null,
    });
    events = [];
  }
  return { world, ctx };
}

describe("a frame", () => {
  for (const role of ROLES) {
    it(`draws a wave for ${role} without the canvas refusing a value`, () => {
      // Long enough for the first creatures to reach the hull and damage it.
      const { ctx } = frames(role, ticksPerBeat(CFG) * 18);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("survives a viewport nobody designed for", () => {
    // A hidden tab reports zero, a desktop window is far wider than a phone,
    // and both used to reach the canvas as a negative radius.
    for (const viewport of [
      { width: 0, height: 0, dpr: 1 },
      { width: 3840, height: 400, dpr: 1 },
      { width: 320, height: 480, dpr: 3 },
    ]) {
      expect(() => frames("test", 8, viewport)).not.toThrow();
    }
  });
});

describe("the queen", () => {
  for (const role of ROLES) {
    it(`draws every state for ${role} without the canvas refusing a value`, () => {
      const { ctx } = queenFrames(role, ticksPerBeat(CFG) * 12);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});
