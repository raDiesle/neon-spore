/**
 * THE GALL's tuning: the beats around its steps, how wide a pinch opens and
 * how shut it must be, and how long it must be kept shut to close
 * (`docs/spec/bosses-choreographed.md` §38).
 *
 * What is **not** here is the script — which step asks what, in which colour,
 * for how many beats: that is the wave's, authored on its entry.
 */
export interface GallConfig {
  /** Beats the gall sits slack on the seam before the first step lights. */
  gallSlackBeats: number;
  /** Beats the seam rests after a step before the next lights. */
  gallRestBeats: number;
  /** Beats a pinch must be kept shut on the gall's point to close it. */
  gallShutBeats: number;
  /** The gap with no pinch on the gall, in thousandths of a tile: wide open. */
  gallOpenMilli: number;
  /** The gap at or under which the gall is pinched shut, in thousandths of a tile. */
  gallShutMilli: number;
  /** Beats the flat seam stands with the root shot before the wave may end. */
  gallFlatBeats: number;
}

export const GALL_DEFAULTS: GallConfig = {
  gallSlackBeats: 2,
  gallRestBeats: 1,
  gallShutBeats: 2,
  gallOpenMilli: 3000,
  gallShutMilli: 800,
  gallFlatBeats: 2,
};
