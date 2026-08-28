import { expect, test } from "bun:test";
// By path, and not by package name: `sim` does not depend on `content` and
// must not start to. What is under test here is the authored data itself, so
// a local copy of it would prove nothing the moment the two drifted apart.
import { MAZE_ROUNDS } from "../../content/src/maze-rounds.js";
import { startWave } from "../src/beat.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { step, ticksPerBeat } from "../src/index.js";
import {
  MAZE_MOUTHS,
  type MazeTangle,
  mazeFault,
  mazeGoodMouth,
  mazeMouthCol,
  mazeMouthsFor,
  mazePath,
} from "../src/maze.js";
import {
  MAZE_LEAD_BEATS,
  MAZE_TRAVEL_BEATS,
  type MazeState,
  mazeReadBeats,
} from "../src/maze-round.js";
import type { Command, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type World } from "../src/world.js";

/**
 * THE MAZE, played out headlessly.
 *
 * Two different things are under test and the first one is the boss. A round
 * whose answer either player could work out on their own screen is a solo
 * puzzle with an audience, so the split is checked as arithmetic rather than
 * trusted to the picture: for every authored tangle, the pilot's half alone
 * leaves at least two mouths possible, the navigator's half alone leaves at
 * least two, and only the two halves together leave one. Nothing about how it
 * is drawn can weaken that, and nothing about how it is drawn can rescue it.
 *
 * The second is the round: a right mouth takes a share of the boss, a wrong
 * one breaks the hull in the mouth it went down, and saying nothing at all is
 * the same answer as the wrong mouth.
 */

// No regeneration: the breach has to be readable as an exact number, and three
// hull points a second would blur it inside the beat. `mirror.test.ts` says the
// same and for the same reason.
const CFG = { ...DEFAULT_CONFIG, hullInvulnerable: false, hullRegenPerSecond: 0 };
const TPB = ticksPerBeat(CFG);

function install(rounds: MazeTangle[] = MAZE_ROUNDS): World {
  const world = createWorld(CFG, 0);
  startWave(world, 0, [], [], { kind: "maze", rounds });
  return world;
}

function mazeOf(world: World): MazeState {
  const boss = world.boss;
  if (boss === null || boss.kind !== "maze") throw new Error("no maze installed");
  return boss;
}

/** Run until the tangle is up and the pair's turn has begun. */
function untilReading(world: World): SimEvent[] {
  const seen: SimEvent[] = [];
  for (let i = 0; i < 5000 && mazeOf(world).phase !== "read"; i++) {
    step(world, []);
    seen.push(...world.events);
  }
  return seen;
}

/** Slide the cannon under a mouth and fire, which is the whole of the answer. */
function fireInto(world: World, mouth: number): SimEvent[] {
  const seen: SimEvent[] = [];
  const col = mazeMouthCol(world.cfg, mouth);
  const moves: Command[] = [
    { kind: "cannonCol", col },
    { kind: "fire", color: "red" },
  ];
  for (const command of moves) {
    const timed: TimedCommand = { tick: world.tick, player: 1, command };
    step(world, [timed]);
    seen.push(...world.events);
  }
  return seen;
}

/** Run ticks until the boss is out of the phase it is in, or the count runs out. */
function past(world: World, phase: string, ticks: number): SimEvent[] {
  const seen: SimEvent[] = [];
  for (let i = 0; i < ticks && world.boss !== null && mazeOf(world).phase === phase; i++) {
    step(world, []);
    seen.push(...world.events);
  }
  return seen;
}

test("every authored tangle is a round, and has exactly one answer", () => {
  expect(MAZE_ROUNDS.length).toBeGreaterThan(0);
  for (const [i, tangle] of MAZE_ROUNDS.entries()) {
    expect(mazeFault(tangle), `round ${i}`).toBeNull();
    expect(mazeMouthsFor(tangle, 0), `round ${i}`).toHaveLength(1);
  }
});

test("neither player can find the path alone, and together they can", () => {
  for (const [i, tangle] of MAZE_ROUNDS.entries()) {
    const answer = mazeGoodMouth(tangle);
    // The pilot sees the forks. Every arm of every node might be the way out,
    // so more than one mouth still reaches the core on his screen.
    const pilot = mazeMouthsFor(tangle, 1);
    // The navigator sees the walls. Every direction that is not walled might
    // be the way out, so the same is true of hers.
    const navigator = mazeMouthsFor(tangle, 2);
    expect(pilot.length, `round ${i}: the pilot alone`).toBeGreaterThan(1);
    expect(navigator.length, `round ${i}: the navigator alone`).toBeGreaterThan(1);
    // And the answer is in both of their lists, so neither of them is even
    // able to rule it out and hand the other a shorter question.
    expect(pilot, `round ${i}`).toContain(answer);
    expect(navigator, `round ${i}`).toContain(answer);
    // Put the halves together and there is exactly one mouth left.
    expect(mazeMouthsFor(tangle, 0)).toEqual([answer]);
  }
});

test("the strand from every mouth crosses the whole tangle", () => {
  for (const tangle of MAZE_ROUNDS) {
    for (let mouth = 0; mouth < MAZE_MOUTHS; mouth++) {
      expect(mazePath(tangle, mouth)).toHaveLength(tangle.nodes.length + 1);
    }
  }
});

test("the mouths stand apart, on the field the wave is played on", () => {
  const cols = new Set<number>();
  for (let mouth = 0; mouth < MAZE_MOUTHS; mouth++) {
    const col = mazeMouthCol(CFG, mouth);
    expect(col).toBeGreaterThanOrEqual(0);
    expect(col).toBeLessThan(CFG.cols);
    cols.add(col);
  }
  expect(cols.size).toBe(MAZE_MOUTHS);
});

test("the right mouth takes a share of the boss and costs the ship nothing", () => {
  const world = install();
  untilReading(world);
  const before = world.hullMilli;
  const answer = mazeGoodMouth(MAZE_ROUNDS[0]!);
  fireInto(world, answer);
  expect(mazeOf(world).phase).toBe("travel");

  const seen = past(world, "travel", TPB * 40);
  const verdict = seen.filter((e) => e.type === "mazeVerdict");
  expect(verdict).toHaveLength(1);
  expect(verdict[0]).toMatchObject({ right: true, col: mazeMouthCol(CFG, answer) });
  expect(world.hullMilli).toBe(before);
  // A third of the boss, because three rounds were authored.
  expect(mazeOf(world).hullMilli).toBe(100_000 - Math.round(100_000 / MAZE_ROUNDS.length));
});

test("a wrong mouth breaches the hull in the mouth it went down", () => {
  const world = install();
  untilReading(world);
  const before = world.hullMilli;
  const answer = mazeGoodMouth(MAZE_ROUNDS[0]!);
  const wrong = (answer + 1) % MAZE_MOUTHS;
  fireInto(world, wrong);

  const seen = past(world, "travel", TPB * 40);
  const breach = seen.filter((e) => e.type === "breach");
  expect(breach).toHaveLength(1);
  expect(breach[0]).toMatchObject({ col: mazeMouthCol(CFG, wrong) });
  expect(before - world.hullMilli).toBe(CFG.damageMaze * 1000);
  // The boss is untouched, and the same tangle is asked again: the pair failed
  // to read it, not to keep up with it.
  expect(mazeOf(world).hullMilli).toBe(100_000);
  past(world, "verdict", TPB * 20);
  expect(mazeOf(world).round).toBe(0);
});

test("saying nothing is the wrong answer too", () => {
  const world = install();
  untilReading(world);
  const before = world.hullMilli;
  const seen = past(world, "read", TPB * (mazeReadBeats(MAZE_ROUNDS[0]!.nodes.length) + 4));
  const verdict = seen.filter((e) => e.type === "mazeVerdict");
  expect(verdict).toHaveLength(1);
  expect(verdict[0]).toMatchObject({ right: false, reason: "silence" });
  expect(world.hullMilli).toBeLessThan(before);
});

test("a shot from between the mouths is not an answer at all", () => {
  const world = install();
  untilReading(world);
  const between = mazeMouthCol(CFG, 0) + 1;
  expect(mazeMouthCol(CFG, 1)).not.toBe(between);
  step(world, [{ tick: world.tick, player: 1, command: { kind: "cannonCol", col: between } }]);
  step(world, [{ tick: world.tick, player: 2, command: { kind: "fire", color: "cyan" } }]);
  expect(mazeOf(world).phase).toBe("read");
  expect(mazeOf(world).mouth).toBe(-1);
});

test("three rounds answered bring it down, and the wave is over", () => {
  const world = install();
  for (let round = 0; round < MAZE_ROUNDS.length; round++) {
    untilReading(world);
    expect(mazeOf(world).round).toBe(round);
    fireInto(world, mazeGoodMouth(MAZE_ROUNDS[round]!));
    past(world, "travel", TPB * 40);
    past(world, "verdict", TPB * 20);
  }
  expect(world.boss).toBeNull();
  expect(world.hullMilli).toBe(100_000);
});

test("the tangle, the mouth and the shot's place on the path are all hashed", () => {
  const a = install();
  const b = install();
  untilReading(a);
  untilReading(b);
  expect(hashWorld(a)).toBe(hashWorld(b));

  // Two devices that disagree about which mouth was chosen disagree about the
  // world, and the fingerprint has to say so before the verdict does.
  fireInto(a, 0);
  fireInto(b, 1);
  expect(hashWorld(a)).not.toBe(hashWorld(b));

  // And so does a step down the tangle: the shot is on a different node.
  const c = install();
  const d = install();
  untilReading(c);
  untilReading(d);
  fireInto(c, 0);
  fireInto(d, 0);
  for (let i = 0; i < TPB * MAZE_TRAVEL_BEATS; i++) step(c, []);
  expect(hashWorld(c)).not.toBe(hashWorld(d));

  // A tangle swapped under one device and nothing else changed is a desync,
  // which is the whole reason the lattice itself is in the fingerprint.
  const e = install([MAZE_ROUNDS[0]!]);
  const f = install([MAZE_ROUNDS[1]!]);
  untilReading(e);
  untilReading(f);
  expect(hashWorld(e)).not.toBe(hashWorld(f));
});

test("the count-in stands before the pair is asked anything", () => {
  const world = install();
  expect(mazeOf(world).phase).toBe("lead");
  for (let i = 0; i < TPB * (MAZE_LEAD_BEATS - 1); i++) step(world, []);
  expect(mazeOf(world).phase).toBe("lead");
  untilReading(world);
  expect(mazeOf(world).phase).toBe("read");
});
