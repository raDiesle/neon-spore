/**
 * THE CRYSTAL's numbers: how it crosses the field, what splitting one is
 * worth and what a whole one costs the hull (`crystal.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for `config-carom.ts`'
 * reason next door: every call site still reads `cfg.crystalCols`, and the
 * split is only about how much of one file a reader has to hold at once.
 */
export interface CrystalConfig {
  /**
   * Columns it crosses each beat. One, under the carom's three and the two it
   * used to take: this body is three tiles wide and what the pair has to put
   * under it is a plate *and* a cannon on the same beat, and at two lanes a
   * beat the plate that had found it was out from under it by the time the
   * shot was loaded. The owner, 12 September 2026: *let the shield fly
   * slower.* One lane and one row a beat is the slick's own diagonal.
   */
  crystalCols: number;
  /**
   * Rows it drops each beat. One, the fall a slick takes and the carom's
   * number, so the whole crossing is fourteen beats — long enough for the
   * exchange this creature asks for, which is the longest in the game: a
   * lane, a colour, a shield in that lane and a trigger, all at one moment.
   */
  crystalRows: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const CRYSTAL_DEFAULTS: CrystalConfig = {
  crystalCols: 1,
  crystalRows: 1,
};
