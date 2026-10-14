/**
 * THE MAZE's grip: the heart holding the right shot until the pair rubs it
 * loose (`maze-hand.ts`, `maze-rub.ts`, the `grip` phase in `maze-round.ts`).
 *
 * Its own file rather than more rows in `config-boss.ts`, which is at its
 * limit, and merged into `SimConfig` through `config-boss-clocks.ts` the way
 * THE MIRROR's `config-mirror.ts` is. The round's other clocks are constants
 * in `maze-clock.ts`; these are dials rather than choreography — how much
 * rubbing tears the heart out, and how long it holds on — and both are the
 * difficulty of the gesture, which is what a `SimConfig` field is for.
 */
export interface MazeGripConfig {
  /**
   * Turns a thumb must make on the heart in all, between both seats, to tear
   * it out — reversals, as every rub counts. Half of it is each seat's, so
   * both thumbs have to rub. Sixteen, eight a seat: about the nine passes
   * across its room each seat's shake took before it was a rub.
   */
  mazeHeartTurns: number;
  /** Beats the heart holds the shot for the rub; past it, the heart lets go and the shot comes back. */
  mazeGripBeats: number;
}

export const MAZE_GRIP_DEFAULTS: MazeGripConfig = {
  mazeHeartTurns: 16,
  // Twelve rather than the pull's eight: eight turns each is a longer
  // gesture than one pull down, and the read before it is shorter.
  mazeGripBeats: 12,
};
