/**
 * THE MAZE's test rig: a wheel set and the gestures that drive it.
 *
 * The wheels are built here rather than imported from `content`. `sim` does
 * not depend on `content` and must not start to — a test that reaches across
 * for the authored drums drags the dependency in through the test graph, which
 * is the same edge in a place nobody looks. What the *authored* drums have to
 * satisfy is checked where they live, in `packages/content/test`.
 *
 * These three are shaped like the real ones — two ways in, then three, then
 * four, on rings that grow — because several cases here are about a wheel
 * getting harder round by round. Nothing else about them is load-bearing.
 */

import { startWave } from "../src/beat.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { step, ticksPerBeat } from "../src/index.js";
import type { MazeState } from "../src/maze-round.js";
import { type MazeMove, type MazeWheel, mazeRoute } from "../src/maze-wheel.js";
import type { Command, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type World } from "../src/world.js";

const wheel = (
  rings: number,
  sectors: number,
  startMilli: number,
  ways: readonly (readonly [number, readonly MazeMove[]])[],
): MazeWheel => {
  const shape = { rings, sectors };
  return {
    rings,
    sectors,
    startMilli,
    entrances: ways.map(([sector, moves]) => ({ sector, route: mazeRoute(shape, sector, moves) })),
  };
};

/** Two ways in, three rings — the smallest drum that still needs both verbs. */
export const PAIR: MazeWheel = wheel(3, 12, 15_000, [
  [0, ["cw", "in", "cw", "in"]],
  [5, ["ccw", "in", "ccw", "ccw"]],
]);

/** Three ways in, four rings. */
export const THREE: MazeWheel = wheel(4, 12, 200_000, [
  [1, ["cw", "in", "in", "cw", "in"]],
  [5, ["ccw", "in", "in", "ccw", "ccw"]],
  [9, ["in", "cw", "cw", "in", "cw"]],
]);

/** Four ways in, four rings, on a rim cut finer. */
export const FOUR: MazeWheel = wheel(4, 16, 330_000, [
  [0, ["cw", "in", "cw", "in", "in"]],
  [4, ["in", "ccw", "ccw", "in", "ccw"]],
  [8, ["ccw", "in", "in", "ccw", "ccw"]],
  [12, ["cw", "cw", "in", "cw", "in"]],
]);

/** The fight, in order: three wheels, each one finished taking a third. */
export const WHEELS: MazeWheel[] = [PAIR, THREE, FOUR];

// No regeneration: the breach has to be readable as an exact number, and three
// hull points a second would blur it inside the beat. `mirror.test.ts` says the
// same and for the same reason.
export const CFG = { ...DEFAULT_CONFIG, hullInvulnerable: false, hullRegenPerSecond: 0 };
export const TPB = ticksPerBeat(CFG);

export function install(rounds: MazeWheel[] = WHEELS): World {
  const world = createWorld(CFG, 0);
  startWave(world, 0, [], [], { kind: "maze", rounds });
  return world;
}

export function mazeOf(world: World): MazeState {
  const boss = world.boss;
  if (boss === null || boss.kind !== "maze") throw new Error("no maze installed");
  return boss;
}

/** Run until the wheel is up and the pair's turn has begun. */
export function untilReading(world: World): SimEvent[] {
  const seen: SimEvent[] = [];
  for (let i = 0; i < 5000 && mazeOf(world).phase !== "read"; i++) {
    step(world, []);
    seen.push(...world.events);
  }
  return seen;
}

export function send(world: World, player: 1 | 2, command: Command): SimEvent[] {
  const timed: TimedCommand = { tick: world.tick, player, command };
  step(world, [timed]);
  return [...world.events];
}

/**
 * Pull the string until the wanted way in clicks onto a column. This is the
 * pilot's whole verb: press, wait for the click, press again for the next one.
 */
export function clickOnto(world: World, way: number, dir: -1 | 1 = 1): number {
  for (let click = 0; click < 40; click++) {
    send(world, 1, { kind: "valve", on: true, dir });
    for (let i = 0; i < 6000 && mazeOf(world).lockedWay < 0; i++) step(world, []);
    const m = mazeOf(world);
    if (m.lockedWay === way) return m.lockedCol;
  }
  throw new Error(`way ${way} never clicked onto a column`);
}

/** Slide the cannon under the lit column and fire, which is the whole answer. */
export function fireInto(world: World, way: number): SimEvent[] {
  const col = clickOnto(world, way);
  const seen = send(world, 1, { kind: "cannonCol", col });
  seen.push(...send(world, 2, { kind: "fire", color: "red" }));
  return seen;
}

/** Run ticks until the boss is out of the phase it is in, or the count runs out. */
export function past(world: World, phase: string, ticks: number): SimEvent[] {
  const seen: SimEvent[] = [];
  for (let i = 0; i < ticks && world.boss !== null && mazeOf(world).phase === phase; i++) {
    step(world, []);
    seen.push(...world.events);
  }
  return seen;
}

/** Grab the handle, then report the hand at each of these displacements. */
export function drag(world: World, ...fromMilli: number[]): void {
  send(world, 1, { kind: "drag", target: "mazeString", on: true, fromMilli: 0 });
  for (const f of fromMilli) {
    send(world, 1, { kind: "drag", target: "mazeString", on: true, fromMilli: f });
  }
}
