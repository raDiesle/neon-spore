/**
 * THE SEAM's tuning: the beats each kind of step stays lit, and the rests
 * around them (`docs/spec/bosses-choreographed.md` §26).
 *
 * What is **not** here is the script — which step asks what, in which colour
 * and which column: that is the wave's, authored on its entry.
 */
export interface SeamConfig {
  /** Beats the ridge settles into frame before the first step lights. */
  seamStillBeats: number;
  /** Beats a lit point waits for its shot, under THE SLOW. */
  seamPointBeats: number;
  /** Beats thrown grit waits for the shield. */
  seamGritBeats: number;
  /** Beats a spat rock waits for its shot. */
  seamRockBeats: number;
  /** Beats grit and a rock at once wait for both answers. */
  seamBothBeats: number;
  /** Beats the ridge, turned face away, waits for its grit on the shield. */
  seamBlindBeats: number;
  /** Beats the glow gathers, waiting for its shots. */
  seamGlowBeats: number;
  /** Shots of either colour that quench the glow. */
  seamGlowShots: number;
  /** Beats the ridge rests after a step before the next lights. */
  seamRestBeats: number;
  /** Beats the split ridge hangs before the wave may end. */
  seamSplitBeats: number;
}

export const SEAM_DEFAULTS: SeamConfig = {
  seamStillBeats: 2,
  seamPointBeats: 3,
  seamGritBeats: 2,
  seamRockBeats: 2,
  seamBothBeats: 3,
  seamBlindBeats: 3,
  seamGlowBeats: 4,
  seamGlowShots: 3,
  seamRestBeats: 1,
  seamSplitBeats: 2,
};
