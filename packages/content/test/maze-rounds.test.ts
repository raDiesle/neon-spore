import { expect, test } from "bun:test";
import {
  type MazeWheel,
  mazeArc,
  mazeCoreEntrance,
  mazeFault,
  mazeSolveRoute,
} from "@neon-spore/sim";
import { MAZE_ROUNDS } from "../src/maze-rounds.js";

/**
 * THE MAZE's authored drum, checked where it is written.
 *
 * These used to live in `packages/sim/test/maze.test.ts`, which had to reach
 * across into `content` to read them — the dependency `sim` is not allowed to
 * have, arriving through the test graph instead of an import. Here it is the
 * permitted direction: `content` names `sim`'s rules and is judged by them.
 *
 * What is under test is the data, so nothing is copied: a local fixture would
 * prove nothing the moment the two drifted apart. `sim` keeps its own wheels
 * for the geometry, and they are allowed to be any legal wheels at all.
 */

test("every authored wheel is a wheel, with a way in that reaches the middle", () => {
  expect(MAZE_ROUNDS.length).toBeGreaterThan(0);
  for (const [i, wheel] of MAZE_ROUNDS.entries()) {
    expect(mazeFault(wheel), `round ${i}`).toBeNull();
    expect(mazeCoreEntrance(wheel), `round ${i}`).toBeGreaterThanOrEqual(0);
  }
});

/**
 * The shape of the fight the owner asked for: one more way in each round. Every
 * one of them reaches the middle — the walls of each sheet are a tree, so any
 * gap in the rim is joined to it — so what widens is the choice of which gap to
 * turn down onto the ship, never a gamble on whether it goes anywhere.
 */
test("each round has one more way in than the last, and all of them arrive", () => {
  expect(MAZE_ROUNDS.length).toBeGreaterThan(1);
  for (const [i, wheel] of MAZE_ROUNDS.entries()) {
    expect(wheel.entrances.length, `round ${i}`).toBe(i + 1);
    for (const [w, way] of wheel.entrances.entries()) {
      expect(way.route.at(-1)?.ring, `round ${i} way ${w}`).toBe(0);
    }
  }
});

/**
 * Two ways in on one rim are only a choice if they are far enough apart that
 * the pilot cannot fall into the wrong one on the way to the right one. An
 * eighth of a turn is the grid the walls stand on, so it is the floor here too.
 */
test("no two ways in on a rim are within an eighth of a turn of each other", () => {
  for (const [i, wheel] of MAZE_ROUNDS.entries()) {
    const angles = wheel.entrances.map((e) => e.angleMilli).sort((a, b) => a - b);
    for (const [w, angle] of angles.entries()) {
      const after = angles[(w + 1) % angles.length] ?? angle;
      if (angles.length < 2) continue;
      const apart = (after - angle + 360_000) % 360_000;
      expect(apart, `round ${i} way ${w}`).toBeGreaterThanOrEqual(45_000);
    }
  }
});

/**
 * The complaint this drum was written to answer, as an assertion: the shot
 * goes in at the one gap, turns only where the corridor turns, and arrives.
 * `mazeFault` above already re-checks the route against the walls; this says
 * out loud what that means for the thing a player watches.
 */
test("the shot crawls the corridors from the rim to the middle", () => {
  const wheel = MAZE_ROUNDS[0] as MazeWheel;
  const way = wheel.entrances[0];
  if (way === undefined) throw new Error("no way in");
  expect(way.route[0]).toEqual({ ring: wheel.rings, angleMilli: way.angleMilli });
  expect(way.route.at(-1)?.ring).toBe(0);
  expect(way.route.length).toBeGreaterThan(4);
  for (const [step, cell] of way.route.entries()) {
    const prev = way.route[step - 1];
    if (prev === undefined) continue;
    expect(Math.abs(prev.ring - cell.ring), `step ${step}`).toBe(1);
    expect(mazeArc(wheel, prev.ring, prev.angleMilli), `step ${step}`).toBe(
      mazeArc(wheel, prev.ring, cell.angleMilli),
    );
  }
});

/**
 * The walk itself, pinned. The sheet's walls are a tree over every room the
 * rim can reach, so there is exactly one way from the gap to the middle and it
 * is ten crossings long: out of the rim into ring 7, then in, in, in, back out
 * one, in again, and on to the middle. A route that had taken a wrong turn
 * anywhere would be longer than this, and a solver that stopped agreeing with
 * itself would be a desync nothing else in the game would notice.
 */
test("the way through the sheet is ten crossings, and always the same ten", () => {
  const wheel = MAZE_ROUNDS[0] as MazeWheel;
  const way = wheel.entrances[0];
  if (way === undefined) throw new Error("no way in");
  expect(way.route.map((s) => s.ring)).toEqual([7, 6, 5, 4, 5, 4, 3, 2, 1, 0]);
  expect(mazeSolveRoute(wheel, way.angleMilli)).toEqual(way.route);
});
