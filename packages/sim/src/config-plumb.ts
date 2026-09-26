/**
 * THE PLUMB's tuning: the rests around its steps, the grace a level is given,
 * and the swing free (`docs/spec/bosses-choreographed.md` §31).
 *
 * What is **not** here is the script — which step asks what, inside how wide
 * a range, in which colour, for how many beats: that is the wave's, authored
 * on its entry.
 */
export interface PlumbConfig {
  /** Beats the bob settles into frame before the first step lights. */
  plumbStillBeats: number;
  /** Beats the bob rests after a step before the next lights. */
  plumbRestBeats: number;
  /** Beats a level step is lit past its own count, for a phone to be picked up and found level. */
  plumbGraceBeats: number;
  /** Beats the spent bob swings free before the wave may end. */
  plumbFreeBeats: number;
}

export const PLUMB_DEFAULTS: PlumbConfig = {
  plumbStillBeats: 2,
  plumbRestBeats: 1,
  plumbGraceBeats: 2,
  plumbFreeBeats: 2,
};
