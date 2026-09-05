import { breachHull } from "./hull.js";
import { enterMazePhase, type MazeState } from "./maze-round.js";
import { MILLI, type World } from "./world.js";

/**
 * How an attempt on THE MAZE ends, and what it costs.
 *
 * Its own file because `maze-round.ts` was past the ceiling `CLAUDE.md` sets,
 * and along the seam already there: next door is the round's *clock* — four
 * phases and a shot walking — and this is the three ways out of it. Nothing
 * here reads a wheel; everything here writes a hull.
 */

/**
 * Why an attempt was lost: a dead end, the wrong colour at the heart, or
 * nothing fired at all. All three cost the hull the same; what they are for is
 * the sentence the pair says before the next attempt, which is different in
 * each case — and, for a dead end, the fact that the drum does not survive it.
 *
 * The list is ordered rather than a bare union because `mazeHashParts` sends
 * the *index* over the wire, the way `MAZE_PHASES` is sent.
 */
export const MAZE_REASONS = ["mouth", "color", "silence"] as const;
export type MazeVerdictReason = (typeof MAZE_REASONS)[number];

/** A dead end, or nothing at all. Out of the column it went up. */
export function mazeWrong(world: World, m: MazeState, reason: MazeVerdictReason): void {
  const col = m.lockedCol < 0 ? world.cannonCol : m.lockedCol;
  m.verdict = -1;
  m.verdictCol = col;
  m.lost = reason;
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

  m.lost = null;

  const done = m.round + 1;
  const total = Math.max(1, m.rounds.length);
  m.hullMilli = Math.max(0, 100 * MILLI - Math.round((done * 100 * MILLI) / total));
  m.scars.push({ col, beat: world.beat, kind: "meteorFastest" });
  if (m.scars.length > world.cfg.maxScars) m.scars.shift();
  world.score += world.cfg.scoreMazeRound;
  world.events.push({ type: "mazeVerdict", right: true, col, reason: "mouth" });
}

/**
 * The verdict is over, and there are three ways on from it.
 *
 * **The middle moves the fight to the next wheel.** That is the only way
 * forward there is.
 *
 * **A dead end takes the drum with it.** The shot is lost in a region that
 * does not join the middle, the whole maze comes apart over the ship, and the
 * *same* stage is built again from the top — back at its opening angle with
 * nothing ruled out. The owner asked for exactly that, and it is what makes a
 * wrong gap cost something a pair can feel: not a wasted attempt but the stage
 * over again. The heart is untouched by it — the hull it has already lost
 * stays lost, and the blood stays on the floor (`render/maze-blood.ts`), so
 * the fight never goes backwards even when a stage does.
 *
 * **Anything else goes straight back to reading the same wheel**, standing
 * exactly where it was left. A shot refused at the heart for its colour never
 * touched the walls, so there is nothing for them to be shaken by.
 */
export function mazeSettle(world: World, m: MazeState): void {
  if (m.verdict !== 1) {
    if (m.lost === "mouth") {
      enterMazePhase(m, "lead", world.beat);
      return;
    }
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
  mazeOpenRound(world, m, m.round + 1);
}

/**
 * Stand the wheel up on a numbered round, from the top.
 *
 * The one way in to a round of this fight, so the fight's own settle and a
 * caller jumping to a sheet cannot disagree about what a round *is*: the angle
 * comes off the new wheel's `startMilli` and the lock, the way and the step go
 * (`enterMazePhase`'s `lead` branch). Writing `round` and leaving the rest is
 * how the drum comes up at the last round's angle with its lock still on.
 */
export function mazeOpenRound(world: World, m: MazeState, round: number): void {
  m.round = Math.max(0, Math.min(m.rounds.length - 1, round));
  enterMazePhase(m, "lead", world.beat);
}
