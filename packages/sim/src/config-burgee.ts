/**
 * THE BURGEE's tuning: the beats around its steps, how far and how fast the
 * flag swings on its own, how near the lit column a tap stills it, and how
 * long a freeze and a draw last (`docs/spec/bosses-choreographed.md` §39).
 *
 * What is **not** here is the script — which step asks what, of whom, over
 * which column, in which colour and for how many beats: that is the wave's,
 * authored on its entry.
 */
export interface BurgeeConfig {
  /** Beats the flag swings loose before the first step lights. */
  burgeeSlackBeats: number;
  /** Beats the boom rests after a step before the next lights. */
  burgeeRestBeats: number;
  /** Beats the spent flag swings before the wave may end. */
  burgeeSpentBeats: number;
  /** How far either side of the middle column the flag swings, thousandths of a column. */
  burgeeSpanMilli: number;
  /** How far it swings a beat when no lit step says, thousandths of a column. */
  burgeeSweepMilli: number;
  /** How near the lit column the flag must be for a tap to still it, thousandths of a column. */
  burgeeMarkMilli: number;
  /** Beats a landed tap holds the flag still. */
  burgeeFreezeBeats: number;
  /** Beats a draw must be held before its lift can land a catch. */
  burgeeDrawBeats: number;
}

export const BURGEE_DEFAULTS: BurgeeConfig = {
  burgeeSlackBeats: 2,
  burgeeRestBeats: 1,
  burgeeSpentBeats: 2,
  burgeeSpanMilli: 1000,
  burgeeSweepMilli: 1000,
  burgeeMarkMilli: 500,
  burgeeFreezeBeats: 3,
  burgeeDrawBeats: 1,
};
