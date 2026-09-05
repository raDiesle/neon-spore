/**
 * THE STRAND's three numbers: how many beads a thread carries when the wave
 * does not say, what one bead is worth, and what finishing the thread is
 * worth (`strand.ts`).
 *
 * Its own file rather than three more rows in `config-creatures.ts`, which was
 * one line under the 250-line limit the day this creature was written — the
 * immediate reason, and the same one `config-veer.ts`, `config-ghost.ts`,
 * `config-recoil.ts` and `config-gyre.ts` each record for themselves. The
 * better reason is `config-recoil.ts`': the three only mean anything against
 * each other. A price per bead argued without the count is a price for an
 * arrival whose length nobody has fixed, and a price for the thread argued
 * without the price per bead is the pair being paid twice for one sentence.
 *
 * `SimConfig` extends this rather than nesting it, so every call site still
 * reads `cfg.strandBeads` and the split is only about how much of one file a
 * reader has to hold at once.
 *
 * **There is no fall speed here, and that is the point.** A bead comes down a
 * row a beat because `fallTilesPerBeat` answers one for anything it does not
 * name, and every bead of a thread falls on its own rather than being carried
 * — which is the whole reason this creature needs no hub the way THE GYRE
 * does. There is no damage figure either: a bead that reaches the ship costs
 * `damageCreature`, because a body on a string is still a body arriving.
 */
export interface StrandConfig {
  /**
   * Beads on a thread when the wave does not author a count. Three, which is
   * the smallest number at which the creature is itself: two is one exchange
   * and then the last bead, which the pair can answer without being told
   * anything, and three is the first count at which the order has to be kept.
   *
   * A wave may ask for `STRAND_MIN`..`STRAND_MAX` — `strandBeadCount` is the
   * clamp, and the ceiling is five because six beads is most of a seven-column
   * field and a thread that wide leaves the pilot nowhere to stand that is not
   * already under one.
   */
  strandBeads: number;
  /**
   * Beats between one step down and the next.
   *
   * **Two, and it is the hardest creature on the field asking for room.** Every
   * other living body comes down a tile a beat, which is what
   * `fallTilesPerBeat` answers for anything it does not name; a thread asks the
   * pair for two calls in two directions *per bead*, up to five times, and at a
   * tile a beat a thread of five reaches the ship before the third exchange is
   * finished. Half speed is what makes the sentence sayable.
   *
   * Beats and not tiles, `echoFallBeats`' unit and for its reason: the five
   * rock tiers go *faster* than a tile a beat and a tile count says so, while
   * anything slower can only be said as beats between steps. The simulation
   * stores integers, so half a tile is not a thing a body can move.
   */
  strandFallBeats: number;
  /**
   * What shrivelling one bead is worth. Half of `scoreDestroy`, on
   * `scoreRindShed`'s terms and for its reason: a bead is one shot out of
   * several against one arrival, and a mechanic that paid only when the thread
   * parted would teach the pair that every bead but the last was a tax.
   */
  scoreStrandBead: number;
  /**
   * What the thread itself is worth when the last bead goes. `scoreDestroy`'s
   * figure, so a whole strand pays as though the beads were bodies and the
   * thread were one more — the pair has held an order across a voice delay for
   * as many beats as it is long, and that is a kill in its own right.
   */
  scoreStrandBreak: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const STRAND_DEFAULTS: StrandConfig = {
  strandBeads: 3,
  strandFallBeats: 2,
  scoreStrandBead: 50,
  scoreStrandBreak: 100,
};
