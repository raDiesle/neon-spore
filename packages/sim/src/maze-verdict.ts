import { breachHull } from "./hull.js";
import { enterMazePhase, type MazeState, type MazeVerdictReason } from "./maze-round.js";
import { MILLI, type World } from "./world.js";

/**
 * How an attempt on THE MAZE ends, and what it costs.
 *
 * Its own file because `maze-round.ts` was past the ceiling `CLAUDE.md` sets,
 * and along the seam already there: next door is the round's *clock* — four
 * phases and a shot walking — and this is the three ways out of it. Nothing
 * here reads a wheel; everything here writes a hull.
 */

/** A dead end, or nothing at all. Out of the column it went up. */
export function mazeWrong(world: World, m: MazeState, reason: MazeVerdictReason): void {
  const col = m.lockedCol < 0 ? world.cannonCol : m.lockedCol;
  m.verdict = -1;
  m.verdictCol = col;
  enterMazePhase(m, "verdict", world.beat);
  breachHull(world, col, "meteorFastest", world.cfg.mazeRow, world.cfg.damageMaze);
  world.events.push({ type: "mazeVerdict", right: false, col, reason });
}

/** The shot reached the middle. It takes its share of the maze's hull — one per
 * authored wheel, so the last one brings it down however many there are. */
export function mazeRight(world: World, m: MazeState): void {
  const col = m.lockedCol;
  m.verdict = 1;
  m.verdictCol = col;
  enterMazePhase(m, "verdict", world.beat);

  const done = m.round + 1;
  const total = Math.max(1, m.rounds.length);
  m.hullMilli = Math.max(0, 100 * MILLI - Math.round((done * 100 * MILLI) / total));
  m.scars.push({ col, beat: world.beat, kind: "meteorFastest" });
  if (m.scars.length > world.cfg.maxScars) m.scars.shift();
  world.score += world.cfg.scoreMazeRound;
  world.events.push({ type: "mazeVerdict", right: true, col, reason: "mouth" });
}

/**
 * The verdict is over. The middle moves the fight to the next wheel; a dead
 * end goes back to the same one, which is standing exactly where it was left
 * with the route that failed still on it. That is the whole difference between
 * this boss and one the pair only waits out.
 */
export function mazeSettle(world: World, m: MazeState): void {
  if (m.verdict !== 1) {
    m.way = -1;
    m.shotColor = -1;
    m.step = 0;
    m.phase = "read";
    m.phaseBeat = world.beat;
    return;
  }
  if (m.hullMilli <= 0) {
    world.score += world.cfg.scoreMazeDown;
    world.boss = null;
    world.events.push({ type: "mazeDown", col: m.verdictCol });
    return;
  }
  m.round += 1;
  enterMazePhase(m, "lead", world.beat);
}
