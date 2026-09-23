/**
 * THE RATCHET's tuning: how deep the catch counts as set, how long each
 * tooth's window lasts and how much shorter each later one is, how long a
 * climb takes, and how long the bolt has before it reaches the hull.
 *
 * What is **not** here is the number of teeth or the clean advances they
 * need: seven and five are the silhouette and its margin, and they live with
 * the picture they are (`ratchet.ts`).
 */
export interface RatchetConfig {
  /** How far the catch travels under a thumb, in thousandths — the depth a drag is cut to. */
  ratchetReachMilli: number;
  /**
   * How deep the catch counts as **set**, in thousandths of the reach — two
   * thirds, `haspGripMilli`'s figure and its argument: a thumb that brushes
   * the catch has not set it.
   */
  ratchetGripMilli: number;
  /** Beats the rack hangs still before the first pawl lights. */
  ratchetStillBeats: number;
  /**
   * Beats the first tooth's window lasts before it is spent for nothing.
   *
   * Twenty, the owner's figure for a choreographed step (22 September 2026):
   * most of a window goes on finding out whose mark is whose, and a window
   * the pair never reach the end of teaches them nothing.
   */
  ratchetWindowBeats: number;
  /** How much shorter each window is for every tooth already spent. */
  ratchetWindowStepBeats: number;
  /** Beats a tooth takes to climb before the next pawl lights. */
  ratchetClimbBeats: number;
  /** Beats the loose bolt has before it reaches the hull. */
  ratchetBoltBeats: number;
  /** Beats the open rack hangs across the field before the wave may end. */
  ratchetOpenBeats: number;
}

export const RATCHET_DEFAULTS: RatchetConfig = {
  ratchetReachMilli: 1000,
  ratchetGripMilli: 660,
  ratchetStillBeats: 2,
  ratchetWindowBeats: 20,
  ratchetWindowStepBeats: 2,
  ratchetClimbBeats: 2,
  ratchetBoltBeats: 4,
  ratchetOpenBeats: 3,
};
