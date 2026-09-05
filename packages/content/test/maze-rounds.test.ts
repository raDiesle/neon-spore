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
 * The sheet the owner sent has one gap in its rim, so the round is bringing
 * that gap down onto a column rather than choosing between several. If a drum
 * with more ways in is ever authored, this is the line that will say so.
 */
test("the sheet has one way in, and every round is the same sheet", () => {
  const [first] = MAZE_ROUNDS;
  if (first === undefined) throw new Error("no rounds");
  for (const [i, wheel] of MAZE_ROUNDS.entries()) {
    expect(wheel.entrances.length, `round ${i}`).toBe(1);
    expect(wheel.walls, `round ${i}`).toEqual(first.walls);
    expect(wheel.openings, `round ${i}`).toEqual(first.openings);
  }
  // And they stand at three different angles, or the pair would be doing the
  // same pull three times over rather than finding the gap again.
  const angles = new Set(MAZE_ROUNDS.map((w) => w.startMilli));
  expect(angles.size).toBe(MAZE_ROUNDS.length);
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
