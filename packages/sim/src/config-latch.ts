/**
 * THE LATCH's tuning: how long a knot is and how far one pull reaches, how
 * often the slime yanks and how long it rears first, where the grips hang,
 * and the beats around its levels (`docs/spec/bosses-cinematic.md` §2).
 *
 * What is **not** here is the script — which levels yank, which cross the
 * grips, how many knots each wants and how long it may take: that is the
 * wave's, authored on its entry.
 */
export interface LatchConfig {
  /** Beats the slime drops in and hooks the hull before the first level. */
  latchEnterBeats: number;
  /** Beats after a level before the next. */
  latchRestBeats: number;
  /** Beats the slime is torn loose and falls away before the wave may end. */
  latchSpentBeats: number;
  /** One knot of tendril, thousandths of a row: longer than a reach, so two pulls at least. */
  latchKnotMilli: number;
  /** The furthest one pull carries the tendril, thousandths of a row. */
  latchReachMilli: number;
  /** How far a pull must go before letting go passes the turn, thousandths of a row. */
  latchStrokeMilli: number;
  /** Beats between yanks in a level that yanks; the first comes this far in. */
  latchYankEveryBeats: number;
  /** Beats the slime rears back before a yank, the warning. */
  latchRearBeats: number;
  /** The row the two grips hang on, thousandths of a row, before a pull. */
  latchGripRowMilli: number;
}

export const LATCH_DEFAULTS: LatchConfig = {
  latchEnterBeats: 4,
  latchRestBeats: 3,
  latchSpentBeats: 4,
  latchKnotMilli: 4000,
  latchReachMilli: 2500,
  latchStrokeMilli: 1000,
  latchYankEveryBeats: 7,
  latchRearBeats: 2,
  latchGripRowMilli: 8000,
};
