/**
 * THE SWINDLE's tuning: the beats around her hands, how long a swap glides,
 * how far apart two crossing pods pass, and where a pod hangs.
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
  /** How far, in thousandths of a row, the pod going right dips at the middle
   * of a swap and the other rises (`swindle-arc.ts`): more than a pod's
   * width, so both clear a pod hanging between them. */
  swindleArcMilli: number;
}

export const SWINDLE_DEFAULTS: SwindleConfig = {
  swindleEnterBeats: 6,
  swindleRearBeats: 4,
  swindleSpentBeats: 6,
  swindleSwapBeats: 2,
  swindlePodRow: 4,
  swindleArcMilli: 900,
};
