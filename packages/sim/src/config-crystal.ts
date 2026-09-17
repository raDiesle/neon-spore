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
   * Beats it falls **straight down a column**, a row a beat, before it moves
   * sideways at all.
   *
   * The owner, 17 September 2026: *"Change the animation so that it stays in
   * a column, then quickly moves around two beats 2 tiles horizontal, then
   * again vertical. So either vertical or horizontal."* It used to take THE
   * CAROM's diagonal — a lane and a row on every beat at once — and the
   * diagonal is the one crossing this body can least afford: four hands have
   * to agree on the middle lane, and on a diagonal the lane they agreed on
   * expired on the beat they agreed it. A column held for this many beats is
   * a lane there is time to say out loud.
   */
  crystalFallBeats: number;
  /**
   * Beats it then moves **sideways and does not fall**, `crystalCols` columns
   * a beat. Two, which with the stride below is the owner's *two beats 2 tiles
   * horizontal*: the move is the loud part of the crossing and the fall is the
   * quiet part, and never both at once.
   */
  crystalSlideBeats: number;
  /**
   * Columns it crosses on each beat of a slide — not on every beat any more.
   * One, under the carom's three and the two it used to take: this body is
   * three tiles wide and what the pair has to put under it is a plate *and* a
   * cannon on the same beat. The owner, 12 September 2026: *let the shield fly
   * slower.*
   */
  crystalCols: number;
  /**
   * Rows it drops on each beat of a fall — not on every beat any more. One,
   * the fall a slick takes, so the column it is holding is the column a slick
   * would hold and the pair reads the two the same way.
   */
  crystalRows: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const CRYSTAL_DEFAULTS: CrystalConfig = {
  crystalFallBeats: 4,
  crystalSlideBeats: 2,
  crystalCols: 1,
  crystalRows: 1,
};
