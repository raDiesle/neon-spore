/**
 * THE TRAPEZE's tuning: where the swing hangs and how long its ropes are, how
 * fast it swings, how much a push gives and a wrong one takes, how fast it
 * slows on its own, and the beats around its levels
 * (`docs/spec/bosses-choreographed.md` §39).
 *
 * What is **not** here is the script — which level asks for swipes, shots
 * from below or shots from the side, where its gong hangs and how long it
 * may take: that is the wave's, authored on its entry.
 */
export interface TrapezeConfig {
  /** Beats the swing hangs swaying before the first level. */
  trapezeEnterBeats: number;
  /** Beats after a gong before the next level. */
  trapezeRestBeats: number;
  /** Beats the swing goes over the top and away before the wave may end. */
  trapezeSpentBeats: number;
  /** Where the ropes are tied, thousandths of a row: above the top of the field. */
  trapezeAnchorMilli: number;
  /** How long the ropes are, thousandths of a row. */
  trapezeRopeMilli: number;
  /** Beats one whole swing takes, there and back. */
  trapezePeriodBeats: number;
  /** How far the swing goes at the start, thousandths of a degree either side. */
  trapezeStartMilli: number;
  /** The furthest it can go, thousandths of a degree either side. */
  trapezeMaxMilli: number;
  /** What a push on time adds to the swing, thousandths of a degree. */
  trapezePushMilli: number;
  /** What a push at the wrong time takes off it, thousandths of a degree. */
  trapezeBrakeMilli: number;
  /** What the swing loses on its own every beat, thousandths of a degree. */
  trapezeDampMilli: number;
  /** How much of the swing is left after a gong, in thousandths of it. */
  trapezeKeepMilli: number;
  /** How far a swipe must go sideways to count, thousandths of a column. */
  trapezeSwipeMilli: number;
  /** How near the alien a bolt must pass to hit it, thousandths of a column or row. */
  trapezeHitMilli: number;
  /** Beats a tap on the alien keeps the cannon locked on it. */
  trapezeLockBeats: number;
}

export const TRAPEZE_DEFAULTS: TrapezeConfig = {
  trapezeEnterBeats: 2,
  trapezeRestBeats: 2,
  trapezeSpentBeats: 4,
  trapezeAnchorMilli: -4000,
  trapezeRopeMilli: 12500,
  trapezePeriodBeats: 4,
  trapezeStartMilli: 4000,
  trapezeMaxMilli: 22000,
  trapezePushMilli: 3000,
  trapezeBrakeMilli: 2000,
  trapezeDampMilli: 250,
  trapezeKeepMilli: 500,
  trapezeSwipeMilli: 300,
  trapezeHitMilli: 600,
  trapezeLockBeats: 6,
};
