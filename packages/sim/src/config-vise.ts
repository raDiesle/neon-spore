/**
 * THE VISE's tuning: the rests around its steps, the grace a pinch is given,
 * and the gap a pinch counts as shut (`docs/spec/bosses-choreographed.md` §28).
 *
 * What is **not** here is the script — which step asks what, in which colour,
 * for how many beats: that is the wave's, authored on its entry.
 */
export interface ViseConfig {
  /** Beats the case settles into frame before the first step lights. */
  viseStillBeats: number;
  /** Beats the case rests after a step before the next lights. */
  viseRestBeats: number;
  /** Beats a pinch step is lit past its own count, for fingers to find the lobe. */
  viseGraceBeats: number;
  /** Beats the split case falls before the wave may end. */
  viseSplitBeats: number;
  /** A lobe's gap with no pinch on it, in thousandths of a tile. */
  viseOpenMilli: number;
  /** The gap at or under which a lobe counts as pinched shut, in thousandths of a tile. */
  viseShutMilli: number;
}

export const VISE_DEFAULTS: ViseConfig = {
  viseStillBeats: 2,
  viseRestBeats: 1,
  viseGraceBeats: 2,
  viseSplitBeats: 2,
  viseOpenMilli: 3000,
  viseShutMilli: 800,
};
