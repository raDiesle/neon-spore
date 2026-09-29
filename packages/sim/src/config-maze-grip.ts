/**
 * THE MAZE's grip: the heart holding the right shot until the pair shakes it
 * loose (`maze-hand.ts`, `maze-shake.ts`, the `grip` phase in `maze-round.ts`).
 *
 * Its own file rather than more rows in `config-boss.ts`, which is at its
 * limit, and merged into `SimConfig` through `config-boss-clocks.ts` the way
 * THE MIRROR's `config-mirror.ts` is. The round's other clocks are constants
 * in `maze-clock.ts`; these are dials rather than choreography — how far the
 * heart can swing inside its room, how much swinging tears it out, and how
 * long the heart holds on — and all three are the difficulty of the gesture,
 * which is what a `SimConfig` field is for.
 */
export interface MazeGripConfig {
  /**
   * How far the heart's middle may be carried from the room's, in thousandths
   * of the room's radius: to where the muscle at rest meets the wall. One pull
   * is never longer than this across, which is what makes the tear a shake.
   */
  mazeHeartFreeMilli: number;
  /**
   * How far the heart must be carried in all, back and forth, in widths of its
   * room — the owner, 29 September 2026: *around 8 times the width of inner
   * circle*. Half of it is each seat's, so both thumbs have to shake.
   */
  mazeShakeWidths: number;
  /** Beats the heart holds the shot for the shake; past it, the heart lets go and the shot comes back. */
  mazeGripBeats: number;
}

export const MAZE_GRIP_DEFAULTS: MazeGripConfig = {
  mazeHeartFreeMilli: 430,
  mazeShakeWidths: 8,
  // Twelve rather than the pull's eight: nine passes across the room each is
  // a longer gesture than one pull down, and the read before it is shorter.
  mazeGripBeats: 12,
};
