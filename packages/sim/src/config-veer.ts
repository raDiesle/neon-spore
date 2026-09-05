/**
 * THE VEER's two numbers: how many times it changes lane on the way down, and
 * how far apart the rows it does it on are (`veer.ts`).
 *
 * Its own file rather than two more rows in `config-creatures.ts`, which was
 * one line under the 250-line limit the day this creature was written — the
 * immediate reason, and the same one `config-ghost.ts`, `config-recoil.ts` and
 * `config-gyre.ts` each record for themselves. The better reason is the one
 * `config-recoil.ts` gives: these two only mean anything against each other. A
 * count without a spacing says nothing about how long a call stays true, and a
 * spacing without a count says nothing about when the rock settles — they are
 * argued together or not at all.
 *
 * `SimConfig` extends this rather than nesting it, so every call site still
 * reads `cfg.veerChanges` and the split is only about how much of one file a
 * reader has to hold at once.
 *
 * **There is no fall speed in here, and that is the point.** A veer comes down
 * a row a beat because `fallTilesPerBeat` says so for anything it does not
 * name, drops through the same `grippedFallTiles` line in `beat.ts` every other
 * body does, and is turned at `shieldRow` by the same branch of `resolveHull` a
 * meteor is turned by. There is no damage figure either: one that reached the
 * ship arrived as the rock it always was and costs `damageMeteor`, because a
 * pair must never learn that the rock which moves is the cheaper one to give
 * up on.
 */
export interface VeerConfig {
  /**
   * Times it changes lane between the top of the field and the ship. Three,
   * and the number is the creature. One is a rock that surprises the pair
   * once, which they answer by waiting; two is that said twice. Three is the
   * first count at which parking the shield and watching is plainly worse than
   * listening to every call — and it is small enough that a pair who miss one
   * still have two more chances to be told.
   */
  veerChanges: number;
  /**
   * Rows between one change and the next, and therefore how long a column the
   * pilot says out loud stays true. Three, which at the default beat is a
   * little under two seconds — long enough for a number to cross the room and
   * be acted on, short enough that a shield left where it was is in the wrong
   * lane before the pair has finished congratulating itself.
   *
   * Three of them three rows apart puts the last change nine rows down, which
   * leaves five rows of straight fall before the ship. That tail is deliberate:
   * the pair has to be able to see the rock stop moving and settle into the
   * lane it will actually land in, or the ward would be a guess at the end
   * rather than the answer to the last thing they said.
   */
  veerRowsApart: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const VEER_DEFAULTS: VeerConfig = {
  veerChanges: 3,
  veerRowsApart: 3,
};
