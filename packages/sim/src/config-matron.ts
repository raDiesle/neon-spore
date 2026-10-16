/**
 * THE MATRON's tuning: the beats around her clutches and where a pod hangs.
 *
 * What is **not** here is the script — how many pods a clutch is, where each
 * hangs, how long its ring is, and what she throws on which beat: that is the
 * wave's, authored on its entry.
 */
export interface MatronConfig {
  /** Beats she takes to come down over the field before the first clutch. */
  matronEnterBeats: number;
  /** Beats she rears back between two clutches, growing the next. */
  matronRearBeats: number;
  /** Beats the beaten matron takes to sink away before the wave may end. */
  matronSpentBeats: number;
  /** The row a pod hangs at, off the tip of its lobe. */
  matronPodRow: number;
}

export const MATRON_DEFAULTS: MatronConfig = {
  matronEnterBeats: 6,
  matronRearBeats: 4,
  matronSpentBeats: 6,
  matronPodRow: 4,
};
