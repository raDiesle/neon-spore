/**
 * THE GRATE's three numbers: how many gaps a wall the author left blank has
 * burnt in it, and what one that finds the dome in the way costs the hull
 * (`grate.ts`).
 *
 * Its own file rather than three more rows in `config-creatures.ts`, and for
 * `config-veer.ts`'s reason before its own: that file has been one line under
 * the 250-line limit for four creatures running. The better reason is that
 * these three only mean anything against each other — how many ways through
 * there are, how wide each one is, and what missing every one of them costs
 * are one argument about how hard a wall is, and tuning any of them alone is
 * how a creature ends up impossible on paper and trivial in the hand.
 *
 * **There is no fall speed in here, and that is deliberate.** A grate comes
 * down at `fallTilesPerBeat`'s second tier, which is the one place any body's
 * speed is decided, and a number here would be a second copy of it free to
 * disagree with the tier it was chosen against.
 */
export interface GrateConfig {
  /**
   * Gaps in a wall whose wave did not say. One, because one gap is the whole
   * sentence this creature exists to make somebody say — a number, once,
   * across the room — and every gap after the first is a second answer that
   * makes being wrong cheaper. A wave that wants the wall to be kind says so
   * on the arrival (`WaveEntry.gaps`); the shipped default is the hard one.
   */
  grateGaps: number;
  /**
   * Columns each gap opens. One, and it is the number that makes the call
   * worth making: a gap two columns wide is a gap the shield finds by being
   * roughly right, and roughly right is what the pair reaches for when they
   * have stopped listening to each other.
   */
  grateGapCols: number;
  /**
   * Hull points a wall that finds the dome in the way costs. Twenty, which is
   * `damageMeteor` rather than `damageCreature` and is the same argument: this
   * is a thing the shield was supposed to answer and did not, and a pair must
   * never learn that the arrival they cannot shoot is the cheap one to give up
   * on. It is a number of its own rather than a share of the rock's because
   * the two are argued about separately — a wall arrives about once a wave and
   * rocks arrive in threes.
   */
  grateDamage: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const GRATE_DEFAULTS: GrateConfig = {
  grateGaps: 1,
  grateGapCols: 1,
  grateDamage: 20,
};
