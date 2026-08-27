import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  gaugeSeated,
  hashWorld,
  type InterludeState,
  interludeDue,
  interludeHolds,
  NO_INTERLUDE,
  PAIR_ON,
  type SimConfig,
  type SimEvent,
  startInterlude,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE GAUGE, and through it the shell every other interlude will enter by.
 *
 * Most of what is asserted here is about the shell rather than the round: that
 * the field is gone while one is up, that the beat is not, that failing costs
 * nothing, and that the way out is the same door the way in used. The round
 * itself is one needle and two marks, and the only interesting thing about it
 * is that neither seat can play it alone — which is two of the tests below and
 * not a matter of taste.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, ...PAIR_ON };
const TPB = ticksPerBeat(CFG);
/** The gap these rounds are opened in front of. Any wave above zero. */
const WAVE = 4;

type Bot = (world: World) => TimedCommand[];
const SILENT: Bot = () => [];

function open(seed = 5): World {
  const world = createWorld(CFG, seed);
  startInterlude(world, { kind: "gauge" }, WAVE);
  return world;
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
  const gauge = world.interlude;
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
 * Tick until the round is over, and hand back the round itself. The state
 * object outlives being detached from the world, which is the only way to read
 * a verdict that is by then in the past.
 */
function runToEnd(
  world: World,
  cap: number,
  bot: Bot = SILENT,
): { events: SimEvent[]; round: InterludeState } {
  const events: SimEvent[] = [];
  const round = world.interlude;
  if (round === null) throw new Error("no round to run");
  for (let i = 0; i < cap && world.interlude !== null; i++) {
    step(world, bot(world));
    events.push(...world.events);
  }
  return { events, round };
}

describe("entering a round that is not the field", () => {
  it("is due in a gap and never in front of the first wave of a run", () => {
    const world = createWorld(CFG, 1);
    expect(interludeDue(world, 0)).toBe(false);
    expect(interludeDue(world, WAVE)).toBe(true);
  });

  it("is never due with the switch off, and never opens if one is tried", () => {
    const world = createWorld(DEFAULT_CONFIG, 1);
    expect(interludeDue(world, WAVE)).toBe(false);
    startInterlude(world, { kind: "gauge" }, WAVE);
    expect(interludeHolds(world)).toBe(false);
  });

  it("draws a band the needle is not already sitting in", () => {
    for (let seed = 0; seed < 12; seed++) {
      const world = open(seed);
      const gauge = world.interlude;
      expect(gauge).not.toBeNull();
      expect(gaugeSeated(world, gauge as InterludeState)).toBe(false);
    }
  });
});

describe("while a round is up", () => {
  it("the field is gone: nothing spawns, falls or reaches the hull", () => {
    const world = createWorld(CFG, 3);
    startWave(world, 1, [{ beat: 0, col: 2, kind: "meteor", color: null }]);
    // Past the wave's own card, so the field really is running when it stops.
    run(world, TPB * 3, (w) =>
      w.brief.due.length > 0 ? [cmd(w, 1, { kind: "brief" }), cmd(w, 2, { kind: "brief" })] : [],
    );
    const row = world.creatures[0]?.row ?? -1;
    const waveBeat = world.waveBeat;
    expect(row).toBeGreaterThan(0);

    startInterlude(world, { kind: "gauge" }, WAVE);
    run(world, TPB * 20);
    expect(world.creatures[0]?.row).toBe(row);
    expect(world.waveBeat).toBe(waveBeat);
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
    const needle = world.interlude?.needleMilli ?? -1;
    run(world, TPB * 2, (w) => [cmd(w, 1, { kind: "valve", on: true, dir: 1 })]);
    expect(world.interlude?.phase).toBe("lead");
    expect(world.interlude?.needleMilli).toBe(needle);
  });
});

describe("the two halves", () => {
  it("the reading player cannot turn", () => {
    const world = open();
    run(world, TPB * 10, (w) => [cmd(w, 2, { kind: "valve", on: true, dir: 1 })]);
    expect(world.interlude?.phase).toBe("play");
    expect(world.interlude?.valve).toBe(0);
    expect(world.interlude?.needleMilli).toBe(500);
  });

  it("the turning player cannot call", () => {
    const world = open();
    run(world, TPB * 30, (w) => {
      const gauge = w.interlude;
      if (gauge === null || gauge.phase !== "play") return [];
      const want = gauge.needleMilli < gauge.markMilli ? 1 : -1;
      const out = [cmd(w, 1, { kind: "valve", on: true, dir: want })];
      if (gaugeSeated(w, gauge)) out.push(cmd(w, 1, { kind: "call" }));
      return out;
    });
    expect(world.interlude?.marks).toBe(0);
    expect(world.interlude?.misses).toBe(0);
  });

  it("costs a call the same rest whether it landed or not", () => {
    const world = open();
    run(world, TPB * 5);
    const gauge = world.interlude;
    expect(gauge?.phase).toBe("play");
    // Two calls on the same beat, both wide of a band the pilot never moved
    // towards: the second is not heard at all, so it is not even a miss.
    step(world, [cmd(world, 2, { kind: "call" }), cmd(world, 2, { kind: "call" })]);
    expect(gauge?.misses).toBe(1);
    step(world, [cmd(world, 2, { kind: "call" })]);
    expect(gauge?.misses).toBe(1);
  });
});

describe("leaving a round", () => {
  it("is passed by talking, and hands the wave back that was waiting", () => {
    const world = open();
    const { events, round } = runToEnd(world, TPB * 200, talking);
    expect(round.marks).toBe(CFG.gaugeMarks);
    expect(round.passed).toBe(true);
    expect(events.some((e) => e.type === "needWave" && e.wave === WAVE)).toBe(true);
    expect(world.interludeDone).toBe(WAVE);
    // The wave that was behind it starts, and the round is not offered again.
    expect(interludeDue(world, WAVE)).toBe(false);
    startWave(world, WAVE, []);
    expect(world.interludeDone).toBe(NO_INTERLUDE);
  });

  it("is failed by saying nothing, and that costs time and nothing else", () => {
    const world = open();
    world.score = 700;
    world.scars = [{ col: 2, beat: 1, kind: "meteor" }];
    world.hullMilli = 61_000;
    const { events, round } = runToEnd(world, TPB * (CFG.gaugeRoundBeats + 20));
    expect(round.passed).toBe(false);
    expect(round.marks).toBe(0);
    expect(events.some((e) => e.type === "needWave" && e.wave === WAVE)).toBe(true);
    expect(world.score).toBe(700);
    expect(world.scars.length).toBe(1);
    expect(world.hullMilli).toBe(61_000);
    expect(world.over).toBe(false);
  });

  it("is left by a restart, which forgets the gaps as well as the round", () => {
    const world = open();
    run(world, TPB * 8);
    const events = run(world, 1, (w) => [cmd(w, 1, { kind: "restart" })]);
    expect(world.interlude).toBeNull();
    expect(world.interludeDone).toBe(NO_INTERLUDE);
    expect(events.some((e) => e.type === "needWave" && e.wave === 0)).toBe(true);
  });
});

describe("the fingerprint", () => {
  it("covers the round, so two devices cannot disagree about it silently", () => {
    const plain = createWorld(CFG, 9);
    const round = open(9);
    expect(hashWorld(round)).not.toBe(hashWorld(plain));

    const moved = open(9);
    run(moved, TPB * 8, (w) => [cmd(w, 1, { kind: "valve", on: true, dir: 1 })]);
    const still = open(9);
    run(still, TPB * 8);
    expect(moved.interlude?.needleMilli).not.toBe(still.interlude?.needleMilli);
    expect(hashWorld(moved)).not.toBe(hashWorld(still));
  });

  it("is the same on two runs of the same round, marks and all", () => {
    const a = open(21);
    const b = open(21);
    let seen = 0;
    for (let tick = 0; tick < TPB * 60; tick++) {
      step(a, talking(a));
      step(b, talking(b));
      seen = Math.max(seen, a.interlude?.marks ?? seen);
      if (tick % TPB === 0) expect(hashWorld(a)).toBe(hashWorld(b));
    }
    // Assert what the round did before asserting that two of them agree — a
    // pinned constant would pass on a round that never started
    // (`docs/decisions.md` #19).
    expect(seen).toBe(CFG.gaugeMarks);
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
