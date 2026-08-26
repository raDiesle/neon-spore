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

/** The index of the wave carrying a boss of this kind. */
function waveWith(kind: "queen" | "mirror"): number {
  const index = WAVES.findIndex((w) => w.boss?.kind === kind);
  if (index === -1) throw new Error(`no wave carries the ${kind}`);
  return index;
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

  // By name, never by position: there is more than one boss wave now, and
  // `WAVES.length - 1` quietly became a different fight the day one was added.
  const index = waveWith("queen");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));

  const tpb = ticksPerBeat(CFG);
  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    step(world, []);
    if (world.events.length) events.push(...world.events);

    if (tick === tpb * 2) {
      if (world.boss?.kind === "queen") {
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

/**
 * THE MIRROR, over a whole round: it performs, the pair answers one step
 * right and the next one wrong, and both verdicts are drawn — the correct
 * one scars the mirror's own hull, the wrong one throws a rock at the ship's
 * and tips the entire frame upside down over itself.
 */
function mirrorFrames(role: ViewRole, ticks: number) {
  const world = createWorld(CFG, 5);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 900, height: 1600, dpr: 2 });

  const index = waveWith("mirror");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));

  const tpb = ticksPerBeat(CFG);
  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    const listening = world.boss?.kind === "mirror" && world.boss.phase === "listen";
    // One right, then one wrong: the first round is FIRE RED then SHIELD.
    if (listening && tick % tpb === 1) {
      step(world, [{ tick, player: 2, command: { kind: "fire", color: "red" } }]);
    } else if (listening && tick % tpb === 40) {
      step(world, [{ tick, player: 1, command: { kind: "intake" } }]);
    } else {
      step(world, []);
    }
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

describe("the mirror", () => {
  for (const role of ROLES) {
    it(`draws its ship, its sequence and both verdicts for ${role}`, () => {
      const { ctx, world } = mirrorFrames(role, ticksPerBeat(CFG) * 20);
      expect(ctx.calls).toBeGreaterThan(1000);
      // It really got as far as being judged, or the frames prove nothing
      // about the parts of the picture that only exist after a verdict.
      const boss = world.boss;
      expect(boss?.kind === "mirror" && boss.verdict !== 0).toBe(true);
    });
  }
});

describe("the queen", () => {
  for (const role of ROLES) {
    it(`draws every state for ${role} without the canvas refusing a value`, () => {
      const { ctx } = queenFrames(role, ticksPerBeat(CFG) * 12);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});

describe("the balance sheet", () => {
  /**
   * The screen after the run draws numbers no other frame does — a percentage
   * that can be null, bars whose width comes from a division, and a run that
   * ended before anything was asked of the pair. All three used to be
   * unreachable from here, because no frame in this file ever set `over`.
   */
  function overFrame(role: ViewRole, fill: (world: ReturnType<typeof createWorld>) => void) {
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    const { canvas, ctx } = stubCanvas();
    const renderer = new Canvas2DRenderer(canvas);
    renderer.resize({ width: 900, height: 1600, dpr: 2 });

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
        banner: null,
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
      banner: null,
    });
    expect(ctx.calls).toBeGreaterThan(20);
  });
});
