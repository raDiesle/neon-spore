/**
 * THE CRYSTAL's numbers: how it crosses the field, how far a wrong shot drives
 * it down, what splitting one is worth and what a whole one costs the hull
 * (`crystal.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for `config-carom.ts`'
 * reason next door: every call site still reads `cfg.crystalCols`, and the
 * split is only about how much of one file a reader has to hold at once.
 */
export interface CrystalConfig {
  /**
   * Columns it crosses each beat. Two, one under the carom's three: this body
   * is three tiles wide, and the tile that matters is the *middle* one, so
   * what the pair has to say is a lane the middle will be in — and at three
   * lanes a beat a three-wide body reaches a wall of a nine-wide field every
   * other beat, which is a ball nobody can put four things under at once.
   */
  crystalCols: number;
  /**
   * Rows it drops each beat. One, the fall a slick takes and the carom's
   * number, so the whole crossing is fourteen beats — long enough for the
   * exchange this creature asks for, which is the longest in the game: a
   * lane, a colour, a shield in that lane and a trigger, all at one moment.
   */
  crystalRows: number;
  /**
   * Rows a wrong shot drives it toward the ship. One: a bolt that met the
   * shell anywhere but the standing-shield middle, or met the middle in the
   * wrong colour, bounces off and the whole thing dives a row — so a guess
   * costs a beat of the fourteen, every time.
   */
  crystalDiveRows: number;
  /**
   * What splitting one is worth. `scoreCaromCrack`'s figure, for its reason:
   * the shot that lands here is the harder half of a four-hand answer, and it
   * makes the two ordinary kills that follow possible.
   */
  scoreCrystalSplit: number;
  /**
   * What a whole one costs the hull when it reaches the ship. `damageCarom`'s
   * figure: it arrives as the armoured thing it always was and the shield
   * alone was never able to turn it.
   */
  damageCrystal: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const CRYSTAL_DEFAULTS: CrystalConfig = {
  crystalCols: 2,
  crystalRows: 1,
  crystalDiveRows: 1,
  scoreCrystalSplit: 200,
  damageCrystal: 20,
};
