/**
 * THE VEER's two numbers: how far apart the rows it changes lane on are, and
 * the widest a single change can reach (`veer.ts`).
 *
 * Its own file rather than two more rows in `config-creatures.ts`, which was
 * one line under the 250-line limit the day this creature was written — the
 * immediate reason, and the same one `config-ghost.ts`, `config-recoil.ts` and
 * `config-gyre.ts` each record for themselves. The better reason is the one
 * `config-recoil.ts` gives: these two only mean anything against each other. A
 * spacing without a width says nothing about how far a call can be wrong by,
 * and a width without a spacing says nothing about how long the pair has to
 * act on one — they are argued together or not at all.
 *
 * `SimConfig` extends this rather than nesting it, so every call site still
 * reads `cfg.veerRowsApart` and the split is only about how much of one file a
 * reader has to hold at once.
 *
 * **There used to be a third number here, `veerChanges`, and cutting it is the
 * creature.** It capped the changes at three, which put the last one nine rows
 * down and left a tail of straight fall the pair could watch the rock settle
 * in. The owner asked for that tail gone on 6 September 2026: a rock that stops
 * moving is a rock the old habit answers again — say the column once, park the
 * shield, stop looking — and the last thing anybody said about it being still
 * true when it lands is exactly what every other rock already offers. It
 * changes lane every `veerRowsApart` rows for the whole of its fall now, and
 * the pilot's arrow stands over it the whole way down.
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
   * Rows between one change and the next, and therefore how long a column the
   * pilot says out loud stays true. Three, which at the default beat is a
   * little under two seconds — long enough for a number to cross the room and
   * be acted on, short enough that a shield left where it was is in the wrong
   * lane before the pair has finished congratulating itself.
   *
   * Three of them across the fifteen rows of the field puts changes on rows 3,
   * 6, 9 and 12, and the last of those is one row above the one the shield
   * answers at. That is the creature: there is no row on the way down at which
   * the pair may stop listening, and the final call is the one that has to be
   * said and acted on quickest.
   */
  veerRowsApart: number;
  /**
   * The widest a single change of lane can reach, in columns. Each change
   * rolls a fresh distance from one to this many (`veerPickChange`), so the
   * pilot's arrow is never the same-sized sentence twice in a row — a rock
   * that always stepped one tile would be answerable by a shield that just
   * shadows it, and this is what keeps the number worth saying out loud.
   *
   * Four, because it is most of the field's width in one step and the pair
   * still has three rows to act on it: wider and the rock would sometimes
   * cross more of the field than the shield can close in the time a change
   * gives them, which turns a call into a coin flip rather than an order to
   * follow.
   */
  veerMaxDist: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const VEER_DEFAULTS: VeerConfig = {
  veerRowsApart: 3,
  veerMaxDist: 4,
};
