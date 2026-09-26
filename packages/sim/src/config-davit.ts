/**
 * THE DAVIT's tuning: the rests around its steps, the grace a swing is given,
 * how fast the boom swings back with nobody steering it, and the spent boom
 * hanging (`docs/spec/bosses-choreographed.md` §35).
 *
 * What is **not** here is the script — which step asks what, where the boom
 * must be steered and how closely, in which colour, for how many beats: that
 * is the wave's, authored on its entry.
 */
export interface DavitConfig {
  /** Beats the boom settles into frame before the first step lights. */
  davitStillBeats: number;
  /** Beats the boom rests after a step before the next lights. */
  davitRestBeats: number;
  /** Beats a swing or a reland is lit past its own count, for a lean to find its target and a lift to be made. */
  davitGraceBeats: number;
  /** Beats the spent boom hangs before the wave may end. */
  davitSpentBeats: number;
  /** Thousandths of a degree the boom swings back toward hanging each beat nobody steers it. */
  davitDriftMilli: number;
}

export const DAVIT_DEFAULTS: DavitConfig = {
  davitStillBeats: 2,
  davitRestBeats: 1,
  davitGraceBeats: 2,
  davitSpentBeats: 2,
  davitDriftMilli: 4000,
};
