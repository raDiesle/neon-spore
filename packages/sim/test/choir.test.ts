import { describe, expect, it } from "bun:test";
import { choirIsDots } from "../src/choir.js";
import { choirArmed } from "../src/choir-gesture.js";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import type { Color, Creature, DragTarget, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE CHOIR, and the two things about it that are new to this simulation.
 *
 * The first is THE CLASP's: a body that stops being the kind it was born. That
 * one is covered next door and the shape is the same here, so what is tested
 * below is the half that is *not* the same — the gesture. It is the first
 * answer in this game made of two commands that have to arrive in the right
 * order inside a window, from one seat, on a body standing in a lane that
 * neither arrow is anywhere near.
 *
 * The second is what a **wrong** move costs. Every other creature answers a
 * mistake by simply not dying; this one takes the hull, on the owner's own
 * instruction, and both ways of being wrong have to do it: the window running
 * out with one arrow open, and an arrow carried the way it does not go.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** Comfortably past `choirPullMilli`, in the sign the argument names. */
const FAR = CFG.choirPullMilli + 500;
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

/** A hand on one arrow, carried `milli` from where it grabbed. The grab at
 * zero goes first, the way a real finger sends one (`render/touch.ts`). */
const pull = (tick: number, target: DragTarget, milli: number): TimedCommand[] => [
  { tick, player: 1, command: { kind: "drag", target, on: true, fromMilli: 0 } },
  { tick: tick + 1, player: 1, command: { kind: "drag", target, on: true, fromMilli: milli } },
];

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
  it("does nothing at all on one arrow, and the window stands open", () => {
    const { world, events } = run([choir(2, "red")], TPB * 2, pull(ON_FIELD, "choirLeft", -FAR));
    expect(choirIsDots(only(world))).toBe(true);
    expect(choirArmed(world)).toBe(-1);
    expect(events.filter((e) => e.type === "choirArm")).toHaveLength(1);
    expect(events.some((e) => e.type === "choirSing")).toBe(false);
  });

  it("draws the dots together on the other arrow, inside the window", () => {
    const inputs = [...pull(ON_FIELD, "choirLeft", -FAR), ...pull(TPB * 2, "choirRight", FAR)];
    const { world, events } = run([choir(2, "red")], TPB * 3, inputs);
    const body = only(world);
    // A red choir becomes a slick, because `livingKindForColor` is the one
    // copy of the colour-to-silhouette pairing and nothing authors the target.
    expect(body.kind).toBe("slick");
    // And it stays in the lane it arrived in. The body is one tile wide the
    // whole time, so the column player 2 was given is the one that answers —
    // a merge that moved the lane would expire a number already said aloud.
    expect(body.col).toBe(2);
    expect(events.filter((e) => e.type === "choirMerge")).toHaveLength(1);
    expect(world.score).toBe(CFG.scoreChoirMerge);
    // The gesture is spent: nothing is left armed to be finished twice.
    expect(choirArmed(world)).toBeNull();
  });

  it("is one shake and not two, where a phone can report one", () => {
    const { world, events } = run([choir(2, "cyan")], TPB * 2, [shake(ON_FIELD)]);
    expect(only(world).kind).toBe("bulb");
    expect(events.filter((e) => e.type === "choirMerge")).toHaveLength(1);
  });

  it("counts two pulls on the same side as one gesture done twice", () => {
    const inputs = [...pull(ON_FIELD, "choirLeft", -FAR), ...pull(TPB * 2, "choirLeft", -FAR)];
    const { world } = run([choir(2, "red")], TPB * 3, inputs);
    expect(choirIsDots(only(world))).toBe(true);
    expect(choirArmed(world)).toBe(-1);
  });

  it("reaches every membrane on the field at once, having no column to be in", () => {
    const { world } = run([choir(0, "red"), choir(4, "cyan")], TPB * 2, [shake(ON_FIELD)]);
    expect(world.creatures.map((c) => c.kind)).toEqual(["slick", "bulb"]);
    expect(world.creatures.map((c) => c.col)).toEqual([0, 4]);
  });
});

describe("what a wrong move costs", () => {
  const full = 100 * 1000;

  it("sings when the window runs out with one arrow open", () => {
    const ticks = TPB * (CFG.choirWindowBeats + 3);
    const { world, events } = run([choir(2, "red")], ticks, pull(ON_FIELD, "choirLeft", -FAR));
    expect(events.filter((e) => e.type === "choirSing")).toHaveLength(1);
    expect(world.hullMilli).toBeLessThan(full);
    // Still a membrane: a lapse costs the hull and never opens anything.
    expect(choirIsDots(only(world))).toBe(true);
    expect(choirArmed(world)).toBeNull();
  });

  it("sings when an arrow is carried the way it does not go", () => {
    const { world, events } = run([choir(2, "red")], TPB * 2, pull(ON_FIELD, "choirLeft", FAR));
    expect(events.filter((e) => e.type === "choirSing")).toHaveLength(1);
    expect(choirIsDots(only(world))).toBe(true);
  });

  it("leaves no scar, because nothing struck the ship", () => {
    const { world } = run([choir(2, "red")], TPB * 2, pull(ON_FIELD, "choirLeft", FAR));
    expect(world.scars).toEqual([]);
  });

  it("costs nothing at all with no membrane on the field", () => {
    const { world, events } = run([], TPB * 2, [
      shake(ON_FIELD),
      ...pull(ON_FIELD + 4, "choirLeft", FAR),
    ]);
    expect(events.some((e) => e.type === "choirSing")).toBe(false);
    expect(world.hullMilli).toBe(full);
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
    const inputs = [
      aim(2, 2),
      ...pull(ON_FIELD, "choirLeft", -FAR),
      ...pull(TPB * 2, "choirRight", FAR),
      fire(TPB * 2 + 4, "red"),
    ];
    const { world, events } = run([choir(2, "red")], TPB * 8, inputs);
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
    const inputs = [...pull(ON_FIELD, "choirLeft", -FAR), ...pull(TPB * 2, "choirRight", FAR)];
    const a = run([choir(2, "red")], TPB * 4, inputs);
    const b = run([choir(2, "red")], TPB * 4, inputs);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
  });

  /**
   * And it notices the half-made gesture, which is the field this creature
   * added to `World`. Two devices that disagree about which arrow is standing
   * out disagree about whether the next pull merges a body or makes it sing.
   */
  it("tells an armed field from an untouched one", () => {
    const armed = run([choir(2, "red")], TPB * 2, pull(ON_FIELD, "choirLeft", -FAR));
    const idle = run([choir(2, "red")], TPB);
    expect(hashWorld(armed.world)).not.toBe(hashWorld(idle.world));
  });
});
