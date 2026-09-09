import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type PulseNote,
  type PulseState,
  pulseLaneIndex,
  pulseNoteTick,
  pulseVeiled,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { pulseLaneLight } from "../src/pulse-button.js";
import { drawArrivals } from "../src/pulse-fall.js";
import type { PulseField } from "../src/pulse-lane.js";
import type { ViewState } from "../src/renderer.js";
import { stubCanvas } from "./canvas-stub.js";
import { CFG, installCanvasGlobals, waveWith } from "./frame-harness.js";

/**
 * THE PULSE's picture runs ahead of the simulation by this device's own input
 * delay, and every part of it runs ahead by the same amount.
 *
 * Delayed lockstep schedules a press twelve ticks into the future, and this
 * round is the one thing in the game that cannot shrug that off: its clean
 * window is eight ticks, so on two devices a player pressing exactly on the
 * line was judged past PERFECT every time. Solo the delay is nought, which is
 * why nothing about it showed up in a test until this one.
 *
 * The property both halves are held to is the same sentence: **drawing at tick
 * T − lead with that lead is drawing at tick T with none.** It is checked on
 * the arrows as a picture, call for call, and on the four buttons as the
 * numbers they light by — an arrow on the line over a button still dark is the
 * failure this exists to catch.
 */

const LEAD = 12;
const SEAT = 1;

beforeAll(installCanvasGlobals);

/** A world with THE PULSE running and its chart under way. */
function playing(): { world: World; boss: PulseState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("pulse");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < 2000; i++) {
    step(world, []);
    const boss = world.boss;
    if (boss?.kind === "pulse" && boss.phase === "play" && boss.notes.length > 0) {
      return { world, boss };
    }
  }
  throw new Error("THE PULSE never reached its chart");
}

/** The first arrow this seat can read that is still a whole lead away. */
function comingUp(world: World, boss: PulseState): { note: PulseNote; due: number } {
  for (let i = boss.from1; i < boss.notes.length; i++) {
    const note = boss.notes[i];
    if (note === undefined || pulseVeiled(note, SEAT)) continue;
    const due = pulseNoteTick(CFG, boss.startTick, note);
    if (due - world.tick > LEAD) return { note, due };
  }
  throw new Error("no arrow far enough ahead to lead");
}

/** Four lanes on a flat hull. The clock is the subject, not the geometry. */
const FIELD: PulseField = {
  lanes: [0, 1, 2, 3].map((i) => ({ x: 80 + i * 70, w: 64, landY: 700 })),
  topY: 120,
  lineY: 700,
};

function viewAt(world: World, tick: number, leadTicks: number): ViewState {
  world.tick = tick;
  return {
    world,
    beatPhase: 0,
    role: "p1",
    time: 4,
    dt: 1 / 60,
    events: [],
    running: true,
    leadTicks,
  };
}

/**
 * Every call `drawArrivals` makes, in order, as one comparable picture.
 *
 * Drawn twice and only the second one kept: a body's shape is baked into a
 * `Path2D` the first time it is asked for and reused after, so the very first
 * picture of a run carries a `new Path2D` no later one does. That is a fact
 * about the cache and not about the clock, and comparing two pictures across
 * it would fail on it every time.
 */
function arrivalsAt(world: World, boss: PulseState, tick: number, lead: number): string[] {
  const { ctx } = stubCanvas();
  drawArrivals(
    ctx as unknown as CanvasRenderingContext2D,
    viewAt(world, tick, lead),
    boss,
    FIELD,
    SEAT,
  );
  const log: string[] = [];
  ctx.log = log;
  drawArrivals(
    ctx as unknown as CanvasRenderingContext2D,
    viewAt(world, tick, lead),
    boss,
    FIELD,
    SEAT,
  );
  ctx.log = undefined;
  return log;
}

describe("the chart is drawn ahead of the simulation by the input delay", () => {
  it("draws the arrows at T - lead exactly as it draws them at T with none", () => {
    const { world, boss } = playing();
    const { due } = comingUp(world, boss);
    const led = arrivalsAt(world, boss, due - LEAD, LEAD);
    const plain = arrivalsAt(world, boss, due, 0);
    expect(led.length).toBeGreaterThan(0);
    expect(led).toEqual(plain);
  });

  it("is a lead and not a no-op: the same tick unled draws something else", () => {
    const { world, boss } = playing();
    const { due } = comingUp(world, boss);
    expect(arrivalsAt(world, boss, due - LEAD, LEAD)).not.toEqual(
      arrivalsAt(world, boss, due - LEAD, 0),
    );
  });

  it("lights the button under an arrow on the line, on the frame it lands", () => {
    const { world, boss } = playing();
    const { note, due } = comingUp(world, boss);
    const lane = pulseLaneIndex(note.lane);
    world.tick = due - LEAD;
    const led = pulseLaneLight(boss, world, SEAT, LEAD);
    // Full: the body is resting in its socket on this seat's screen, so the
    // face under it is at its brightest and a thumb landing now is on time.
    expect(led[lane]).toBe(1);
    expect(pulseLaneLight(boss, world, SEAT, 0)[lane]).toBeLessThan(1);
  });

  it("lights the four buttons off the same clock the arrows fall on", () => {
    const { world, boss } = playing();
    const { due } = comingUp(world, boss);
    world.tick = due - LEAD;
    const led = pulseLaneLight(boss, world, SEAT, LEAD);
    world.tick = due;
    expect(led).toEqual(pulseLaneLight(boss, world, SEAT, 0));
  });
});
