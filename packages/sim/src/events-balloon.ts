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
   * It reached the top of the field and went off. The hull damage rides on the
   * `breach` beside it (`burstBalloon`); this is the burst itself, which is
   * the one thing in this creature that happens nowhere near the ship the
   * damage lands on.
   */
  | { type: "balloonBurst"; col: number; row: number };
