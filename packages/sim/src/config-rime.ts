/**
 * THE RIME's tuning: the rests around its steps, what a reversal shaves and a
 * beat regrows, and the film a second wipe starts from
 * (`docs/spec/bosses-choreographed.md` §29).
 *
 * What is **not** here is the script — which step asks what, in which colour,
 * for how many beats: that is the wave's, authored on its entry.
 */
export interface RimeConfig {
  /** Beats the lens settles into frame before the first step lights. */
  rimeStillBeats: number;
  /** Beats the lens rests after a step before the next lights. */
  rimeRestBeats: number;
  /** Beats the shattered lens falls before the wave may end. */
  rimeShatterBeats: number;
  /** Frost one reversal of a wiping thumb shaves off the lit half, in thousandths of its face. */
  rimeShaveMilli: number;
  /** Frost a lit half nobody rubbed grows back in a beat, in thousandths of its face. */
  rimeRegrowMilli: number;
  /** The film a half's second wipe starts from, in thousandths of its face. */
  rimeFilmMilli: number;
}

export const RIME_DEFAULTS: RimeConfig = {
  rimeStillBeats: 2,
  rimeRestBeats: 1,
  rimeShatterBeats: 2,
  rimeShaveMilli: 125,
  rimeRegrowMilli: 150,
  rimeFilmMilli: 500,
};
