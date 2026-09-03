import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GaugeState,
  gaugeHolds,
  gaugeRound,
  gaugeSeated,
  hashWorld,
  roundSpent,
  type SimConfig,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE GAUGE as a boss wave.
 *
 * It used to be an *interlude*: a round reached from a table of gaps, behind a
 * `cfg.interludes` switch, that could never end a run. All three are gone, and
 * most of this file is about what replaced them — a wave carries it the way a
 * wave carries the queen, the field is gone while it stands, and running out
 * of time breaks the hull like anything else that gets through.
 *
 * The round itself is one needle and two marks, and the only interesting thing
 * about it is that neither seat can play it alone — which is two of the tests
 * below and not a matter of taste.
 */

/**
 * No `PAIR_ON`. The round needed the pair's switch when it was a category
 * reached between waves; a boss wave needs nothing turned on, which is most of
 * what this change bought and is worth saying in the rig rather than only in a
 * comment.
 */
const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** The wave THE GAUGE is installed on. Any number: it is a wave like any other. */
const WAVE = 4;

type Bot = (world: World) => TimedCommand[];
const SILENT: Bot = () => [];

function open(seed = 5): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "gauge" });
  return world;
}

function round(world: World): GaugeState {
  const g = gaugeRound(world);
  if (g === null) throw new Error("no round running");
  return g;
}

function cmd(world: World, player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player, command };
}

/**
 * A pair who are talking: the pilot turns towards the band he cannot see and
 * the navigator calls the moment the needle is between her marks. It reads the
 * whole world because a test rig may — what it stands in for is two people and
 * a sentence.
 */
function talking(world: World): TimedCommand[] {
  const gauge = gaugeRound(world);
  if (gauge === null || gauge.phase !== "play") return [];
  const out: TimedCommand[] = [];
  const want = gauge.needleMilli < gauge.markMilli ? 1 : -1;
  if (gauge.valve !== want) out.push(cmd(world, 1, { kind: "valve", on: true, dir: want }));
  if (gaugeSeated(world, gauge)) out.push(cmd(world, 2, { kind: "call" }));
  return out;
}

function run(world: World, ticks: number, bot: Bot = SILENT): SimEvent[] {
  const seen: SimEvent[] = [];
  for (let i = 0; i < ticks; i++) {
    step(world, bot(world));
    seen.push(...world.events);
  }
  return seen;
}

/**
 * Tick until the round is over, and hand back the round itself.
 *
 * "Over" is `spent` and not gone: a round that has run its course stays
 * installed so the field does not come back for the beats of rest before the
 * next wave (`sim/wave-end.ts`), and the state object is still the world's.
 */
function runToEnd(
  world: World,
  cap: number,
  bot: Bot = SILENT,
): { events: SimEvent[]; result: GaugeState } {
  const events: SimEvent[] = [];
  const result = round(world);
  for (let i = 0; i < cap && gaugeHolds(world) && !roundSpent(world); i++) {
    step(world, bot(world));
    events.push(...world.events);
  }
  return { events, result };
}

describe("reaching the round", () => {
  it("is a wave's own boss, and needs nothing switched on", () => {
    const world = open();
    expect(world.boss?.kind).toBe("gauge");
    expect(gaugeHolds(world)).toBe(true);
    expect(world.wave).toBe(WAVE);
  });

  it("is not there on a wave that does not carry it", () => {
    const world = createWorld(CFG, 1);
    startWave(world, WAVE, []);
    expect(gaugeHolds(world)).toBe(false);
    expect(gaugeRound(world)).toBeNull();
  });

  it("draws a band the needle is not already sitting in", () => {
    for (let seed = 0; seed < 12; seed++) {
      const world = open(seed);
      expect(gaugeSeated(world, round(world))).toBe(false);
    }
  });
});

describe("while the round is up", () => {
  it("the field is gone: nothing spawns, falls or reaches the hull", () => {
    const world = createWorld(CFG, 3);
    // A queue on a gauge wave is a thing no author would write, and that is
    // the point of handing one over: `step` returns before it reaches the beat
    // that would read it, so nothing arrives however long the round runs.
    startWave(world, WAVE, [{ beat: 0, col: 2, kind: "meteor", color: null }], [], {
      kind: "gauge",
    });
    run(world, TPB * 20);
    expect(world.creatures.length).toBe(0);
    expect(world.spawned).toBe(0);
    expect(world.waveBeat).toBe(0);
    expect(world.hullMilli).toBe(100_000);
  });

  it("the beat is not: the metronome runs through it", () => {
    const world = open();
    const before = world.beat;
    const events = run(world, TPB * 6);
    expect(world.beat).toBe(before + 6);
    expect(events.filter((e) => e.type === "beat").length).toBe(6);
  });

  it("holds the round for its lead-in before anything can be turned", () => {
    const world = open();
    const needle = round(world).needleMilli;
    run(world, TPB * 2, (w) => [cmd(w, 1, { kind: "valve", on: true, dir: 1 })]);
    expect(round(world).phase).toBe("lead");
    expect(round(world).needleMilli).toBe(needle);
  });
});

describe("the two halves", () => {
  it("the reading player cannot turn", () => {
    const world = open();
    run(world, TPB * 10, (w) => [cmd(w, 2, { kind: "valve", on: true, dir: 1 })]);
    expect(round(world).phase).toBe("play");
    expect(round(world).valve).toBe(0);
    expect(round(world).needleMilli).toBe(500);
  });

  it("the turning player cannot call", () => {
    const world = open();
    run(world, TPB * 30, (w) => {
      const gauge = gaugeRound(w);
      if (gauge === null || gauge.phase !== "play") return [];
      const want = gauge.needleMilli < gauge.markMilli ? 1 : -1;
      const out = [cmd(w, 1, { kind: "valve", on: true, dir: want })];
      if (gaugeSeated(w, gauge)) out.push(cmd(w, 1, { kind: "call" }));
      return out;
    });
    expect(round(world).marks).toBe(0);
    expect(round(world).misses).toBe(0);
  });

  it("costs a call the same rest whether it landed or not", () => {
    const world = open();
    run(world, TPB * 5);
    const gauge = round(world);
    expect(gauge.phase).toBe("play");
    // Two calls on the same beat, both wide of a band the pilot never moved
    // towards: the second is not heard at all, so it is not even a miss.
    step(world, [cmd(world, 2, { kind: "call" }), cmd(world, 2, { kind: "call" })]);
    expect(gauge.misses).toBe(1);
    step(world, [cmd(world, 2, { kind: "call" })]);
    expect(gauge.misses).toBe(1);
  });
});

describe("leaving the round", () => {
  it("is passed by talking, and the wave then clears like any other", () => {
    const world = open();
    const { result } = runToEnd(world, TPB * 200, talking);
    expect(result.marks).toBe(CFG.gaugeMarks);
    expect(result.passed).toBe(true);
    expect(world.hullMilli).toBe(100_000);
    expect(world.scars.length).toBe(0);
    // The round is spent rather than gone: it holds its own picture, and ends
    // its wave from there rather than through an empty field (`wave-end.ts`).
    expect(roundSpent(world)).toBe(true);
    expect(world.boss?.kind).toBe("gauge");
    const after = run(world, TPB * (CFG.waveRestBeats + 4));
    expect(after.some((e) => e.type === "needWave" && e.wave === WAVE + 1)).toBe(true);
  });

  it("is failed by saying nothing, and that breaks the hull", () => {
    const world = open();
    world.score = 700;
    world.hullMilli = 61_000;
    const { result } = runToEnd(world, TPB * (CFG.gaugeRoundBeats + 20));
    expect(result.passed).toBe(false);
    expect(result.marks).toBe(0);
    // Time is still what a *call* costs; the round costs the hull. The wave's
    // own clear is credited either way, and now on the tick the round spends
    // itself rather than a beat later through an empty field.
    expect(world.score).toBe(700 + CFG.scoreWave);
    expect(world.hullMilli).toBe(61_000 - CFG.damageGauge * 1000);
    expect(world.scars.length).toBe(1);
    expect(world.over).toBe(false);
  });

  it("can end the run, which an interlude was never allowed to do", () => {
    const world = open();
    world.hullMilli = 5_000;
    runToEnd(world, TPB * (CFG.gaugeRoundBeats + 20));
    expect(world.hullMilli).toBe(0);
    expect(world.over).toBe(true);
  });

  it("is left by a restart, from inside the round", () => {
    const world = open();
    run(world, TPB * 8);
    const events = run(world, 1, (w) => [cmd(w, 1, { kind: "restart" })]);
    expect(world.boss).toBeNull();
    expect(gaugeHolds(world)).toBe(false);
    expect(events.some((e) => e.type === "needWave" && e.wave === 0)).toBe(true);
  });
});

describe("the fingerprint", () => {
  it("covers the round, so two devices cannot disagree about it silently", () => {
    const plain = createWorld(CFG, 9);
    startWave(plain, WAVE, []);
    const gauge = open(9);
    expect(hashWorld(gauge)).not.toBe(hashWorld(plain));

    const moved = open(9);
    run(moved, TPB * 8, (w) => [cmd(w, 1, { kind: "valve", on: true, dir: 1 })]);
    const still = open(9);
    run(still, TPB * 8);
    expect(round(moved).needleMilli).not.toBe(round(still).needleMilli);
    expect(hashWorld(moved)).not.toBe(hashWorld(still));
  });

  it("is the same on two runs of the same round, marks and all", () => {
    const a = open(21);
    const b = open(21);
    let seen = 0;
    for (let tick = 0; tick < TPB * 60; tick++) {
      step(a, talking(a));
      step(b, talking(b));
      seen = Math.max(seen, gaugeRound(a)?.marks ?? seen);
      if (tick % TPB === 0) expect(hashWorld(a)).toBe(hashWorld(b));
    }
    // Assert what the round did before asserting that two of them agree — a
    // pinned constant would pass on a round that never started
    // (`docs/decisions.md` #19).
    expect(seen).toBe(CFG.gaugeMarks);
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
