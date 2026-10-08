/**
 * THE GALL's tuning: the beats around its steps, how long a leap is in the
 * air, and how far a hand must move to be a pull rather than a tap
 * (`docs/spec/bosses-choreographed.md` §38).
 *
 * What is **not** here is the script — which step asks what, how many taps,
 * in which colour, for how many beats: that is the wave's, authored on its
 * entry.
 */
export interface GallConfig {
  /** Beats the alien takes dropping in before the first step lights. */
  gallSlackBeats: number;
  /** Beats it rests after a shot before the next step lights. */
  gallRestBeats: number;
  /** Beats a leap is in the air, under THE SLOW, before it lands and the next step lights. */
  gallLeapBeats: number;
  /** How far up a hand must be dragged before its lift is a pull, in thousandths of a tile. */
  gallPullMilli: number;
  /** Beats it stands shot down before the wave may end. */
  gallFlatBeats: number;
}

export const GALL_DEFAULTS: GallConfig = {
  gallSlackBeats: 2,
  gallRestBeats: 1,
  gallLeapBeats: 2,
  gallPullMilli: 1200,
  gallFlatBeats: 2,
};
