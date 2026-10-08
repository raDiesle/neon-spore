/**
 * THE SEAM's tuning: the beats each kind of step stays lit, and the rests
 * around them (`docs/spec/bosses-choreographed.md` §26).
 *
 * What is **not** here is the script — which step asks what, in which colour
 * and which column: that is the wave's, authored on its entry.
 *
 * **The shot windows were not doubled** when acts twelve and thirteen's were,
 * on the owner's *more time to shoot and hit* (7 October 2026,
 * `content/src/waves/act-13.ts`). Every step but the dark lights under THE
 * SLOW, at a quarter of the tempo (`slowRateMilli`, `seam-step.ts`), so at
 * 96 bpm a point's three beats are 7.5 seconds, a rock's two are 5 and the
 * glow's four are 10, against those acts' 3.75.
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
  /** Beats the false point flickers, waiting for the pair to send nothing. */
  seamDecoyBeats: number;
  /** Beats the crack lies dark before it gives, one more if a bolt is fired into it. */
  seamDarkBeats: number;
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
  seamDecoyBeats: 3,
  seamDarkBeats: 2,
  seamRestBeats: 1,
  seamSplitBeats: 2,
};
