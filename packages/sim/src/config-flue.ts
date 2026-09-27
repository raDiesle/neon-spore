/**
 * THE FLUE's tuning: the beats around its steps, how far and how fast the
 * ember drifts on its own, and how many beats of nothing steady it
 * (`docs/spec/bosses-choreographed.md` §40).
 *
 * What is **not** here is the script — which step asks what, of whom, which
 * notches the ember moves to, in which colour and for how many beats: that
 * is the wave's, authored on its entry.
 *
 * `fluePauseBeats` is the rest *between steps*, and it is not named for a
 * rest as the other bosses' are because on this one the rest is the
 * mechanic: that word is the per-seat count on the state, `restBeats`.
 */
export interface FlueConfig {
  /** Beats the ember drifts loose before the first step lights. */
  flueSlackBeats: number;
  /** Beats the flue rests after a step before the next lights. */
  fluePauseBeats: number;
  /** Beats the open damper stands before the wave may end. */
  flueSpentBeats: number;
  /** How far either side of the middle column the ember drifts, thousandths of a column. */
  flueSpanMilli: number;
  /** How far it drifts a beat, thousandths of a column. */
  flueDriftMilli: number;
  /** Beats in a row with nothing sent that steady the ember or hold the damper. */
  flueRestThreshold: number;
}

export const FLUE_DEFAULTS: FlueConfig = {
  flueSlackBeats: 2,
  fluePauseBeats: 1,
  flueSpentBeats: 2,
  flueSpanMilli: 2000,
  flueDriftMilli: 500,
  flueRestThreshold: 3,
};
