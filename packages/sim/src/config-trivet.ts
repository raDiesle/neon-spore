/**
 * THE TRIVET's tuning: the rests around its steps, the grace a chord is
 * given, and the collapse (`docs/spec/bosses-choreographed.md` §30).
 *
 * What is **not** here is the script — which step asks what, on how many
 * pads, in which colour, for how many beats: that is the wave's, authored on
 * its entry.
 */
export interface TrivetConfig {
  /** Beats the stand settles into frame before the first step lights. */
  trivetStillBeats: number;
  /** Beats the stand rests after a step before the next lights. */
  trivetRestBeats: number;
  /** Beats a chord step is lit past its own count, for thumbs to find the pads. */
  trivetGraceBeats: number;
  /** Beats the collapsed stand falls before the wave may end. */
  trivetCollapseBeats: number;
}

export const TRIVET_DEFAULTS: TrivetConfig = {
  trivetStillBeats: 2,
  trivetRestBeats: 1,
  trivetGraceBeats: 2,
  trivetCollapseBeats: 2,
};
