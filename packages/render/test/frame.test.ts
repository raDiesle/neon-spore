import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  type SpawnEntry,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import { drawRadar } from "../src/field.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
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

function torchFrames(
  role: ViewRole,
  ticks: number,
  viewport = { width: 900, height: 1600, dpr: 2 },
) {
  const queue: SpawnEntry[] = [
    { beat: 0, col: 1, kind: "torch", color: null },
    { beat: 6, col: 5, kind: "torch", color: null },
  ];
  const world = createWorld(CFG, 3, queue);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize(viewport);

  const tpb = ticksPerBeat(CFG);
  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    // Shield never in column: every torch reaches the hull and deflects
    // nothing, so both the miss (span scars, single breach) and the deflect
    // path get exercised across the two queued torches and every role.
    step(world, tick === 1 ? [{ tick, player: 2, command: { kind: "shieldCol", col: 5 } }] : []);
    if (tick % tpb === 1) step(world, [{ tick, player: 1, command: { kind: "guard" } }]);
    if (world.events.length) events.push(...world.events);
    if (tick % 4 !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % tpb) / tpb,
      role,
      time: tick / CFG.tickHz,
      dt: 4 / CFG.tickHz,
      events,
      running: true,
      banner: null,
    });
    events = [];
  }
  return { world, ctx };
}

describe("the torch", () => {
  for (const role of ROLES) {
    it(`draws in flight and the alarm for ${role} without the canvas refusing a value`, () => {
      const { ctx } = torchFrames(role, ticksPerBeat(CFG) * 10);
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }
});

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

describe("the radar", () => {
  /**
   * Radar ownership crosses the controls: p1 reads rocks, p2 reads the living.
   * A single queued rock must draw on p1's strip and nowhere on p2's.
   */
  it("shows a rock's arrival to p1 only, never to p2", () => {
    const queue: SpawnEntry[] = [{ beat: 2, col: 3, kind: "meteor", color: null }];
    const world = createWorld(CFG, 1, queue);
    const layout = (role: ViewRole) =>
      computeLayout({ width: 900, height: 1600, dpr: 1 }, CFG, role);

    const p1 = stubCanvas();
    drawRadar(p1.ctx as unknown as CanvasRenderingContext2D, layout("p1"), world);
    const p2 = stubCanvas();
    drawRadar(p2.ctx as unknown as CanvasRenderingContext2D, layout("p2"), world);

    expect(p1.ctx.calls).toBeGreaterThan(0);
    expect(p2.ctx.calls).toBe(0);
  });

  it("shows a living arrival to p2 only, never to p1", () => {
    const queue: SpawnEntry[] = [{ beat: 2, col: 3, kind: "slick", color: "red" }];
    const world = createWorld(CFG, 1, queue);
    const layout = (role: ViewRole) =>
      computeLayout({ width: 900, height: 1600, dpr: 1 }, CFG, role);

    const p1 = stubCanvas();
    drawRadar(p1.ctx as unknown as CanvasRenderingContext2D, layout("p1"), world);
    const p2 = stubCanvas();
    drawRadar(p2.ctx as unknown as CanvasRenderingContext2D, layout("p2"), world);

    expect(p1.ctx.calls).toBe(0);
    expect(p2.ctx.calls).toBeGreaterThan(0);
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
