/**
 * THE OCULUS's tuning: the rests around its steps and the grace a hold is
 * given (`docs/spec/bosses-choreographed.md` §27).
 *
 * What is **not** here is the script — which step asks what, in which colour,
 * for how many beats: that is the wave's, authored on its entry.
 */
export interface OculusConfig {
  /** Beats the lens settles into frame before the first step lights. */
  oculusStillBeats: number;
  /** Beats the lens rests after a step before the next lights. */
  oculusRestBeats: number;
  /** Beats a hold step is lit past its own count, for two thumbs to find their leaves. */
  oculusGraceBeats: number;
  /** Beats the shattered lens falls before the wave may end. */
  oculusShatterBeats: number;
}

export const OCULUS_DEFAULTS: OculusConfig = {
  oculusStillBeats: 2,
  oculusRestBeats: 1,
  oculusGraceBeats: 2,
  oculusShatterBeats: 2,
};
