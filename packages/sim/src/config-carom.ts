/**
 * THE CAROM's numbers: how steeply it crosses the field, what cracking one
 * open is worth, and what a whole one costs the hull when it lands
 * (`carom.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-ghost.ts` and `config-recoil.ts` already give: every call site still
 * reads `cfg.caromCols`, and the split is only about how much of one file a
 * reader has to hold at once.
 *
 * **Its own file rather than four more rows in `config-creatures.ts`**, which
 * has been over its limit since THE LID. THE RECOIL's row next door draws the
 * line at three numbers argued *together*, and these four are the same case
 * one number wider: the two strides and the drop are a single decision about
 * how many walls one arrival touches before it reaches the ship, and a reader
 * who moves one has to check all three against that count. The damage is the
 * fourth because it is the only thing that follows from the creature being a
 * rock rather than a body, and it is argued against `damageMeteor` rather than
 * against anything left next door.
 */
export interface CaromConfig {
  /**
   * Columns it crosses each beat. Four, and the number is set by the **count
   * of walls** rather than by how fast the body should look.
   *
   * The field is eleven columns wide and a carom is two of them, so it travels
   * between column 0 and column 9 — nine columns end to end. It has seven
   * beats before it reaches the ship (`caromRows` below), which is 28 columns
   * of travel: three crossings, so two walls are touched whatever column the
   * wave enters it in and whichever way `caromOnSpawn` sends it. At three it is
   * 21 columns, and an arrival that entered against a wall would touch one wall
   * and land — which is a body that crossed the field once, not a ball.
   *
   * It also makes the call expire properly: four lanes a beat is further than
   * a cannon slides comfortably in one, so the column player 2 says has to be
   * where it is *going*, and the wall is what makes that a thing worth saying
   * out loud rather than an extrapolation either of them could do alone.
   */
  caromCols: number;
  /**
   * Rows it drops each beat. Two, which is `meteorMedium`'s speed and is what
   * makes the whole thing take seven beats — 4.4 seconds at 96 BPM, just over
   * the four-second floor a spoken exchange needs (docs/spec/latency.md).
   *
   * One would give it fourteen beats and six walls, which is a ball nobody has
   * to hurry about; three would give it four beats, one wall and no time to
   * say anything at all. Two is the only value that leaves both halves — the
   * bounce and the sentence — in the same arrival.
   */
  caromRows: number;
  /**
   * What cracking the crust open is worth. Above `scoreDestroy`, and it is the
   * only kill in the game that is priced above an ordinary body: the shot that
   * lands here is the harder half of a two-control answer, and it is the shot
   * that *makes the other half possible*. The deflection that follows pays
   * `scoreDeflect` on its own, so a carom taken properly is worth both — which
   * is the arithmetic saying what the creature is.
   */
  scoreCaromCrack: number;
  /**
   * What a whole one costs the hull when it reaches the ship. `damageMeteor`'s
   * figure exactly, and that is the point rather than a coincidence: a carom
   * nobody cracked arrives as the rock it always was, and it has to cost what
   * a rock costs — otherwise the pair learns that leaving one alone is cheaper
   * than the rock they already know to ward, which is the opposite of the
   * lesson. It is deliberately not answerable by the shield: nothing turns
   * this body away until the cannon has made it a rock the shield can see.
   */
  damageCarom: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const CAROM_DEFAULTS: CaromConfig = {
  caromCols: 4,
  caromRows: 2,
  scoreCaromCrack: 200,
  damageCarom: 20,
};
