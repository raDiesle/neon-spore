/**
 * THE MAZE's grip: the heart holding the right shot until it is torn out by
 * hand (`maze-hand.ts`, the `grip` phase in `maze-round.ts`).
 *
 * Its own file rather than two more rows in `config-boss.ts`, which is at
 * its limit, and merged into `SimConfig` through `config-boss-clocks.ts` the
 * way THE MIRROR's `config-mirror.ts` is. The round's other clocks are
 * constants in `maze-clock.ts`; these two are dials rather than choreography
 * — how far a thumb has to pull before a pull is a tear, and how long the
 * heart holds on — and both are the difficulty of the gesture, which is what
 * a `SimConfig` field is for.
 */
export interface MazeGripConfig {
  /** Thousandths of a tile the navigator's thumb must carry the heart *down* before the shot is torn out. */
  mazeHeartPullMilli: number;
  /** Beats the heart holds the shot for the pull; past it, the heart lets go and the shot comes back. */
  mazeGripBeats: number;
}

export const MAZE_GRIP_DEFAULTS: MazeGripConfig = {
  mazeHeartPullMilli: 600,
  mazeGripBeats: 8,
};
