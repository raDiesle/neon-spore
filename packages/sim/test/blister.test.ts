import { describe, expect, it } from "bun:test";
import { blisterPlaceRow, blisterUpBeatsOf } from "../src/blister.js";
import { refusesABolt } from "../src/bullet-refused.js";
import {
  type BlisterBy,
  blisterIsUp,
  blisterSwelling,
  type Creature,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullRow,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE BLISTER: the cycle, the tap, and the hull (`sim/blister.ts`).
 *
 * In order: it arrives under its pore, swells, and comes up; one tap from the
 * hand its `by` names, while it is up, knocks it out; a tap from the other
 * seat or on a pore with nothing up counts nothing; and one still up when its
 * beats run out breaks the hull, which loses the wave (the owner, 15 October
 * 2026).
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const blister = (col: number, row: number, by: BlisterBy): SpawnEntry => ({
  beat: 0,
  col,
  kind: "blister",
  color: null,
  row,
  by,
});

const tap = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "tap", id },
});

/** A world stepped tick by tick, with the events of every tick kept. */
function stage(queue: SpawnEntry[]) {
  const world = createWorld({ ...CFG }, 0, queue);
  const events: SimEvent[] = [];
  const go = (ticks: number, inputs: TimedCommand[] = []) => {
    for (let t = 0; t < ticks; t++) {
      step(
        world,
        inputs.filter((i) => i.tick === world.tick),
      );
      events.push(...world.events);
    }
  };
  return { world, events, go };
}

function only(world: World): Creature | undefined {
  return world.creatures.find((c) => c.kind === "blister");
}

/** Steps until the arrival has come in, and returns it. */
function arrive(s: ReturnType<typeof stage>): Creature {
  for (let t = 0; t < TPB * 8; t++) {
    const c = only(s.world);
    if (c) return c;
    s.go(1);
  }
  throw new Error("the blister never arrived");
}

/** Steps until the blister is up (or `limit` ticks pass), and returns it. */
function untilUp(s: ReturnType<typeof stage>, limit = TPB * 8): Creature {
  for (let t = 0; t < limit; t++) {
    const c = only(s.world);
    if (c && blisterIsUp(c)) return c;
    s.go(1);
  }
  throw new Error("the blister never came up");
}

/** Taps the blister now, from this seat, and steps the tick it lands on. */
function blow(s: ReturnType<typeof stage>, player: 1 | 2): void {
  const c = only(s.world);
  if (!c) throw new Error("no blister to tap");
  s.go(1, [tap(s.world.tick, player, c.id)]);
}

describe("where a blister comes up", () => {
  it("first at the authored pore, pulled clear of the radar strip and the hull", () => {
    expect(blisterPlaceRow(CFG, 0)).toBe(2);
    expect(blisterPlaceRow(CFG, 99)).toBe(hullRow(CFG) - 1);
    expect(blisterPlaceRow(CFG, 5)).toBe(5);
  });

  it("arrives under, swells, comes up where it was put, and stays up its beats", () => {
    const s = stage([blister(3, 4, 2)]);
    const c = arrive(s);
    expect(c.col).toBe(3);
    expect(c.row).toBe(4);
    expect(blisterIsUp(c)).toBe(false);
    const upAt = untilUp(s);
    expect(upAt.row).toBe(4);
    const from = s.world.tick;
    while (only(s.world) && blisterIsUp(only(s.world)!)) s.go(1);
    // Up for exactly its beats, and then gone into the hull, not under again.
    expect(s.world.tick - from).toBe(CFG.blisterUpBeats * TPB);
    expect(only(s.world)).toBeUndefined();
  });

  it("stays up a beat longer for a gesture a thumb has to carry", () => {
    const tapUp = blisterUpBeatsOf(CFG, { kind: "blister" } as Creature);
    const holdUp = blisterUpBeatsOf(CFG, { kind: "blister", blisterGesture: "hold" } as Creature);
    expect(tapUp).toBe(6);
    expect(holdUp).toBe(6);
    for (const g of ["swipe", "turn", "rub", "combo", "lever"] as const) {
      expect(blisterUpBeatsOf(CFG, { kind: "blister", blisterGesture: g } as Creature)).toBe(8);
    }
  });

  it("swells only in its last beat under, which is the partner's beat to say it", () => {
    const s = stage([blister(3, 4, 2)]);
    arrive(s);
    expect(blisterSwelling(only(s.world)!)).toBe(CFG.blisterDownBeats <= 1);
    untilUp(s);
    // The beat before it came up was the swelling one.
    expect(blisterSwelling(only(s.world)!)).toBe(false);
  });
});

describe("knocking it down", () => {
  it("one tap from the hand it names knocks it out while it is up", () => {
    const s = stage([blister(3, 4, 2)]);
    untilUp(s);
    blow(s, 2);
    expect(only(s.world)).toBeUndefined();
    expect(s.events.some((e) => e.type === "destroy" && e.kind === "blister")).toBe(true);
    // One `blisterBlow`, the verdict ring and the cue are thrown off it
    // (`render/blister-verdicts.ts`).
    expect(s.events.filter((e) => e.type === "blisterBlow").length).toBe(1);
    expect(s.world.scars).toEqual([]);
  });

  it("a tap from the other seat counts nothing", () => {
    const s = stage([blister(3, 4, 2)]);
    untilUp(s);
    blow(s, 1);
    blow(s, 1);
    expect(blisterIsUp(only(s.world)!)).toBe(true);
    expect(s.events.some((e) => e.type === "blisterBlow")).toBe(false);
  });

  it("a tap while it is under counts nothing", () => {
    const s = stage([blister(3, 4, 2)]);
    arrive(s);
    blow(s, 2);
    expect(blisterIsUp(only(s.world)!)).toBe(false);
    expect(s.events.some((e) => e.type === "blisterBlow")).toBe(false);
  });

  it("with both hands named, either seat's tap knocks it out", () => {
    for (const seat of [1, 2] as const) {
      const s = stage([blister(3, 4, "both")]);
      untilUp(s);
      blow(s, seat);
      expect(only(s.world)).toBeUndefined();
    }
  });

  it("is not the cannon's: a bolt that meets one is spent on it", () => {
    expect(refusesABolt("blister")).toBe(true);
  });
});

describe("left alone", () => {
  it("breaks the hull in its own column the beat its time up runs out", () => {
    const s = stage([blister(3, 2, 2)]);
    untilUp(s);
    const upAt = s.world.tick;
    let brokeAt = -1;
    for (let t = 0; t < TPB * 10 && brokeAt < 0; t++) {
      s.go(1);
      if (s.world.scars.length > 0) brokeAt = s.world.tick;
    }
    expect(brokeAt - upAt).toBe(CFG.blisterUpBeats * TPB);
    expect(only(s.world)).toBeUndefined();
    expect(s.world.scars.map((x) => [x.kind, x.col])).toEqual([["blister", 3]]);
    expect(s.events.some((e) => e.type === "destroy")).toBe(false);
    // And the wave is lost on that tick, not at a later surfacing.
    expect(s.events.some((e) => e.type === "waveFailed")).toBe(true);
  });
});

describe("a recorded run", () => {
  it("runs the same twice", () => {
    const replay = record({
      name: "one blister tapped out, one left to the hull",
      seed: 5,
      queue: [blister(1, 3, 2), blister(5, 2, 1)],
      ticks: TPB * 40,
      inputs: [],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(hashWorld(runReplay(replay))).toBe(hashWorld(runReplay(replay)));
  });
});
