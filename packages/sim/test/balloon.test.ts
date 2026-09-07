import { describe, expect, it } from "bun:test";
import { balloonSplitsLeft } from "../src/balloon.js";
import { balloonIsRubbed, balloonSideTaut } from "../src/balloon-pull.js";
import { DEFAULT_CONFIG, hullRow, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import type { Creature, DragTarget, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE BALLOON, and the three things about it that are new to this simulation.
 *
 * The first is a body that goes **up** and leaves on its own. THE CHUTE climbs
 * too, but it turns round at the top and comes back down; this one is the only
 * arrival in the game that can beat the pair by getting *away* from the ship,
 * and what it costs is charged to the hull from the far end of the field.
 *
 * The second is an answer made of **two seats at once**. Every gesture before
 * it is the pilot's — THE LID's cord, THE CHOIR's arrows — and each of their
 * tests is about one hand and a window. Here neither hand does anything alone
 * and there is no window at all: the two pulls simply have to be taut on the
 * same body on the same tick.
 *
 * The third is what a rub *does*, which is not the same thing twice: the first
 * splits and the second finishes, so the pair is made to agree about one body
 * and then about two.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** Comfortably past `balloonTautMilli`, in the sign each seat's side wants. */
const FAR = CFG.balloonTautMilli + 400;

const balloon = (col: number, rise?: number): SpawnEntry => ({
  beat: 0,
  col,
  kind: "balloon",
  color: null,
  ...(rise === undefined ? {} : { rise }),
});

/**
 * The first tick a hand can reach a balloon authored at beat 0.
 *
 * A wave's arrivals are put on the field by `onBeat`, which runs on the tick
 * the beat turns over — so for the whole of beat zero there is nothing to take
 * hold of. `choir.test.ts` learnt this the same way and says so.
 */
const ON_FIELD = TPB + 2;

/** One seat's hand on one handle, carried `milli` from where it grabbed. The
 * grab at zero goes first, the way a real finger sends one
 * (`render/touch.ts`). */
const pull = (
  tick: number,
  player: 1 | 2,
  target: DragTarget,
  milli: number,
  id: number,
): TimedCommand[] => [
  { tick, player, command: { kind: "drag", target, on: true, fromMilli: 0, id } },
  { tick: tick + 1, player, command: { kind: "drag", target, on: true, fromMilli: milli, id } },
];

/** Both hands on one body, taut on the same tick — the whole of the gesture. */
const rub = (tick: number, id: number): TimedCommand[] => [
  ...pull(tick, 1, "balloonLeft", -FAR, id),
  ...pull(tick, 2, "balloonRight", FAR, id),
];

interface Run {
  world: World;
  events: SimEvent[];
}

function play(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
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

/** The row an arrival appears on: one above the ship's own. */
const ENTRY = hullRow(CFG) - 1;
/** How many beats of climbing the timed runs below measure. */
const CLIMBS = 2;

describe("a body that goes up", () => {
  it("appears one row above the ship and holds still while it swells", () => {
    const { world } = play([balloon(3)], TPB * 2);
    const c = only(world);
    // The entry row, and it is still on it: the swell is `balloonSwellBeats`
    // long and nothing moves until it is over.
    expect(c.row).toBe(ENTRY);
    expect(c.kind).toBe("balloon");
  });

  it("climbs a row and a lane a beat once it has filled", () => {
    // An arrival authored at beat 0 lands on beat 1 and swells through
    // `balloonSwellBeats` of them, so a run of that many beats plus two ends
    // with exactly two climbs behind it.
    const { world } = play([balloon(3)], TPB * (CFG.balloonSwellBeats + CLIMBS));
    const c = only(world);
    expect(c.row).toBe(ENTRY - CLIMBS * CFG.balloonRiseRows);
    // And it has left the lane it appeared in, which is the diagonal.
    expect(c.col).not.toBe(3);
  });

  it("climbs faster when the wave authored a speed", () => {
    const fast = play([balloon(3, 2)], TPB * (CFG.balloonSwellBeats + CLIMBS));
    expect(only(fast.world).row).toBe(ENTRY - CLIMBS * 2);
  });

  it("bursts at the top of the field and the hull pays for it", () => {
    // Long enough for the swell and the whole climb, whatever the field's
    // height: the entry row is the ship's less one and it takes a row a beat.
    const { world, events } = play([balloon(3)], TPB * (CFG.balloonSwellBeats + hullRow(CFG) + 2));
    expect(world.creatures).toHaveLength(0);
    expect(events.filter((e) => e.type === "balloonBurst")).toHaveLength(1);
    expect(world.hullMilli).toBeLessThan(100 * 1000);
    // Nothing struck the ship, so nothing is torn in the plating: the burst
    // happened a whole field away from the hull it cost (`burstBalloon`).
    expect(world.scars).toHaveLength(0);
  });

  it("is not answered by a shot in either colour", () => {
    const inputs: TimedCommand[] = [
      { tick: ON_FIELD, player: 1, command: { kind: "cannonCol", col: 3 } },
      { tick: ON_FIELD + 1, player: 2, command: { kind: "fire", color: "red" } },
      { tick: ON_FIELD + 2, player: 2, command: { kind: "fire", color: "cyan" } },
    ];
    const { world, events } = play([balloon(3)], TPB * 3, inputs);
    expect(only(world).kind).toBe("balloon");
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    expect(events.some((e) => e.type === "reject")).toBe(true);
    // Not a colour miss: no ammunition was ever going to be right, so the
    // balance is not charged for it (`balloonStruck`).
    expect(world.balance.colorMisses).toBe(0);
  });
});

describe("two hands at once", () => {
  it("does nothing on one hand, however far it is carried", () => {
    const { world } = play([balloon(3)], TPB * 3, pull(ON_FIELD, 1, "balloonLeft", -FAR, 1));
    const c = only(world);
    expect(balloonSideTaut(CFG, c, 1)).toBe(true);
    expect(balloonSideTaut(CFG, c, 2)).toBe(false);
    expect(balloonIsRubbed(CFG, c)).toBe(false);
    expect(balloonSplitsLeft(c)).toBe(CFG.balloonSplits);
  });

  it("does nothing when the two hands are on different bodies", () => {
    const inputs = [
      ...pull(ON_FIELD, 1, "balloonLeft", -FAR, 1),
      ...pull(ON_FIELD, 2, "balloonRight", FAR, 2),
    ];
    const { world, events } = play([balloon(1), balloon(5)], TPB * 3, inputs);
    expect(world.creatures).toHaveLength(2);
    expect(events.some((e) => e.type === "balloonSplit")).toBe(false);
  });

  it("does nothing when both hands pull inward instead of apart", () => {
    const inputs = [
      ...pull(ON_FIELD, 1, "balloonLeft", FAR, 1),
      ...pull(ON_FIELD, 2, "balloonRight", -FAR, 1),
    ];
    const { world } = play([balloon(3)], TPB * 3, inputs);
    expect(balloonIsRubbed(CFG, only(world))).toBe(false);
  });

  it("refuses a seat reaching for the other's handle", () => {
    const inputs = [
      ...pull(ON_FIELD, 2, "balloonLeft", -FAR, 1),
      ...pull(ON_FIELD, 1, "balloonRight", FAR, 1),
    ];
    const { world } = play([balloon(3)], TPB * 3, inputs);
    const c = only(world);
    expect(balloonSideTaut(CFG, c, 1)).toBe(false);
    expect(balloonSideTaut(CFG, c, 2)).toBe(false);
  });
});

describe("what a rub does", () => {
  it("splits the first time, into two a lane either side of the parent", () => {
    const { world, events } = play([balloon(3)], TPB * 2, rub(ON_FIELD, 1));
    expect(events.filter((e) => e.type === "balloonSplit")).toHaveLength(1);
    expect(world.creatures).toHaveLength(2);
    // Each half is one generation smaller, and neither is held: the hands were
    // on a body that has stopped existing.
    for (const c of world.creatures) {
      expect(balloonSplitsLeft(c)).toBe(CFG.balloonSplits - 1);
      expect(c.balloonPullP1).toBeUndefined();
      expect(c.balloonPullP2).toBeUndefined();
    }
    // A lane either side of where the parent stood, which is the picture of
    // one thing becoming two.
    expect(world.creatures.map((c) => c.col).sort()).toEqual([2, 4]);
    expect(world.score).toBe(CFG.scoreBalloonRub);
  });

  it("holds each half still for the swell before it climbs", () => {
    // The delay the owner asked for, and it is the same swell a fresh arrival
    // has: the halves are given `balloonBeat` of the beat the rub landed on,
    // so they fill where the parent stood before either of them moves.
    const still = play([balloon(3)], TPB * 2, rub(ON_FIELD, 1));
    expect(still.world.creatures.map((c) => c.row)).toEqual([ENTRY, ENTRY]);
    const after = play([balloon(3)], TPB * 3, rub(ON_FIELD, 1));
    for (const c of after.world.creatures) expect(c.row).toBeLessThan(ENTRY);
  });

  it("pops the second time, and the hull pays nothing at all", () => {
    const split = TPB * 3;
    const inputs = [...rub(ON_FIELD, 1), ...rub(split, 2)];
    const { world, events } = play([balloon(3)], TPB * 4, inputs);
    expect(events.filter((e) => e.type === "balloonPop")).toHaveLength(1);
    // One of the two halves is gone and the other is untouched — the pair has
    // to agree all over again about the one that is left.
    expect(world.creatures).toHaveLength(1);
    expect(balloonSplitsLeft(world.creatures[0] as Creature)).toBe(0);
    expect(world.hullMilli).toBe(100 * 1000);
    expect(world.score).toBe(CFG.scoreBalloonRub + CFG.scoreBalloonPop);
  });
});

describe("determinism", () => {
  it("fingerprints the same twice over the same inputs", () => {
    const inputs = [...rub(ON_FIELD, 1), ...rub(TPB * 3, 2)];
    const a = play([balloon(1), balloon(5, 2)], TPB * 6, inputs);
    const b = play([balloon(1), balloon(5, 2)], TPB * 6, inputs);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
  });
});
