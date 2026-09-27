/**
 * THE CAPSTAN's tuning: the beats around its steps, how far a pull must go to
 * rock the cradle, how much rubbing cracks a band, and how long a hold must
 * be kept (`docs/spec/bosses-choreographed.md` §37).
 *
 * What is **not** here is the script — which step asks what, in which colour,
 * for how many beats: that is the wave's, authored on its entry.
 */
export interface CapstanConfig {
  /** Beats the drum sits rusted and centred before the first step lights. */
  capstanRustBeats: number;
  /** Beats the drum rests after a step before the next lights. */
  capstanRestBeats: number;
  /**
   * How far the steering thumb pulls the cradle from where it took hold to
   * bare a face, thousandths of a tile: a little over half a tile, a pull a
   * thumb makes on purpose and not by resting on the drum.
   */
  capstanPullMilli: number;
  /** Reversals that wear a band bright: its crack. */
  capstanWearThreshold: number;
  /** Beats of pulling and rubbing together that keep the core bare on a hold step. */
  capstanHoldBeats: number;
  /** Beats the spent drum stands with its cap open before the wave may end. */
  capstanOpenBeats: number;
}

export const CAPSTAN_DEFAULTS: CapstanConfig = {
  capstanRustBeats: 2,
  capstanRestBeats: 1,
  capstanPullMilli: 600,
  capstanWearThreshold: 8,
  capstanHoldBeats: 3,
  capstanOpenBeats: 2,
};
