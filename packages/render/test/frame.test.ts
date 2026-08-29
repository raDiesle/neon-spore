import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, WAVES, type Wave } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  gripsCreature,
  type SimEvent,
  type SpawnEntry,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  wardenCycle,
  wardenRescuer,
  wardenTether,
} from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import { creatureAt, creatureCenter } from "../src/creature-place.js";
import { drawRadar } from "../src/field.js";
import { gripLabel } from "../src/grip.js";
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
    });
    events = [];
  }
  return { world, ctx };
}

/** The index of the wave carrying a boss of this kind. */
function waveWith(kind: NonNullable<Wave["boss"]>["kind"]): number {
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
    });
    events = [];
  }
  return { world, ctx };
}

/**
 * A lobe filling, coming full and going out as a lance. The mark on the field,
 * the ring on the button and the shot in flight are the three things THE LANCE
 * adds to a frame, and none of them is reached by a run with no commands in it.
 */
function lanceFrames(
  role: ViewRole,
  ticks: number,
  viewport = { width: 900, height: 1600, dpr: 2 },
) {
  const queue: SpawnEntry[] = [
    { beat: 0, col: 3, kind: "slick", color: "red" },
    { beat: 1, col: 3, kind: "slick", color: "red" },
    { beat: 2, col: 3, kind: "slick", color: "red" },
  ];
  const world = createWorld(CFG, 5, queue);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize(viewport);

  const tpb = ticksPerBeat(CFG);
  const full = CFG.lancePrimeBeats * tpb;
  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    const inputs =
      tick === 0
        ? [{ tick, player: 1 as const, command: { kind: "cannonCol" as const, col: 3 } }]
        : tick === 1
          ? [{ tick, player: 1 as const, command: { kind: "prime" as const, on: true } }]
          : tick === full + 2
            ? [
                {
                  tick,
                  player: 2 as const,
                  command: { kind: "fire" as const, color: "red" as const },
                },
              ]
            : [];
    step(world, inputs);
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
    });
    events = [];
  }
  return { world, ctx };
}

describe("the lance", () => {
  for (const role of ROLES) {
    it(`draws the fill, the mark and the shot for ${role} without the canvas refusing a value`, () => {
      const { ctx } = lanceFrames(role, ticksPerBeat(CFG) * 8);
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  it("actually got as far as a lance in flight", () => {
    // Otherwise the three drawing tests above are a run with an empty lobe in
    // it, and would stay green if the lance never left.
    const { world } = lanceFrames("test", ticksPerBeat(CFG) * 4);
    expect(world.bullets.some((b) => b.lance)).toBe(true);
  });
});

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

/**
 * THE WARDEN over a whole cycle, driven rather than watched: the line has to
 * be *torn* for the pupil to open, and the two beats it stands open are the
 * only frames the core is ever drawn in. Left alone, this wave would never
 * draw the half of the boss that matters.
 */
function wardenFrames(role: ViewRole, ticks: number) {
  const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 900, height: 1600, dpr: 2 });

  const index = waveWith("warden");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));

  const tpb = ticksPerBeat(CFG);
  const all: SimEvent[] = [];
  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    // The rescuing player's hand goes on the line as soon as there is one, and
    // stays until it comes away — a held line, a torn one, the whip after it
    // and the open pupil are four separate pictures.
    const tether = wardenTether(world);
    const rescuer = wardenRescuer(wardenCycle(CFG, world.waveBeat));
    const commands: TimedCommand[] =
      tether && !gripsCreature(world, rescuer, tether.id)
        ? [{ tick: world.tick, player: rescuer, command: { kind: "grip", id: tether.id } }]
        : [];
    step(world, commands);
    if (world.events.length) events.push(...world.events);
    all.push(...world.events);

    if (tick % 4 !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % tpb) / tpb,
      role,
      time: tick / CFG.tickHz,
      dt: 4 / CFG.tickHz,
      events,
      running: true,
    });
    events = [];
  }
  return { world, ctx, events: all };
}

describe("the warden", () => {
  for (const role of ROLES) {
    it(`draws the ring, a held line and an open pupil for ${role}`, () => {
      const { ctx } = wardenFrames(role, ticksPerBeat(CFG) * (CFG.wardenCycleBeats + 2));
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really did tear a line and open the pupil, or the frames proved nothing", () => {
    // The state is no help here: the next cycle's attach puts `openBeat` back
    // to -1, so by the last frame there is nothing left to look at. What the
    // run reported is the record.
    const { events } = wardenFrames("test", ticksPerBeat(CFG) * (CFG.wardenCycleBeats + 2));
    expect(events.some((e) => e.type === "tetherTorn")).toBe(true);
    expect(events.some((e) => e.type === "eyeOpen")).toBe(true);
    expect(events.some((e) => e.type === "vent")).toBe(true);
  });
});

/**
 * THE VANE over a full cycle and a half: the arm at both ends of its travel,
 * mid-sweep in both directions, the housing split in both colours and shut, and
 * the flick it leaves when it throws an arrival. Its own wave carries the
 * arrivals, because a mechanism turning over an empty field draws none of them.
 */
function vaneFrames(role: ViewRole, ticks: number) {
  const world = createWorld(CFG, 3);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 900, height: 1600, dpr: 2 });

  const index = waveWith("vane");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));

  const tpb = ticksPerBeat(CFG);
  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    step(world, []);
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
    });
    events = [];
  }
  return { world, ctx };
}

describe("the vane", () => {
  for (const role of ROLES) {
    it(`draws the arm, the bearing and a split housing for ${role}`, () => {
      const { ctx } = vaneFrames(role, ticksPerBeat(CFG) * 18);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really threw something, or the flick was never drawn", () => {
    const { world } = vaneFrames("test", ticksPerBeat(CFG) * 18);
    const boss = world.boss;
    expect(boss?.kind === "vane" && boss.throwBeat !== -1).toBe(true);
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

/**
 * THE GRIP is the only thing drawn from world state rather than from events,
 * and it draws text, arcs and a beam that none of the frames above reach. One
 * hand, two hands and every role, so the whole picture goes past a canvas that
 * refuses what a real one refuses.
 */
function gripFrames(role: ViewRole, ticks: number) {
  const queue: SpawnEntry[] = [
    { beat: 0, col: 2, kind: "slick", color: "red" },
    { beat: 0, col: 6, kind: "torch", color: null },
  ];
  const world = createWorld(CFG, 5, queue);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 900, height: 1600, dpr: 2 });

  const tpb = ticksPerBeat(CFG);
  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    // Beat one has both creatures on the field: the slick is held by both
    // players at once, the torch by one.
    const grips =
      tick === tpb
        ? [
            { tick, player: 1 as const, command: { kind: "grip" as const, id: 1 } },
            { tick, player: 2 as const, command: { kind: "grip" as const, id: 2 } },
          ]
        : [];
    step(world, grips);
    if (tick === tpb * 3) {
      step(world, [{ tick, player: 2, command: { kind: "grip", id: 1 } }]);
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
    });
    events = [];
  }
  return { world, ctx };
}

describe("a grip", () => {
  for (const role of ROLES) {
    it(`draws one hand and two for ${role} without the canvas refusing a value`, () => {
      const { world, ctx } = gripFrames(role, ticksPerBeat(CFG) * 6);
      // It really was held while those frames were drawn.
      expect(world.gripP1 + world.gripP2).toBeGreaterThan(0);
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  it("names the hand from the screen it is on", () => {
    expect(gripLabel("p1", true, false)).toBe("YOU PULL");
    expect(gripLabel("p2", true, false)).toBe("P1 PULLS");
    expect(gripLabel("p2", false, true)).toBe("YOU PULL");
    expect(gripLabel("test", false, true)).toBe("P2 PULLS");
    expect(gripLabel("p1", true, true)).toBe("BOTH PULL");
  });
});

/**
 * The other half of the grip: a finger has to land on the creature the player
 * can see, which is the one `creatureCenter` draws — mid-glide, not where it
 * stood on the last beat. The two agreeing is the whole of the hit-test.
 */
describe("a finger on the field", () => {
  const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
  const world = createWorld(CFG, 4, [
    { beat: 0, col: 2, kind: "slick", color: "red" },
    { beat: 0, col: 8, kind: "torch", color: null },
  ]);
  step(world, []);
  for (let i = 0; i < ticksPerBeat(CFG) * 2; i++) step(world, []);

  it("finds what it is pointing at, mid-glide", () => {
    for (const c of world.creatures) {
      const at = creatureCenter(L, c, 0.5);
      expect(creatureAt(L, world.creatures, at.x, at.y, 0.5, CFG.wardenRow)?.id).toBe(c.id);
    }
  });

  it("finds nothing in empty sky", () => {
    const c = world.creatures[0];
    if (!c) throw new Error("the field is empty");
    const at = creatureCenter(L, c, 0.5);
    expect(creatureAt(L, world.creatures, at.x, at.y - L.tile * 3, 0.5, CFG.wardenRow)).toBeNull();
  });

  it("never offers the queen, who cannot be gripped", () => {
    const index = waveWith("queen");
    const boss = createWorld(CFG, 4, []);
    startWave(boss, index, [], [], buildBoss(index, CFG.cols));
    const queen = boss.creatures.find((c) => c.kind === "queen");
    if (!queen) throw new Error("no queen");
    const at = creatureCenter(L, queen, 0);
    expect(creatureAt(L, boss.creatures, at.x, at.y, 0, CFG.wardenRow)).toBeNull();
  });
});
