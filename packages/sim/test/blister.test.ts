import { describe, expect, it } from "bun:test";
import { blisterPlaceRow } from "../src/blister.js";
import { refusesABolt } from "../src/bullet-refused.js";
import {
  type BlisterBy,
  blisterIsUp,
  blisterLeft,
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
 * The mole, in order: it arrives under its pore, comes up, stays, sinks and
 * comes up nearer; a tap from the hand its `by` names, while it is up, is one
 * off a count kept across surfacings; a tap from the other seat or on a pore
 * with nothing up counts nothing; and one nobody answers breaks the hull.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const blister = (col: number, row: number, by: BlisterBy, count = 3): SpawnEntry => ({
  beat: 0,
  col,
  kind: "blister",
  color: null,
  row,
  by,
  count,
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

/** Steps until it has gone under again. */
function untilDown(s: ReturnType<typeof stage>): void {
  for (let t = 0; t < TPB * 8; t++) {
    const c = only(s.world);
    if (!c || !blisterIsUp(c)) return;
    s.go(1);
  }
  throw new Error("the blister never went under");
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

  it("arrives under, swells, comes up, stays up its beats and sinks nearer", () => {
    const s = stage([blister(3, 4, 2)]);
    const c = arrive(s);
    expect(c.col).toBe(3);
    expect(c.row).toBe(4);
    expect(blisterIsUp(c)).toBe(false);
    const upAt = untilUp(s);
    expect(upAt.row).toBe(4);
    const from = s.world.tick;
    untilDown(s);
    // Up for exactly its beats, and under again `blisterSinkRows` lower.
    expect(s.world.tick - from).toBe(CFG.blisterUpBeats * TPB);
    expect(only(s.world)!.row).toBe(4 + CFG.blisterSinkRows);
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
  it("three taps from the hand it names knock it out while it is up", () => {
    const s = stage([blister(3, 4, 2)]);
    untilUp(s);
    blow(s, 2);
    blow(s, 2);
    expect(blisterLeft(CFG, only(s.world)!)).toBe(1);
    blow(s, 2);
    expect(only(s.world)).toBeUndefined();
    expect(s.events.some((e) => e.type === "destroy" && e.kind === "blister")).toBe(true);
    // One `blisterBlow` a blow that counted, counting down to nought — the
    // verdict ring and the cue are thrown off these (`render/blister-verdicts.ts`).
    const left = s.events.flatMap((e) => (e.type === "blisterBlow" ? [e.left] : []));
    expect(left).toEqual([2, 1, 0]);
    expect(s.world.scars).toEqual([]);
  });

  it("a tap from the other seat counts nothing", () => {
    const s = stage([blister(3, 4, 2)]);
    untilUp(s);
    blow(s, 1);
    blow(s, 1);
    blow(s, 1);
    expect(blisterLeft(CFG, only(s.world)!)).toBe(3);
    expect(s.events.some((e) => e.type === "blisterBlow")).toBe(false);
  });

  it("a tap while it is under counts nothing", () => {
    const s = stage([blister(3, 4, 2)]);
    arrive(s);
    blow(s, 2);
    expect(blisterIsUp(only(s.world)!)).toBe(false);
    expect(blisterLeft(CFG, only(s.world)!)).toBe(3);
  });

  it("keeps the count across surfacings: one now, two the next time up", () => {
    const s = stage([blister(3, 2, 2)]);
    untilUp(s);
    blow(s, 2);
    untilDown(s);
    expect(blisterLeft(CFG, only(s.world)!)).toBe(2);
    untilUp(s);
    blow(s, 2);
    blow(s, 2);
    expect(only(s.world)).toBeUndefined();
  });

  it("with both hands named, either seat's taps go on one count", () => {
    const s = stage([blister(3, 4, "both")]);
    untilUp(s);
    blow(s, 1);
    blow(s, 2);
    blow(s, 1);
    expect(only(s.world)).toBeUndefined();
  });

  it("is not the cannon's: a bolt that meets one is spent on it", () => {
    expect(refusesABolt("blister")).toBe(true);
  });
});

describe("left alone", () => {
  it("comes up nearer each time and breaks the hull when it comes up on it", () => {
    const s = stage([blister(3, 2, 2)]);
    // The tick it sank onto the hull row, and the tick the hull broke: the
    // whole of its time under, so nothing goes through a pore unseen.
    let sankAt = -1;
    let brokeAt = -1;
    for (let t = 0; t < TPB * 40 && brokeAt < 0; t++) {
      s.go(1);
      const c = only(s.world);
      if (sankAt < 0 && c && c.row === hullRow(CFG)) sankAt = s.world.tick;
      if (s.world.scars.length > 0) brokeAt = s.world.tick;
    }
    expect(brokeAt - sankAt).toBe(CFG.blisterDownBeats * TPB);
    expect(only(s.world)).toBeUndefined();
    expect(s.world.scars.map((x) => x.kind)).toEqual(["blister"]);
    expect(s.events.some((e) => e.type === "destroy")).toBe(false);
  });

  it("gives at least four seconds from its first swell to the hull", () => {
    const s = stage([blister(3, 2, 2)]);
    arrive(s);
    const start = s.world.tick;
    while (only(s.world) && s.world.tick - start < TPB * 60) s.go(1);
    const seconds = (s.world.tick - start) / CFG.tickHz;
    expect(seconds).toBeGreaterThanOrEqual(4);
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
