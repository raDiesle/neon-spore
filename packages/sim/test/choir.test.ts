import { describe, expect, it } from "bun:test";
import { choirIsDots, choirIsFusing } from "../src/choir.js";
import { CHOIR_RUBBED, CHOIR_SHAKEN, choirArmed } from "../src/choir-gesture.js";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import type { Color, Creature, TimedCommand } from "../src/types.js";
import { failHolds } from "../src/wave-fail.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE CHOIR, and the two things about it that are new to this simulation.
 *
 * The first is THE CLASP's: a body that stops being the kind it was born. That
 * one is covered next door and the shape is the same here, so what is tested
 * below is the half that is *not* the same — the gesture. It is the first
 * answer in this game made of two commands that have to arrive in the right
 * order inside a window, on a body standing in a lane no hand is near.
 *
 * The gesture is **a shake and then a shake**, the pilot's, or **a rub both
 * seats make together** on the mark in the middle (`choir-rub.ts`): a turn
 * counts only while the other seat is rubbing too.
 *
 * The second is what a **half-made** gesture costs. Every other creature
 * answers a mistake by simply not dying; this one takes the hull, on the
 * owner's own instruction: the window running out with the gesture begun.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/**
 * The first tick a hand can reach a membrane authored at beat 0.
 *
 * A wave's arrivals are put on the field by `onBeat`, which runs on the tick
 * the beat turns over — so for the whole of beat zero there is nothing to
 * merge, and a gesture made then costs nothing and does nothing
 * (`choirOnField`). Every run below starts from here rather than from tick
 * two, which is what a first draft of this file did and why it read as the
 * gesture being ignored.
 */
const ON_FIELD = TPB + 2;

const choir = (col: number, color: Color): SpawnEntry => ({ beat: 0, col, kind: "choir", color });

/** Ticks between one seat's turns: a quick scrub. */
const TURN = 20;

/** One seat's thumb on the rub from `tick`, turning back `turns` times, then lifted.
 * The press says nought first, the way a real thumb's does (`render/rub-turns.ts`). */
const rubBy = (player: 1 | 2, tick: number, turns: number): TimedCommand[] => {
  const say = (at: number, on: boolean, id: number): TimedCommand => ({
    tick: at,
    player,
    command: { kind: "drag", target: "choirRub", on, fromMilli: 0, id },
  });
  const out = [say(tick, true, 0)];
  for (let i = 1; i <= turns; i++) out.push(say(tick + i * TURN, true, i));
  out.push(say(tick + (turns + 1) * TURN, false, turns));
  return out;
};

/** Both seats rubbing at once. */
const rub = (tick: number, turns: number): TimedCommand[] => [
  ...rubBy(1, tick, turns),
  ...rubBy(2, tick, turns),
];
/** Enough turns each that the pair has made `choirRubTurns` together. */
const ENOUGH = CFG.choirRubTurns;
/** The tick the last of those lands by. */
const RUBBED = ON_FIELD + ENOUGH * TURN;

const shake = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "shake" } });
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: Color): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});

interface Run {
  world: World;
  events: SimEvent[];
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

const only = (world: World): Creature => {
  expect(world.creatures).toHaveLength(1);
  return world.creatures[0] as Creature;
};

describe("the gesture", () => {
  it("opens the window on the first turn made together, and merges nothing", () => {
    const { world, events } = run([choir(2, "red")], ON_FIELD + 2 * TURN, rub(ON_FIELD, 1));
    expect(choirIsDots(only(world))).toBe(true);
    expect(choirArmed(world)).toBe(CHOIR_RUBBED);
    expect(events.filter((e) => e.type === "choirArm")).toHaveLength(1);
    expect(events.some((e) => e.type === "choirSing")).toBe(false);
  });

  it("starts the closing on the last turn made together", () => {
    const { world, events } = run([choir(2, "red")], RUBBED, rub(ON_FIELD, ENOUGH));
    expect(choirIsFusing(only(world))).toBe(true);
    expect(events.filter((e) => e.type === "choirMerge")).toHaveLength(1);
    expect(events.some((e) => e.type === "choirOpen")).toBe(false);
  });

  it("becomes the body a beat later, in the lane it arrived in", () => {
    const { world, events } = run([choir(2, "red")], RUBBED + TPB * 2, rub(ON_FIELD, ENOUGH));
    const body = only(world);
    // A red choir becomes a slick, because `livingKindForColor` is the one
    // copy of the colour-to-silhouette pairing and nothing authors the target.
    expect(body.kind).toBe("slick");
    expect(events.filter((e) => e.type === "choirOpen")).toHaveLength(1);
    expect(body.col).toBe(2);
    // The gesture is spent: nothing is left armed to be finished twice.
    expect(choirArmed(world)).toBeNull();
  });

  it("counts nothing that one seat rubs alone, however long", () => {
    const { world, events } = run([choir(2, "red")], TPB * 6, rubBy(1, ON_FIELD, 20));
    expect(choirIsDots(only(world))).toBe(true);
    expect(choirArmed(world)).toBeNull();
    const turns = events.filter((e) => e.type === "choirRubTurn");
    expect(turns.length).toBeGreaterThan(0);
    expect(turns.every((e) => e.type === "choirRubTurn" && !e.together)).toBe(true);
  });

  it("counts nothing of a rub one seat makes after the other has stopped", () => {
    const late = ON_FIELD + 4 * TURN + TPB * (CFG.choirTogetherBeats + 1);
    const inputs = [...rubBy(1, ON_FIELD, 3), ...rubBy(2, late, 3)];
    const { world } = run([choir(2, "red")], late + TPB, inputs);
    expect(choirArmed(world)).toBeNull();
  });

  it("arms on the first shake and does not open on it", () => {
    const { world, events } = run([choir(2, "cyan")], TPB * 2, [shake(ON_FIELD)]);
    expect(choirIsDots(only(world))).toBe(true);
    expect(choirArmed(world)).toBe(CHOIR_SHAKEN);
    expect(events.filter((e) => e.type === "choirArm")).toHaveLength(1);
    expect(events.some((e) => e.type === "choirMerge")).toBe(false);
  });

  it("opens on the second shake, inside the window", () => {
    const { world, events } = run([choir(2, "cyan")], TPB * 3, [
      shake(ON_FIELD),
      shake(ON_FIELD + 8),
    ]);
    expect(only(world).kind).toBe("bulb");
    expect(events.filter((e) => e.type === "choirMerge")).toHaveLength(1);
    expect(events.filter((e) => e.type === "choirOpen")).toHaveLength(1);
  });

  it("takes a rub begun and then a shake, because the two ways in are one gesture", () => {
    const inputs = [...rub(ON_FIELD, 1), shake(ON_FIELD + 2 * TURN + 4)];
    const { world } = run([choir(2, "red")], TPB * 4, inputs);
    expect(only(world).kind).toBe("slick");
  });

  it("reaches every membrane on the field at once, having no column to be in", () => {
    const { world } = run([choir(0, "red"), choir(4, "cyan")], TPB * 3, [
      shake(ON_FIELD),
      shake(ON_FIELD + 8),
    ]);
    expect(world.creatures.map((c) => c.kind)).toEqual(["slick", "bulb"]);
    expect(world.creatures.map((c) => c.col)).toEqual([0, 4]);
  });
});

describe("what a half-made gesture costs", () => {
  it("sings when the pair stops rubbing together before the end", () => {
    const ticks = ON_FIELD + TPB * (CFG.choirWindowBeats + 3);
    const { world, events } = run([choir(2, "red")], ticks, rub(ON_FIELD, 2));
    expect(events.filter((e) => e.type === "choirSing")).toHaveLength(1);
    expect(failHolds(world)).toBe(true);
    // Still a membrane: a lapse costs the hull and never opens anything.
    expect(choirIsDots(only(world))).toBe(true);
    expect(choirArmed(world)).toBeNull();
  });

  it("leaves no scar, because nothing struck the ship", () => {
    const ticks = ON_FIELD + TPB * (CFG.choirWindowBeats + 3);
    const { world } = run([choir(2, "red")], ticks, rub(ON_FIELD, 2));
    expect(world.scars).toEqual([]);
  });

  it("costs nothing at all with no membrane on the field", () => {
    const { world, events } = run([], TPB * 4, [
      shake(ON_FIELD),
      shake(ON_FIELD + 8),
      ...rub(ON_FIELD + 12, 3),
    ]);
    expect(events.some((e) => e.type === "choirSing")).toBe(false);
    expect(world.retries).toBe(0);
  });
});

describe("the body it becomes", () => {
  it("refuses every shot while it is still a membrane", () => {
    const inputs = [aim(2, 2), fire(ON_FIELD, "red"), fire(TPB * 2, "cyan")];
    const { world, events } = run([choir(2, "red")], TPB * 4, inputs);
    expect(choirIsDots(only(world))).toBe(true);
    expect(events.some((e) => e.type === "reject")).toBe(true);
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    // Deliberately not charged to the colour balance: the ammunition may have
    // been right and the gesture simply not made (`choirStruck`).
    expect(world.balance.colorMisses).toBe(0);
  });

  it("dies to the matching cannon once it has drawn together", () => {
    const inputs = [aim(2, 2), ...rub(ON_FIELD, ENOUGH), fire(RUBBED + TPB + 4, "red")];
    const { world, events } = run([choir(2, "red")], RUBBED + TPB * 8, inputs);
    expect(world.creatures).toHaveLength(0);
    expect(events.some((e) => e.type === "destroy")).toBe(true);
  });
});

describe("the fingerprint", () => {
  /**
   * Two runs compared in one process, never a pinned constant: every
   * legitimate change to `hashWorld` moves every pinned number at once, and
   * re-pinning them is the motion that blesses a real regression
   * (`docs/decisions.md` #19).
   */
  it("is the same twice over the whole gesture", () => {
    const inputs = rub(ON_FIELD, ENOUGH);
    const a = run([choir(2, "red")], RUBBED + TPB, inputs);
    const b = run([choir(2, "red")], RUBBED + TPB, inputs);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
  });

  /**
   * And it notices the half-made gesture, which is the field this creature
   * added to `World`. Two devices that disagree about what is under way
   * disagree about whether the next move merges a body or makes it sing.
   */
  it("tells an armed field from an untouched one", () => {
    const armed = run([choir(2, "red")], ON_FIELD + 2 * TURN, rub(ON_FIELD, 1));
    const idle = run([choir(2, "red")], ON_FIELD + 2 * TURN);
    expect(hashWorld(armed.world)).not.toBe(hashWorld(idle.world));
  });

  it("tells a seat that has just turned alone from one that has not", () => {
    const alone = run([choir(2, "red")], ON_FIELD + 2 * TURN, rubBy(1, ON_FIELD, 1));
    const idle = run([choir(2, "red")], ON_FIELD + 2 * TURN);
    expect(hashWorld(alone.world)).not.toBe(hashWorld(idle.world));
  });
});
