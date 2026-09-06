/**
 * THE FENCE's two numbers: how wide each way through it is, and what one that
 * finds the dome in the way costs the hull (`fence.ts`).
 *
 * Its own file rather than two more rows in `config-creatures.ts`, and for
 * `config-veer.ts`'s reason before its own: that file has been one line under
 * the 250-line limit for four creatures running. The better reason is that the
 * two only mean anything against each other — how wide a way through is and
 * what missing every one of them costs are one argument about how hard a fence
 * is, and tuning either alone is how a creature ends up impossible on paper
 * and trivial in the hand.
 *
 * **How many gaps there are is not here**, and it never was a number the ship
 * carries: it is a fact about one arrival, authored on the wave
 * (`WaveEntry.gaps`) down to none at all. A default count here would have been
 * a second place the difficulty of a fence is decided, free to disagree with
 * the map the author is looking at.
 *
 * **There is no fall speed in here, and that is deliberate.** A fence comes
 * down at `fallTilesPerBeat`'s second tier, which is the one place any body's
 * speed is decided, and a number here would be a second copy of it free to
 * disagree with the tier it was chosen against.
 */
export interface FenceConfig {
  /**
   * Columns each way through opens — an authored one and a burnt one alike.
   * One, and it is the number that makes the call worth making: a gap two
   * columns wide is a gap the shield finds by being roughly right, and roughly
   * right is what the pair reaches for when they have stopped listening to
   * each other.
   */
  fenceGapCols: number;
  /**
   * Hull points a fence that finds the dome in the way costs. Twenty, which is
   * `damageMeteor` rather than `damageCreature` and is the same argument: this
   * is a thing the shield was supposed to answer and did not, and a pair must
   * never learn that the arrival they cannot shoot is the cheap one to give up
   * on. It is a number of its own rather than a share of the rock's because
   * the two are argued about separately — a fence arrives about once a wave
   * and rocks arrive in threes.
   */
  fenceDamage: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const FENCE_DEFAULTS: FenceConfig = {
  fenceGapCols: 1,
  fenceDamage: 20,
};
