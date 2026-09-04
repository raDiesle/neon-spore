import type { Color, CreatureKind } from "./types.js";

/**
 * **What THE VOLLEY does**, as events: a ward that sends it back, and the
 * shell bursting over the body it was carrying.
 *
 * Its own file rather than two more rows in `events-creature.ts`, which is at
 * its 250-line limit, and on `events-carom.ts`'s terms next door: these two
 * are one arrival taken apart rather than two incidents that share a creature.
 * A ward is not over when it has happened — it is the middle of a rally, and
 * the second event is the end of the same sentence the first one started.
 *
 * Both carry the argument the whole of `events-creature.ts` carries, and this
 * creature needs it as sharply as THE CAROM does: the reflex a `deflect` sets
 * off is right everywhere else on this field and is half wrong here, because
 * a ward that worked has not closed the column.
 *
 * One arm of `CreatureEvent` and not a union anything handles on its own:
 * every consumer still switches over the whole list, which is what keeps a new
 * event a compile error rather than a silence.
 */
export type VolleyEvent =
  | { type: "volleyReturn"; id: number; col: number; row: number; left: number }
  /**
   * The shell burst at the top of the last climb and the body inside is loose,
   * in mid-air, halfway up the field. `kind` is what it *became* — by the time
   * anything reads this the creature is already a slick or a bulb, and an
   * event naming the old kind would describe something no longer on the field
   * — and `color` is the one it now carries, which nothing authored a lure to
   * hide: it has been burning through the seams the whole way down, so this is
   * the pair being told that the sentence they had ready is finally the one
   * that works. Absent only for a colourless volley, which nothing authors.
   *
   * Its own event rather than a `destroy`, and it is `caromCrack`'s argument
   * pointed the other way: there the column stopped being the cannon's and
   * became the shield's, and here it stops being the shield's and becomes the
   * cannon's. Either way the one thing the pair must not hear is "done".
   */
  | { type: "volleyHatch"; col: number; row: number; kind: CreatureKind; color?: Color };
