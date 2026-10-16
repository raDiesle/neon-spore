/**
 * THE SWINDLE's tuning: the beats around her hands, how long a swap glides
 * and where a pod hangs.
 *
 * What is **not** here is the script — which pods a hand is, real or hollow,
 * where each hangs, which pairs trade on which beat and when each is let go:
 * that is the wave's, authored on its entry.
 */
export interface SwindleConfig {
  /** Beats she takes to come in over the field before the first hand. */
  swindleEnterBeats: number;
  /** Beats she rears back between two hands, dealing the next. */
  swindleRearBeats: number;
  /** Beats the beaten swindle takes to go before the wave may end. */
  swindleSpentBeats: number;
  /** Beats two pods take to trade places. */
  swindleSwapBeats: number;
  /** The row her pods hang at. */
  swindlePodRow: number;
}

export const SWINDLE_DEFAULTS: SwindleConfig = {
  swindleEnterBeats: 6,
  swindleRearBeats: 4,
  swindleSpentBeats: 6,
  swindleSwapBeats: 2,
  swindlePodRow: 4,
};
