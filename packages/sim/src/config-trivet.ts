/**
 * THE TRIVET's tuning: the rests around its steps, the grace a chord is
 * given, the feet ringing under the spent hub, and the collapse
 * (`docs/spec/bosses-choreographed.md` §30).
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
  /** Beats the planted feet ring under the spent hub, every pad left up, before the stand collapses (§30 row 11). */
  trivetRingBeats: number;
  /** Beats a reflex chord may add to the ring, one a beat, before it stops costing any. */
  trivetRingJolts: number;
}

export const TRIVET_DEFAULTS: TrivetConfig = {
  trivetStillBeats: 2,
  trivetRestBeats: 1,
  trivetGraceBeats: 2,
  trivetCollapseBeats: 2,
  trivetRingBeats: 3,
  trivetRingJolts: 2,
};
