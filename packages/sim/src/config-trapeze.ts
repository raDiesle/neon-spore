/**
 * THE TRAPEZE's tuning: the beats around its steps, how far and how fast the
 * flag swings on its own, how near the lit column a tap stills it, and how
 * long a freeze and a draw last (`docs/spec/bosses-choreographed.md` §39).
 *
 * What is **not** here is the script — which step asks what, of whom, over
 * which column, in which colour and for how many beats: that is the wave's,
 * authored on its entry.
 */
export interface TrapezeConfig {
  /** Beats the flag swings loose before the first step lights. */
  trapezeSlackBeats: number;
  /** Beats the boom rests after a step before the next lights. */
  trapezeRestBeats: number;
  /** Beats the spent flag swings before the wave may end. */
  trapezeSpentBeats: number;
  /** How far either side of the middle column the flag swings, thousandths of a column. */
  trapezeSpanMilli: number;
  /** How far it swings a beat when no lit step says, thousandths of a column. */
  trapezeSweepMilli: number;
  /** How near the lit column the flag must be for a tap to still it, thousandths of a column. */
  trapezeMarkMilli: number;
  /** Beats a landed tap holds the flag still. */
  trapezeFreezeBeats: number;
  /** Beats a draw must be held before its lift can land a catch. */
  trapezeDrawBeats: number;
}

export const TRAPEZE_DEFAULTS: TrapezeConfig = {
  trapezeSlackBeats: 2,
  trapezeRestBeats: 1,
  trapezeSpentBeats: 2,
  trapezeSpanMilli: 1000,
  trapezeSweepMilli: 1000,
  trapezeMarkMilli: 500,
  trapezeFreezeBeats: 3,
  trapezeDrawBeats: 1,
};
