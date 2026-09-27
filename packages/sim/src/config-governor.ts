/**
 * THE GOVERNOR's tuning: the beats around its steps, how fast the needle
 * idles, how near the mark a tap lands, and how fast the flyweights climb
 * when the brake lifts and settle when it is shut again
 * (`docs/spec/bosses-choreographed.md` §43).
 *
 * What is **not** here is the script — which step asks what, of whom, at which
 * mark, at what pace, in which colour and for how many beats: that is the
 * wave's, authored on its entry.
 */
export interface GovernorConfig {
  /** Beats the needle idles before the first step lights. */
  governorSlackBeats: number;
  /** Beats the flywheel rests after a step before the next lights. */
  governorRestBeats: number;
  /** Beats the spent governor stands before the wave may end. */
  governorSpentBeats: number;
  /** How far the needle turns a tick at 1× when no tap step is lit, thousandths of a turn. */
  governorIdleMilli: number;
  /** How near the lit mark the needle must be for a tap to land, thousandths of a turn either side. */
  governorMarkMilli: number;
  /** The fastest the needle runs with the brake off, in thousandths of its pace: 2000 is 2×. */
  governorHotMilli: number;
  /** How much faster it runs each tick the brake is off, thousandths of its pace. */
  governorClimbMilli: number;
  /** How much slower it runs each tick the brake is shut, thousandths of its pace, down to 1×. */
  governorEaseMilli: number;
}

export const GOVERNOR_DEFAULTS: GovernorConfig = {
  governorSlackBeats: 2,
  governorRestBeats: 1,
  governorSpentBeats: 2,
  governorIdleMilli: 2,
  governorMarkMilli: 60,
  governorHotMilli: 2000,
  governorClimbMilli: 14,
  governorEaseMilli: 7,
};
