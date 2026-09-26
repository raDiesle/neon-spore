/**
 * THE CYST's tuning: the rests around its steps, the window a tap is given,
 * the grace a pinch is given, and the gap a pinch counts as shut
 * (`docs/spec/bosses-choreographed.md` §34).
 *
 * What is **not** here is the script — which step asks what, in which colour,
 * for how many beats: that is the wave's, authored on its entry.
 */
export interface CystConfig {
  /** Beats the sac settles into frame before the first step lights. */
  cystStillBeats: number;
  /** Beats the sac rests after a step before the next lights. */
  cystRestBeats: number;
  /** Beats a flank shudders lit, waiting for the partner's tap to still it. */
  cystTapBeats: number;
  /** Beats a stilled flank stays still past the pinch's own count, for fingers to find it. */
  cystGraceBeats: number;
  /** Beats the split sac falls before the wave may end. */
  cystSplitBeats: number;
  /** A flank's gap with no pinch on it, in thousandths of a tile. */
  cystOpenMilli: number;
  /** The gap at or under which a flank counts as pinched shut, in thousandths of a tile. */
  cystShutMilli: number;
}

export const CYST_DEFAULTS: CystConfig = {
  cystStillBeats: 2,
  cystRestBeats: 1,
  cystTapBeats: 2,
  cystGraceBeats: 2,
  cystSplitBeats: 2,
  cystOpenMilli: 3000,
  cystShutMilli: 800,
};
