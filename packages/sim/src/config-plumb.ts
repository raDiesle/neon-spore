/**
 * THE PLUMB's tuning: the rests around its steps, the grace a level is given,
 * how far one seat can pull, and the swing free
 * (`docs/spec/bosses-choreographed.md` §31).
 *
 * What is **not** here is the script — which step asks what, skewed how far,
 * inside how wide a range, in which colour, for how many beats: that is the
 * wave's, authored on its entry.
 */
export interface PlumbConfig {
  /** Beats the bob settles into frame before the first step lights. */
  plumbStillBeats: number;
  /** Beats the bob rests after a step before the next lights. */
  plumbRestBeats: number;
  /** Beats a level step is lit past its own count, for two thumbs to find the stones and the balance. */
  plumbGraceBeats: number;
  /**
   * The furthest one seat's pull counts either way, thousandths of a tile. A
   * level step's skew is authored past it, so a bob is only brought true by
   * both seats pulling at once.
   */
  plumbPullReachMilli: number;
  /** Beats the spent bob swings free before the wave may end. */
  plumbFreeBeats: number;
}

export const PLUMB_DEFAULTS: PlumbConfig = {
  plumbStillBeats: 2,
  plumbRestBeats: 1,
  plumbGraceBeats: 2,
  plumbPullReachMilli: 2000,
  plumbFreeBeats: 2,
};
