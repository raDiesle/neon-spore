/**
 * THE HALTER's tuning: the beats around its steps, the rest a seat must
 * keep, and how long the pair must hold together
 * (`docs/spec/bosses-choreographed.md` §36).
 *
 * What is **not** here is the script — which step asks what, in which colour,
 * for how many beats: that is the wave's, authored on its entry.
 */
export interface HalterConfig {
  /** Beats the seam sits shut and alarmed before the first step lights. */
  halterAlarmBeats: number;
  /** Beats the seam pauses after a step before the next lights. */
  halterPauseBeats: number;
  /** Whole beats a seat must send nothing before it is settled: `RestraintGate`'s threshold. */
  halterRestThreshold: number;
  /** Beats a settled seat and a held chord must stay together before the step lands. */
  halterHoldBeats: number;
  /** Beats the spent seam hangs open before the wave may end. */
  halterSpentBeats: number;
}

export const HALTER_DEFAULTS: HalterConfig = {
  halterAlarmBeats: 2,
  halterPauseBeats: 1,
  halterRestThreshold: 3,
  halterHoldBeats: 2,
  halterSpentBeats: 2,
};
