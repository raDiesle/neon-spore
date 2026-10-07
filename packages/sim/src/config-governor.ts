/**
 * THE GOVERNOR's tuning: the beats around its steps, how fast the needle
 * idles, how near a mark a tap lands and how near the gap the tip must be
 * (`docs/spec/bosses-choreographed.md` §43).
 *
 * What is **not** here is the script — which step asks what, of whom, at which
 * marks, at what pace, in which colour and for how many beats: that is the
 * wave's, authored on its entry.
 */
export interface GovernorConfig {
  /** Beats the needle idles before the first step lights. */
  governorSlackBeats: number;
  /** Beats the flywheel rests after a step before the next lights. */
  governorRestBeats: number;
  /** Beats the spent governor stands before the wave may end. */
  governorSpentBeats: number;
  /** How far the needle turns a tick when no step is lit, thousandths of a turn. */
  governorIdleMilli: number;
  /** How near a mark the needle must be for a tap to land, thousandths of a turn either side. */
  governorMarkMilli: number;
  /**
   * How near the bottom the needle must be when a bolt comes through the gap,
   * thousandths of a turn either side: the lit tip's half-width and the
   * column's, so a bolt is taken while the two overlap (`render/governor-shape.ts`).
   */
  governorDownMilli: number;
}

export const GOVERNOR_DEFAULTS: GovernorConfig = {
  governorSlackBeats: 2,
  governorRestBeats: 1,
  governorSpentBeats: 2,
  governorIdleMilli: 4,
  governorMarkMilli: 60,
  governorDownMilli: 55,
};
