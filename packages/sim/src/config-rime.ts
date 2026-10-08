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
  /** Beats the film refreezes over the spent core, both hands off it, before the lens shatters. */
  rimeRefreezeBeats: number;
  /** Beats a reflex wipe or shield may add to the refreeze, one a beat, before it spends anyway. */
  rimeRefreezeScatters: number;
  /**
   * Frost one reversal of a wiping thumb shaves off the lit half, in
   * thousandths of its face — 80, thirteen reversals from solid and seven
   * from the film, since the owner's *every rub should require more rubs* (7
   * October 2026), from 125's eight and four. A wipe step is lit under THE
   * SLOW, so its four beats are ten seconds in the hand.
   */
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
  rimeRefreezeBeats: 3,
  rimeRefreezeScatters: 2,
  rimeShaveMilli: 80,
  rimeRegrowMilli: 150,
  rimeFilmMilli: 500,
};
