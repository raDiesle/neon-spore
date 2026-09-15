/**
 * **THE BALLOON's three**: one given, one popped, one gone off at the top.
 *
 * Their own file beside `events-choir.ts`, `events-coil.ts` and
 * `events-carom.ts`, on the terms those set — `events-creature.ts` is at its
 * 250-line limit — and with an argument of its own. THE CHOIR's three are one
 * *gesture* taken apart and every other group is one *arrival* taken apart;
 * these three are neither. They are the three ways one body can stop being
 * what it was, and the pair reads them as a scoreline: *that one came apart*,
 * *that one is gone*, *that one got away and it cost us*.
 *
 * One arm of `CreatureEvent` and not a union anything handles on its own:
 * every consumer still switches over the whole list, which is what keeps a new
 * event a compile error rather than a silence.
 */
export type BalloonEvent =
  /**
   * Both hands were taut on one at the same instant and it came apart into two
   * smaller ones. The two halves are already on the field by the time anything
   * reads this, standing a column either side of `col` and swelling — so what
   * this reports is the *moment*, and the picture of the halves is the
   * ordinary one every body gets.
   */
  | { type: "balloonSplit"; col: number; row: number }
  /**
   * The last rub, and the only way this creature leaves the field without
   * costing the ship anything. The `destroy` beside it on the same tick throws
   * the particles (`rubBalloon`); this is the skin letting go, so the ear can
   * tell a body the pair finished from one that finished itself.
   */
  | { type: "balloonPop"; col: number; row: number }
  /**
   * **It reached the top and turned into a torch there**, which is the owner's
   * rule of 14 September 2026: the top of the field used to be a silent bill on
   * the hull and is a body the pair has to answer now (`balloon.ts` `topOut`).
   * `col` and `row` are where it turned, which is where the fall starts.
   *
   * It replaced `balloonBurst`, which said *it reached the top and went off*
   * and carried the hull's bill on a `breach` beside it. Nothing on the field
   * could push that any more once the top stopped costing the ship and the
   * sinking half of a split stopped existing, so it went with them; `pop`
   * above is the end the pair still *makes*, and it is the one the burst look
   * the owner asked for belongs to.
   */
  | { type: "balloonTopped"; col: number; row: number };
