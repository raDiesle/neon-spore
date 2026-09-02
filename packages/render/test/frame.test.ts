import { beforeAll, describe, expect, it } from "bun:test";
import {
  buildBoss,
  buildQueue,
  CONTROL_SETS,
  controlSetForWave,
  WAVES,
  type Wave,
} from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  NO_TETHER,
  type SimEvent,
  type SpawnEntry,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  wardenColor,
  wardenCycle,
  wardenEyeOpen,
} from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import { commsCall } from "../src/comms.js";
import { creatureAt, creatureCenter } from "../src/creature-place.js";
import { drawRadar } from "../src/field.js";
import { gripLabel } from "../src/grip.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawShieldFlashes } from "../src/shield-flash.js";
import { drawShieldSparks, resonantLook, SHIELD_SPARK_LOOK } from "../src/shield-spark.js";
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

describe("the guard lapsing", () => {
  for (const role of ROLES) {
    it(`draws armed, lapsing and idle-again for ${role} without the canvas refusing a value`, () => {
      const world = createWorld(CFG, 11, buildQueue(0, CFG.cols));
      const { canvas, ctx } = stubCanvas();
      const renderer = new Canvas2DRenderer(canvas);
      renderer.resize({ width: 900, height: 1600, dpr: 2 });
      const tpb = ticksPerBeat(CFG);
      // One press and nothing after it: no rock ever reaches the shield's
      // column, so the window has to close unarmed rather than on a deflect.
      // That is the exact case the fading guard button exists for, and the
      // run is long enough to pass through armed, the fade, and back to idle.
      const ticks = Math.round((CFG.guardWindowMs / 1000) * CFG.tickHz) + 60;
      let events: SimEvent[] = [];
      for (let tick = 0; tick < ticks; tick++) {
        step(world, tick === 5 ? [{ tick, player: 1, command: { kind: "guard" } }] : []);
        if (world.events.length) events.push(...world.events);
        renderer.draw({
          world,
          beatPhase: (world.tick % tpb) / tpb,
          role,
          time: tick / CFG.tickHz,
          dt: 1 / CFG.tickHz,
          events,
          running: true,
        });
        events = [];
      }
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

  /**
   * A lure arrives on player 2's strip carrying the exclamation and its name;
   * on player 1's it carries nothing, because player 1's strip carries `guard`
   * kinds only. That is the same rule the test above checks for a slick — the
   * point here is that the alarm rides on it rather than around it.
   */
  it("marks a lure on p2's strip and leaves p1's as blank as a slick's", () => {
    const queue: SpawnEntry[] = [{ beat: 2, col: 3, kind: "lure", color: "cyan", wears: "bulb" }];
    const world = createWorld(CFG, 1, queue);
    const layout = (role: ViewRole) =>
      computeLayout({ width: 900, height: 1600, dpr: 1 }, CFG, role);

    const p1 = stubCanvas();
    drawRadar(p1.ctx as unknown as CanvasRenderingContext2D, layout("p1"), world);
    expect(p1.ctx.calls).toBe(0);

    // More than the plain blip a real bulb draws: the glyph and the word.
    const bulb = stubCanvas();
    const bulbWorld = createWorld(CFG, 1, [{ beat: 2, col: 3, kind: "bulb", color: "cyan" }]);
    drawRadar(bulb.ctx as unknown as CanvasRenderingContext2D, layout("p2"), bulbWorld);
    const lure = stubCanvas();
    drawRadar(lure.ctx as unknown as CanvasRenderingContext2D, layout("p2"), world);
    expect(lure.ctx.calls).toBeGreaterThan(bulb.ctx.calls);
  });
});

/**
 * THE LURE, drawn: the body player 1 sees, the alarm player 2 sees over it,
 * and the fold both of them see when it goes.
 *
 * Nothing here can answer whether the disguise *reads* — that is the check
 * this lane owes and it needs two phones. What it can hold is the shape of the
 * arrangement: that the alarm is drawn on one seat and not the other, that
 * neither seat's frame throws, and that a lure at either edge of the field
 * still puts its label somewhere the canvas will accept.
 */
function lureFrames(role: ViewRole, col: number, ticks: number) {
  const queue: SpawnEntry[] = [{ beat: 0, col, kind: "lure", color: "cyan", wears: "bulb" }];
  const world = createWorld(CFG, 1, queue);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 900, height: 1600, dpr: 2 });

  const tpb = ticksPerBeat(CFG);
  let events: SimEvent[] = [];
  let vanished = 0;
  for (let tick = 0; tick < ticks; tick++) {
    step(world, []);
    if (world.events.length) events.push(...world.events);
    vanished += world.events.filter((e) => e.type === "lureVanished").length;
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
  return { ctx, vanished };
}

describe("the lure", () => {
  // Far enough to carry it past the row it goes on, so every frame this
  // creature ever produces — body, alarm and fold — has been through the
  // canvas that refuses what a real one refuses.
  const TICKS = ticksPerBeat(CFG) * 20;

  for (const role of ROLES) {
    it(`draws the body, its alarm and its fold for ${role}`, () => {
      const { ctx, vanished } = lureFrames(role, 3, TICKS);
      expect(vanished).toBe(1);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("puts the alarm on player 2's screen and nothing extra on player 1's", () => {
    // Same world, same ticks, same body — the ring, the exclamation and the
    // label are the entire difference between the two frames.
    const p1 = lureFrames("p1", 3, TICKS);
    const p2 = lureFrames("p2", 3, TICKS);
    expect(p2.ctx.calls).toBeGreaterThan(p1.ctx.calls);
  });

  it("keeps its label on screen in the first column and the last", () => {
    for (const col of [0, CFG.cols - 1]) {
      expect(() => lureFrames("p2", col, TICKS)).not.toThrow();
    }
  });
});

/**
 * THE DART, drawn: the lean and the jet both seats see, and the arrow only
 * player 2 does.
 *
 * Nothing here can answer whether the lean *reads* as a body about to move —
 * that is the check this lane owes and it needs an eye. What it can hold is
 * the shape of the arrangement: that a body which changes column mid-beat
 * never hands the canvas a coordinate it refuses, that the arrow is drawn on
 * one seat and not the other, and that a dart standing against either edge of
 * the field still puts its mark somewhere a canvas will take.
 */
function dartFrames(role: ViewRole, col: number, ticks: number) {
  const queue: SpawnEntry[] = [{ beat: 0, col, kind: "dart", color: "red" }];
  const world = createWorld(CFG, 1, queue);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 900, height: 1600, dpr: 2 });

  const tpb = ticksPerBeat(CFG);
  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    step(world, []);
    if (world.events.length) events.push(...world.events);
    // Every second tick rather than every fourth: the whole of this creature
    // happens *between* beats — the jet is hottest in the first fraction of a
    // run and gone by the end of it — so a sampling that only caught beat
    // boundaries would never draw a plume at all.
    if (tick % 2 !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % tpb) / tpb,
      role,
      time: tick / CFG.tickHz,
      dt: 2 / CFG.tickHz,
      events,
      running: true,
    });
    events = [];
  }
  return { ctx };
}

describe("the dart", () => {
  // Past the hull, so every frame this creature produces — the hang, the run,
  // the jet, the arrow and the breach at the end — has been through a canvas
  // that refuses what a real one refuses.
  const TICKS = ticksPerBeat(CFG) * 20;

  for (const role of ROLES) {
    it(`draws the body, its jet and its diagonal for ${role}`, () => {
      const { ctx } = dartFrames(role, 3, TICKS);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("puts the arrow on player 2's screen and nothing extra on player 1's", () => {
    // Same world, same ticks, same body: the arrow is the entire difference
    // between the two frames, which is the whole creature.
    const p1 = dartFrames("p1", 3, TICKS);
    const p2 = dartFrames("p2", 3, TICKS);
    expect(p2.ctx.calls).toBeGreaterThan(p1.ctx.calls);
  });

  it("keeps its arrow on the canvas in the first column and the last", () => {
    for (const col of [0, CFG.cols - 1]) {
      expect(() => dartFrames("p2", col, TICKS)).not.toThrow();
    }
  });

  it("announces a dart to player 1's strip and never to player 2's", () => {
    // The clasp's rule with a second body under it: the seat shown where it
    // is going is not the seat that can shoot it.
    const queue: SpawnEntry[] = [{ beat: 2, col: 3, kind: "dart", color: "cyan" }];
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
 * THE WARDEN over a whole cycle, driven rather than watched: the rope has to be
 * *pulled taut* before the hatch opens at all, and the eye behind it is drawn
 * only while it is. Left alone, this wave would show a shut door for a minute
 * and never draw the half of the boss that matters.
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
    // Player 1 grabs the handle the moment a rope is there and hauls it all the
    // way over; player 2 fires into the pupil as soon as the hatch is open. A
    // slack rope, a taut one, an open eye and the snap-back after a hit are
    // four separate pictures and none of them happens on its own.
    const b = world.boss?.kind === "warden" ? world.boss : null;
    const commands: TimedCommand[] = [];
    if (b && b.tetherId !== NO_TETHER) {
      commands.push({
        tick: world.tick,
        player: 1,
        command: {
          kind: "drag",
          target: "wardenTether",
          on: true,
          fromMilli: b.pulling ? CFG.wardenTautMilli : 0,
        },
      });
      if (wardenEyeOpen(world, b)) {
        commands.push({
          tick: world.tick,
          player: 1,
          command: { kind: "cannonCol", col: b.pupilCol },
        });
        commands.push({
          tick: world.tick,
          player: 2,
          command: { kind: "fire", color: wardenColor(wardenCycle(CFG, world.waveBeat)) },
        });
      }
    }
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
    it(`draws the ring, a pulled rope and an open eye for ${role}`, () => {
      const { ctx } = wardenFrames(role, ticksPerBeat(CFG) * (CFG.wardenCycleBeats + 2));
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really did open the hatch and land a shot, or the frames proved nothing", () => {
    // The state is no help here: a landed shot cuts the rope in the same tick,
    // so by the last frame there is nothing left to look at. What the run
    // reported is the record.
    const { events } = wardenFrames("test", ticksPerBeat(CFG) * (CFG.wardenCycleBeats + 2));
    expect(events.some((e) => e.type === "tether")).toBe(true);
    expect(events.some((e) => e.type === "eyeOpen")).toBe(true);
    expect(events.some((e) => e.type === "plate")).toBe(true);
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
      expect(creatureAt(L, world.creatures, at.x, at.y, 0.5)?.id).toBe(c.id);
    }
  });

  it("finds nothing in empty sky", () => {
    const c = world.creatures[0];
    if (!c) throw new Error("the field is empty");
    const at = creatureCenter(L, c, 0.5);
    expect(creatureAt(L, world.creatures, at.x, at.y - L.tile * 3, 0.5)).toBeNull();
  });

  it("never offers the queen, who cannot be gripped", () => {
    const index = waveWith("queen");
    const boss = createWorld(CFG, 4, []);
    startWave(boss, index, [], [], buildBoss(index, CFG.cols));
    const queen = boss.creatures.find((c) => c.kind === "queen");
    if (!queen) throw new Error("no queen");
    const at = creatureCenter(L, queen, 0);
    expect(creatureAt(L, boss.creatures, at.x, at.y, 0)).toBeNull();
  });
});

/**
 * THE PANEL DRAWN IS THE ONE THE CALLER NAMES, NOT THE ONE `world.wave` HAPPENS
 * TO INDEX IN THE SHIPPED `WAVES`.
 *
 * `world.wave` means two different things depending on who holds the world:
 * for the shipped game it indexes `WAVES`, and the two were built to agree.
 * The director plays a draft at the same index and they do not — which is why
 * `ViewState.controls` exists at all. This is the proof: a world at wave 0,
 * whose shipped wave is not on the lance panel, is drawn with the lance panel
 * the moment `controls` says so, and drawn without it the moment `controls`
 * is left unset — the same object, the same `world.wave`, two different frames.
 */
describe("the band draws the panel it is handed", () => {
  const lance = CONTROL_SETS.find((s) => s.id === "lance");
  if (!lance) throw new Error("no lance set registered");

  function drawnNames(world: ReturnType<typeof createWorld>, controls?: typeof lance) {
    const { canvas, ctx } = stubCanvas();
    const renderer = new Canvas2DRenderer(canvas);
    renderer.resize({ width: 900, height: 1600, dpr: 2 });
    const seen: string[] = [];
    const original = ctx.fillText.bind(ctx);
    ctx.fillText = (text: string, x: number, y: number) => {
      seen.push(text);
      original(text, x, y);
    };
    renderer.draw({
      world,
      beatPhase: 0,
      role: "test",
      time: 0,
      dt: 1 / 60,
      events: [],
      running: true,
      controls,
    });
    return seen;
  }

  it("follows an explicit override rather than the shipped wave at the same index", () => {
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    // world.wave is 0, and the shipped wave there is not the lance panel —
    // proof that a match below cannot be `controlSetForWave` agreeing by luck.
    expect(controlSetForWave(world.wave).id).not.toBe(lance.id);

    expect(drawnNames(world)).not.toContain(lance.name);
    expect(drawnNames(world, lance)).toContain(lance.name);
  });
});

/**
 * The shield's ambient arcs ship now — the owner asked for them back by name,
 * so `SHIELD_SPARK_LOOK.perSecond` is no longer 0 and the record's old proof
 * ("makes no canvas call at all") has nothing left to prove.
 *
 * What replaces it is the pair of properties that actually matter about an
 * effect that is on the screen for the whole game, and neither is safe to
 * leave to the next reader's eye: it draws *something* at the shipped record,
 * and it is off far more often than on. An arc that crackles continuously is a
 * texture on the rim rather than a shield under load, and that failure is
 * invisible in a still.
 */
describe("the shield's ambient arcs (shield-spark.ts)", () => {
  const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
  const cols = [3, 3.4, 3.8, 4.1];
  const surface = (x: number) => ({ x, y: L.hullY });

  it("draws at the shipped record — the shield is never a dark rim", () => {
    const { ctx } = stubCanvas();
    for (let t = 0; t < 40; t += 0.1) {
      drawShieldSparks(ctx as unknown as CanvasRenderingContext2D, L, t, cols, surface);
    }
    expect(ctx.calls).toBeGreaterThan(0);
  });

  it("fires only a few, briefly — not a steady crackle", () => {
    const dt = 1 / 60;
    const duration = 20;
    let framesLit = 0;
    let total = 0;
    for (let t = 0; t < duration; t += dt) {
      const { ctx } = stubCanvas();
      drawShieldSparks(ctx as unknown as CanvasRenderingContext2D, L, t, cols, surface);
      total++;
      if (ctx.calls > 0) framesLit++;
    }
    const share = framesLit / total;
    // "A few small ones, irregularly", the owner's ask — on often enough to
    // notice, off far more often than on.
    expect(share).toBeGreaterThan(0.02);
    expect(share).toBeLessThan(0.35);
  });

  it("reaches much further while a clasp is answering in the column", () => {
    // The resonance the owner asked for, as the one number that carries it:
    // the arcs grow rather than a second effect arriving.
    expect(resonantLook(SHIELD_SPARK_LOOK, 1).reachMul).toBeGreaterThan(
      SHIELD_SPARK_LOOK.reachMul * 3,
    );
    expect(resonantLook(SHIELD_SPARK_LOOK, 0).reachMul).toBe(SHIELD_SPARK_LOOK.reachMul);
  });
});

/**
 * `shield-flash.ts` is the same kind of lift as `shield-spark.ts`: a soft
 * patch of light beside `shield-spark.ts`'s jagged arc, both saying the
 * shield is charged. Shipped, not offered — `SHIELD_FLASH_LOOK` carries its
 * real, non-zero defaults, so the first test pins that the shipped record
 * actually draws something, and the second pins "a few, briefly" as a number
 * rather than leaving it to a reader's eye.
 */
describe("the shield's ambient flashes (shield-flash.ts)", () => {
  const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
  const from = 200;
  const to = 500;
  const surface = (x: number) => ({ x, y: L.hullY });

  it("draws nothing when the rim has no span", () => {
    const { ctx } = stubCanvas();
    for (let t = 0; t < 40; t += 0.1) {
      drawShieldFlashes(ctx as unknown as CanvasRenderingContext2D, L, t, from, from, surface);
    }
    expect(ctx.calls).toBe(0);
  });

  it("pops up only a little, at the shipped record — not a steady glow", () => {
    const dt = 1 / 60;
    const duration = 20;
    let framesLit = 0;
    let total = 0;
    for (let t = 0; t < duration; t += dt) {
      const { ctx } = stubCanvas();
      drawShieldFlashes(ctx as unknown as CanvasRenderingContext2D, L, t, from, to, surface);
      total++;
      if (ctx.calls > 0) framesLit++;
    }
    const share = framesLit / total;
    // "A few random places, in random timings" — on often enough to notice,
    // off far more often than on, at most four flashes overlapping.
    expect(share).toBeGreaterThan(0.02);
    expect(share).toBeLessThan(0.6);
  });
});

/**
 * THE VEIL, drawn: the cloud both seats see, the body and the morph clock only
 * player 1 does, and the two seconds of red a wrong colour buys.
 *
 * Nothing here can answer whether the cloud *reads* as weather, whether the
 * rim bolts land hard enough to count beats by, or whether the switch mark is
 * legible at eleven pixels. Those are the checks this lane owes and they need
 * an eye. What it holds is that every one of those states has actually been
 * through a canvas that refuses what a real one refuses — including the two
 * the old test never reached, because a run with no commands in it never
 * shuts a cloud and never tears one open.
 */
function veilFrames(role: ViewRole, ticks: number) {
  const queue: SpawnEntry[] = [{ beat: 0, col: 3, kind: "veil", color: null }];
  const world = createWorld(CFG, 1, queue);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 900, height: 1600, dpr: 2 });

  const tpb = ticksPerBeat(CFG);
  let events: SimEvent[] = [];
  let morphs = 0;
  let rebuffs = 0;
  let torn = 0;
  for (let tick = 0; tick < ticks; tick++) {
    const veil = world.creatures.find((c) => c.kind === "veil");
    const inputs: TimedCommand[] = [];
    if (tick === 1) inputs.push({ tick, player: 1, command: { kind: "cannonCol", col: 3 } });
    // The wrong colour first — that is the whole mistake this creature
    // punishes, and the red cloud is a picture nothing else in the game draws.
    if (tick === tpb * 2 && veil?.color) {
      inputs.push({
        tick,
        player: 2,
        command: { kind: "fire", color: veil.color === "red" ? "cyan" : "red" },
      });
    }
    // And then the right one, long after the armour has run out, so the tear
    // and the burst are drawn too.
    if (tick === tpb * 9 && veil?.color) {
      inputs.push({ tick, player: 2, command: { kind: "fire", color: veil.color } });
    }
    step(world, inputs);
    if (world.events.length) events.push(...world.events);
    morphs += world.events.filter((e) => e.type === "veilMorph").length;
    rebuffs += world.events.filter((e) => e.type === "veilRebuff").length;
    torn += world.events.filter((e) => e.type === "veilTorn").length;
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
  return { ctx, morphs, rebuffs, torn };
}

describe("the veil", () => {
  const TICKS = ticksPerBeat(CFG) * 12;

  for (const role of ROLES) {
    it(`draws the cloud, its clock and its lightning for ${role}`, () => {
      const { ctx } = veilFrames(role, TICKS);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really morphed, was rebuffed and was torn, or the frames proved nothing", () => {
    // Without all three the run drew one open cloud for twelve beats: the
    // switch mark never changed colour, the red never happened, and the tear
    // was never drawn. Asserted on `test`, which carries both seats' marks.
    const { morphs, rebuffs, torn } = veilFrames("test", TICKS);
    expect(morphs).toBeGreaterThan(0);
    expect(rebuffs).toBe(1);
    expect(torn).toBe(1);
  });

  it("puts the clock on player 1's screen and the question mark on player 2's", () => {
    // Player 1 draws the body inside the cloud as well as a ring with a switch
    // mark in it; player 2 draws a hook and a dot over weather. The gap is the
    // creature.
    const p1 = veilFrames("p1", TICKS);
    const p2 = veilFrames("p2", TICKS);
    expect(p1.ctx.calls).toBeGreaterThan(p2.ctx.calls);
  });
});

describe("the siren", () => {
  const TICKS = ticksPerBeat(CFG) * 6;

  function callAfter(queue: SpawnEntry[], ticks: number) {
    const world = createWorld(CFG, 1, queue);
    for (let tick = 0; tick < ticks; tick++) step(world, []);
    return commsCall(world);
  }

  it("says nothing while the field holds only bodies both of them can see", () => {
    expect(callAfter([{ beat: 0, col: 3, kind: "bulb", color: "cyan" }], TICKS)).toBeNull();
  });

  it("puts the pilot on the mouth for a veil and the navigator on the ear", () => {
    const call = callAfter([{ beat: 0, col: 3, kind: "veil", color: null }], TICKS);
    expect(call).toEqual({ p1: true, p2: false });
  });

  it("turns it round for a lure", () => {
    const call = callAfter(
      [{ beat: 0, col: 3, kind: "lure", color: "cyan", wears: "bulb" }],
      TICKS,
    );
    expect(call).toEqual({ p1: false, p2: true });
  });

  it("has both of them talking when both are holding half a picture", () => {
    const call = callAfter(
      [
        { beat: 0, col: 1, kind: "veil", color: null },
        { beat: 0, col: 5, kind: "lure", color: "red", wears: "slick" },
      ],
      TICKS,
    );
    expect(call).toEqual({ p1: true, p2: true });
  });

  it("lights for a torch while it is still on the strip, and not for a meteor at all", () => {
    // The one kind whose call starts before it arrives — it is the fastest
    // thing in the game, so a warning that begins on impact begins too late.
    // The rocks beside it are deliberately not on the roster: one is in nearly
    // every wave, and a siren lit all wave is a lamp.
    expect(callAfter([{ beat: 4, col: 1, kind: "torch", color: null }], 1)).toEqual({
      p1: true,
      p2: false,
    });
    expect(callAfter([{ beat: 4, col: 1, kind: "meteor", color: null }], 1)).toBeNull();
  });

  it("draws over a frame without the canvas refusing a value", () => {
    for (const role of ROLES) {
      const world = createWorld(CFG, 1, [{ beat: 0, col: 3, kind: "veil", color: null }]);
      const { canvas, ctx } = stubCanvas();
      const renderer = new Canvas2DRenderer(canvas);
      renderer.resize({ width: 900, height: 1600, dpr: 2 });
      const tpb = ticksPerBeat(CFG);
      for (let tick = 0; tick < TICKS; tick++) {
        step(world, []);
        if (tick % 4 !== 0) continue;
        renderer.draw({
          world,
          beatPhase: (world.tick % tpb) / tpb,
          role,
          time: tick / CFG.tickHz,
          dt: 4 / CFG.tickHz,
          events: [],
          running: true,
        });
      }
      expect(ctx.calls).toBeGreaterThan(0);
    }
  });
});
