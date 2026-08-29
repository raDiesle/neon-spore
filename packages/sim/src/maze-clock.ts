/**
 * THE MAZE's clock: how long each part of a round stands, in beats.
 *
 * Split out of `maze-round.ts` rather than kept beside the fight, for the
 * reason that file's own header gives about `maze.ts` — the numbers are the
 * round's tempo and can be read, argued with and changed without the four
 * phases, the string and the shot's walk being in front of you. Nothing here
 * knows what a world is.
 */

/** Beats of quiet before a fresh wheel is up. */
export const MAZE_LEAD_BEATS = 3;

/**
 * How long the pair has for one attempt: this much per way in, plus a flat
 * allowance. Generous for the reason THE MIRROR's clock is — a pair still
 * saying "no, the *other* one" has not failed at what the boss is testing.
 */
export const MAZE_READ_PER_WAY = 10;
export const MAZE_READ_SLACK = 14;

export function mazeReadBeats(ways: number): number {
  return ways * MAZE_READ_PER_WAY + MAZE_READ_SLACK;
}

/** Beats the shot spends on each cell. One, so the walk reads at tempo. */
export const MAZE_TRAVEL_BEATS = 1;

/** Beats the verdict stands before the pair may go again. */
export const MAZE_VERDICT_BEATS = 3;
