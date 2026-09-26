/**
 * THE SLING's tuning: the rests around its steps, the grace a draw is given,
 * and the snap free (`docs/spec/bosses-choreographed.md` §32).
 *
 * What is **not** here is the script — which step asks what, toward which
 * side, in which colour, for how many beats: that is the wave's, authored on
 * its entry.
 */
export interface SlingConfig {
  /** Beats the fork settles into frame before the first step lights. */
  slingStillBeats: number;
  /** Beats the fork rests after a step before the next lights. */
  slingRestBeats: number;
  /** Beats a draw step is lit past its own count, for a finger to find its panel and a lift to be made. */
  slingGraceBeats: number;
  /** Beats the spent fork falls away before the wave may end. */
  slingFreeBeats: number;
}

export const SLING_DEFAULTS: SlingConfig = {
  slingStillBeats: 2,
  slingRestBeats: 1,
  slingGraceBeats: 2,
  slingFreeBeats: 2,
};
