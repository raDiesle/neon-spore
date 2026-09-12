/**
 * THE LIMPET's and THE LEECH's numbers: how many beats a control may stand
 * still with one on it before it goes off, and how many moves shake it off
 * (`cling.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for `config-choke.ts`'
 * reason next door: every call site still reads `cfg.limpetStillBeats`, and
 * the split is only about how much of one file a reader has to hold at once.
 */
export interface ClingConfig {
  /**
   * Beats the shield may stand in one column with a limpet on the plate
   * before it goes off — a heavy hit on the hull at the plate's column, and
   * the wave is lost. A move puts the count back to nought. Five: at the
   * default tempo about four and a half seconds, which is the least a spoken
   * "move" needs to cross the voice delay and be acted on, and the seat that
   * has the plate is not shown the count (`.claude/skills/new-creature`, §4).
   */
  limpetStillBeats: number;
  /**
   * How many beats the shield has to be found in a different column from the
   * beat before, counted once per beat however far it went, before the limpet
   * lets go. Eight: more than the count above, so it cannot be shaken off
   * inside one fuse and the pair has to keep it up.
   */
  limpetShakeMoves: number;
  /** THE LEECH's fuse, on the cannon: the limpet's, for the same reasons. */
  leechStillBeats: number;
  /** THE LEECH's shake, on the cannon: the limpet's. */
  leechShakeMoves: number;
}

export const CLING_DEFAULTS: ClingConfig = {
  limpetStillBeats: 5,
  limpetShakeMoves: 8,
  leechStillBeats: 5,
  leechShakeMoves: 8,
};
