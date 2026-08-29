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
  MAZE_TURN,
  mazeCosMilli,
  mazeEntranceCol,
  mazeEntranceX,
  mazeRadiusMilli,
  mazeSinMilli,
} from "../src/maze.js";
import {
  MAZE_LEAD_BEATS,
  MAZE_TRAVEL_BEATS,
  type MazeState,
  mazeReadBeats,
} from "../src/maze-round.js";
import { type MazeWheel, mazeCoreEntrance, mazeFault } from "../src/maze-wheel.js";
import type { Command, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type World } from "../src/world.js";

/**
 * THE MAZE, played out headlessly.
 *
 * Three things are under test and the first is the bridge. The pair talks in
 * columns and an angle is not a column, so the click is what keeps the game's
 * vocabulary: the wheel must never be able to turn *past* a column between two
 * ticks, or the pilot would be pulling at something with holes in it. That is
 * arithmetic between two config numbers and it is checked as arithmetic.
 *
 * The second is the wheel: every authored drum is a legal drum, exactly one
 * way in reaches the middle, and none of them is solvable by looking — nothing
 * about the corridors is drawn, so the shot is the only thing that finds out.
 *
 * The third is the round: the middle takes a share of the boss, a dead end
 * breaks the hull in the column the shot went up and leaves the wheel standing
 * for another go, and saying nothing at all costs the same as a dead end.
 */

// No regeneration: the breach has to be readable as an exact number, and three
// hull points a second would blur it inside the beat. `mirror.test.ts` says the
// same and for the same reason.
const CFG = { ...DEFAULT_CONFIG, hullInvulnerable: false, hullRegenPerSecond: 0 };
const TPB = ticksPerBeat(CFG);

function install(rounds: MazeWheel[] = MAZE_ROUNDS): World {
  const world = createWorld(CFG, 0);
  startWave(world, 0, [], [], { kind: "maze", rounds });
  return world;
}

function mazeOf(world: World): MazeState {
  const boss = world.boss;
  if (boss === null || boss.kind !== "maze") throw new Error("no maze installed");
  return boss;
}

/** Run until the wheel is up and the pair's turn has begun. */
function untilReading(world: World): SimEvent[] {
  const seen: SimEvent[] = [];
  for (let i = 0; i < 5000 && mazeOf(world).phase !== "read"; i++) {
    step(world, []);
    seen.push(...world.events);
  }
  return seen;
}

function send(world: World, player: 1 | 2, command: Command): SimEvent[] {
  const timed: TimedCommand = { tick: world.tick, player, command };
  step(world, [timed]);
  return [...world.events];
}

/**
 * Pull the string until the wanted way in clicks onto a column. This is the
 * pilot's whole verb: press, wait for the click, press again for the next one.
 */
function clickOnto(world: World, way: number, dir: -1 | 1 = 1): number {
  for (let click = 0; click < 40; click++) {
    send(world, 1, { kind: "valve", on: true, dir });
    for (let i = 0; i < 6000 && mazeOf(world).lockedWay < 0; i++) step(world, []);
    const m = mazeOf(world);
    if (m.lockedWay === way) return m.lockedCol;
  }
  throw new Error(`way ${way} never clicked onto a column`);
}

/** Slide the cannon under the lit column and fire, which is the whole answer. */
function fireInto(world: World, way: number): SimEvent[] {
  const col = clickOnto(world, way);
  const seen = send(world, 1, { kind: "cannonCol", col });
  seen.push(...send(world, 2, { kind: "fire", color: "red" }));
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

test("the click is wider than a tick, so no column can be turned past", () => {
  // The furthest the rim can move across the field in one tick is at the
  // bottom of the wheel, where the mouth is travelling straight sideways.
  const step1 = Math.abs(mazeEntranceX({ ...CFG }, MAZE_ROUNDS[0]!, CFG.mazeTurnMilli, 0));
  const perTick = Math.round((mazeRadiusMilli(CFG) * mazeSinMilli(CFG.mazeTurnMilli)) / 1000);
  expect(step1).toBeGreaterThan(0);
  expect(perTick).toBeGreaterThan(0);
  expect(CFG.mazeSnapMilli).toBeGreaterThan(perTick);
  // And narrower than a fifth of a tile, so a lit mouth reads as standing on
  // the column rather than merely near it.
  expect(CFG.mazeSnapMilli).toBeLessThan(200);
});

test("the wheel is about six sevenths of the field, and clears the hull", () => {
  const radius = mazeRadiusMilli(CFG);
  // Six sevenths of the width, to within a thousandth of a column.
  expect(2 * radius).toBeGreaterThan(Math.round((CFG.cols * 6000) / 7) - 20);
  expect(2 * radius).toBeLessThan(Math.round((CFG.cols * 6000) / 7) + 20);
  // And it never reaches the columns at the very edge, so the cannon always
  // has hull either side of whatever is lit.
  expect(radius).toBeLessThan(CFG.cols * 500);
});

test("every column the wheel can reach is one the pilot can actually click", () => {
  const wheel = MAZE_ROUNDS[0]!;
  const found = new Set<number>();
  let angle = 0;
  for (let i = 0; i < 4000; i++) {
    angle = (angle + CFG.mazeTurnMilli) % MAZE_TURN;
    const col = mazeEntranceCol(CFG, wheel, angle, 0);
    if (col >= 0) found.add(col);
  }
  // Every column under the near half of the rim, and nothing outside it.
  expect(found.size).toBeGreaterThanOrEqual(CFG.cols - 4);
  for (const col of found) {
    expect(col).toBeGreaterThanOrEqual(0);
    expect(col).toBeLessThan(CFG.cols);
  }
});

test("the sine table is a sine, and the near half of the rim is the near half", () => {
  expect(mazeSinMilli(0)).toBe(0);
  expect(mazeSinMilli(90_000)).toBe(1000);
  expect(mazeSinMilli(270_000)).toBe(-1000);
  expect(mazeCosMilli(0)).toBe(1000);
  expect(mazeCosMilli(180_000)).toBe(-1000);
  // Every angle, forwards and backwards, agrees with itself.
  for (let a = 0; a < MAZE_TURN; a += 997) {
    expect(mazeSinMilli(a)).toBe(mazeSinMilli(a + MAZE_TURN));
    expect(Math.abs(mazeSinMilli(a))).toBeLessThanOrEqual(1000);
  }
});

test("every authored wheel is a wheel, with exactly one way to the middle", () => {
  expect(MAZE_ROUNDS.length).toBeGreaterThan(0);
  for (const [i, wheel] of MAZE_ROUNDS.entries()) {
    expect(mazeFault(wheel), `round ${i}`).toBeNull();
    expect(mazeCoreEntrance(wheel), `round ${i}`).toBeGreaterThanOrEqual(0);
    expect(wheel.entrances.length, `round ${i}`).toBeGreaterThanOrEqual(2);
  }
});

test("the wheels get harder by widening the search", () => {
  const ways = MAZE_ROUNDS.map((w) => w.entrances.length);
  for (let i = 1; i < ways.length; i++) expect(ways[i]!).toBeGreaterThan(ways[i - 1]!);
});

test("a broken wheel is refused rather than played", () => {
  const good = MAZE_ROUNDS[0]!;
  expect(mazeFault({ ...good, rings: 1 })).not.toBeNull();
  expect(mazeFault({ ...good, entrances: [good.entrances[0]!] })).not.toBeNull();
  expect(mazeFault({ ...good, startMilli: -1 })).not.toBeNull();
  // Two ways to the middle is a round with nothing to choose.
  const twice = { ...good, entrances: [good.entrances[0]!, { ...good.entrances[0]!, sector: 3 }] };
  expect(mazeFault(twice)).not.toBeNull();
  // And a route that steps sideways and inward at once is through a wall.
  const through = {
    ...good,
    entrances: [
      {
        sector: 0,
        route: [
          { ring: good.rings - 1, sector: 0 },
          { ring: good.rings - 2, sector: 1 },
        ],
      },
      good.entrances[1]!,
    ],
  };
  expect(mazeFault(through)).toBe("way 0 steps through a wall at 1");
});

test("the string is the pilot's, and player 2 cannot turn the wheel", () => {
  const world = install();
  untilReading(world);
  const before = mazeOf(world).angleMilli;
  send(world, 2, { kind: "valve", on: true, dir: 1 });
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  expect(mazeOf(world).angleMilli).toBe(before);
  expect(mazeOf(world).turn).toBe(0);
});

test("a way in clicks onto a column and the wheel stops itself there", () => {
  const world = install();
  untilReading(world);
  send(world, 1, { kind: "valve", on: true, dir: 1 });
  for (let i = 0; i < 6000 && mazeOf(world).lockedWay < 0; i++) step(world, []);
  const m = mazeOf(world);
  expect(m.lockedWay).toBeGreaterThanOrEqual(0);
  expect(m.lockedCol).toBeGreaterThanOrEqual(0);
  expect(m.turn).toBe(0);
  // Exactly on the column, not merely near it.
  const x = mazeEntranceX(CFG, mazeOf(world).rounds[0]!, m.angleMilli, m.lockedWay);
  expect(Math.abs(x - (m.lockedCol * 1000 + 500))).toBeLessThanOrEqual(2);
  // And it stays there with the thumb still down: only a fresh pull moves on.
  const held = m.angleMilli;
  for (let i = 0; i < TPB * 6; i++) step(world, []);
  expect(mazeOf(world).angleMilli).toBe(held);
  send(world, 1, { kind: "valve", on: true, dir: 1 });
  for (let i = 0; i < TPB; i++) step(world, []);
  expect(mazeOf(world).angleMilli).not.toBe(held);
});

test("a shot from anywhere but the lit column is not an answer at all", () => {
  const world = install();
  untilReading(world);
  const col = clickOnto(world, mazeCoreEntrance(MAZE_ROUNDS[0]!));
  send(world, 1, { kind: "cannonCol", col: col === 0 ? col + 1 : col - 1 });
  send(world, 2, { kind: "fire", color: "red" });
  expect(mazeOf(world).phase).toBe("read");
  expect(mazeOf(world).way).toBe(-1);
});

test("the way in that reaches the middle takes a share of the boss", () => {
  const world = install();
  untilReading(world);
  const answer = mazeCoreEntrance(MAZE_ROUNDS[0]!);
  const hull = world.hullMilli;
  const seen = fireInto(world, answer);
  expect(mazeOf(world).phase).toBe("travel");

  seen.push(...past(world, "travel", TPB * 200));
  const verdict = seen.filter((e) => e.type === "mazeVerdict");
  expect(verdict).toHaveLength(1);
  expect(verdict[0]).toMatchObject({ right: true });
  // The shot is watched all the way in, one report per cell it stands on.
  expect(seen.filter((e) => e.type === "mazeProbe").length).toBe(
    MAZE_ROUNDS[0]!.entrances[answer]!.route.length,
  );
  expect(world.hullMilli).toBe(hull);
  expect(mazeOf(world).hullMilli).toBe(100_000 - Math.round(100_000 / MAZE_ROUNDS.length));
});

test("a dead end costs the hull and leaves the wheel standing for another go", () => {
  const world = install();
  untilReading(world);
  const answer = mazeCoreEntrance(MAZE_ROUNDS[0]!);
  const dud = (answer + 1) % MAZE_ROUNDS[0]!.entrances.length;
  const before = world.hullMilli;
  const col = (() => {
    const c = clickOnto(world, dud);
    send(world, 1, { kind: "cannonCol", col: c });
    send(world, 2, { kind: "fire", color: "red" });
    return c;
  })();
  const seen = past(world, "travel", TPB * 200);
  const breach = seen.filter((e) => e.type === "breach");
  expect(breach).toHaveLength(1);
  expect(breach[0]).toMatchObject({ col });
  expect(before - world.hullMilli).toBe(CFG.damageMaze * 1000);

  // The verdict stands, and then the same wheel is there to try again — with
  // the dead end remembered, which is what the next attempt is talked about.
  past(world, "verdict", TPB * (1 + 8));
  expect(mazeOf(world).phase).toBe("read");
  expect(mazeOf(world).round).toBe(0);
  expect(mazeOf(world).tried).toEqual([dud]);
  expect(mazeOf(world).hullMilli).toBe(100_000);
});

test("saying nothing at all costs the same as a dead end", () => {
  const world = install();
  untilReading(world);
  const before = world.hullMilli;
  const seen = past(world, "read", TPB * (mazeReadBeats(MAZE_ROUNDS[0]!.entrances.length) + 4));
  const verdict = seen.filter((e) => e.type === "mazeVerdict");
  expect(verdict).toHaveLength(1);
  expect(verdict[0]).toMatchObject({ right: false, reason: "silence" });
  expect(before - world.hullMilli).toBe(CFG.damageMaze * 1000);
});

test("three wheels finished bring it down", () => {
  const world = install();
  for (let round = 0; round < MAZE_ROUNDS.length; round++) {
    untilReading(world);
    expect(mazeOf(world).round).toBe(round);
    fireInto(world, mazeCoreEntrance(MAZE_ROUNDS[round]!));
    past(world, "travel", TPB * 200);
    past(world, "verdict", TPB * 8);
  }
  expect(world.boss).toBeNull();
});

test("the wheel opens quiet, and the string does nothing until it does not", () => {
  const world = install();
  expect(mazeOf(world).phase).toBe("lead");
  for (let i = 0; i < TPB * (MAZE_LEAD_BEATS - 1); i++) step(world, []);
  expect(mazeOf(world).phase).toBe("lead");
  for (let i = 0; i < TPB * 2; i++) step(world, []);
  expect(mazeOf(world).phase).toBe("read");
  expect(MAZE_TRAVEL_BEATS).toBeGreaterThan(0);
});

test("two worlds turning the same wheel the same way agree about where it is", () => {
  const a = install();
  const b = install();
  for (const world of [a, b]) {
    untilReading(world);
    send(world, 1, { kind: "valve", on: true, dir: -1 });
    for (let i = 0; i < 900; i++) step(world, []);
  }
  expect(hashWorld(a)).toBe(hashWorld(b));
  expect(mazeOf(a).angleMilli).toBe(mazeOf(b).angleMilli);

  // And two different wheels are two different fingerprints, which is what
  // makes the hash worth taking at all.
  const c = install([MAZE_ROUNDS[0]!]);
  const d = install([MAZE_ROUNDS[1]!]);
  expect(hashWorld(c)).not.toBe(hashWorld(d));
});
