/**
 * THE MANTLE's tuning: how deep a floor either handle must clear before it
 * counts toward the sum, and the beats each phase takes.
 *
 * What is **not** here is where the four thresholds sit: those are the
 * wave's, authored as `MANTLE_SCRIPT` (`packages/content/src/mantle-script.ts`),
 * so a wave may hang a heavier or lighter shell without touching this file.
 */
export interface MantleConfig {
  /** Either handle's pull depth, thousandths of a tile, below which it does
   * not count toward the sum at all — the floor that makes the mechanic a
   * two-hand one rather than an arm-wrestle either seat could win alone. */
  mantleFloorMilli: number;
  /** Beats the shell hangs dark before the first pair of handles light. */
  mantleStillBeats: number;
  /** Beats the bared core's hazard spark has before it reaches the hull. */
  mantleSparkBeats: number;
  /** Beats the field runs at the slow rate on every shear (THE SLOW). */
  mantleSlowBeats: number;
  /** Alternating taps the finish takes before the core goes dark. */
  mantleHeartbeatTaps: number;
  /** Beats the dark core hangs before the wave may end. */
  mantleOpenBeats: number;
}

export const MANTLE_DEFAULTS: MantleConfig = {
  mantleFloorMilli: 500,
  mantleStillBeats: 2,
  mantleSparkBeats: 4,
  mantleSlowBeats: 2,
  mantleHeartbeatTaps: 6,
  mantleOpenBeats: 2,
};
