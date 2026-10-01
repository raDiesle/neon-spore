/**
 * THE LAMPREY's tuning: the beats around its bites and its gullet, how fast a
 * jaw let go bites deeper, and how near the jaw a thumb has to be to pin it
 * (`docs/spec/bosses-choreographed.md` §41).
 *
 * What is **not** here is the script — which seat pins, how many teeth, how
 * long each tooth waits, where the mouth bites and how fast it crawls, and
 * which colour the gullet wants: that is the wave's, authored on its entry.
 */
export interface LampreyConfig {
  /** Beats the eel swims in before its first bite. */
  lampreyEnterBeats: number;
  /** Beats it hangs off the hull after a bite before the next step. */
  lampreyLooseBeats: number;
  /** Beats it recoils from a hit before the next step. */
  lampreyRecoilBeats: number;
  /** Beats the spent eel falls away before the wave may end. */
  lampreySpentBeats: number;
  /** How much deeper the bite goes each beat the jaw is not pinned, thousandths of a full bite. */
  lampreyBiteStepMilli: number;
  /** A full bite, thousandths: reaching it is a hull hit. */
  lampreyBiteFullMilli: number;
  /** How many columns either side of the jaw the pinner's thumb may be and still hold it. */
  lampreyGripCols: number;
}

export const LAMPREY_DEFAULTS: LampreyConfig = {
  lampreyEnterBeats: 6,
  lampreyLooseBeats: 4,
  lampreyRecoilBeats: 1,
  lampreySpentBeats: 2,
  lampreyBiteStepMilli: 125,
  lampreyBiteFullMilli: 1000,
  lampreyGripCols: 1,
};
