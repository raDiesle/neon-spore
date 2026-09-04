import type { Color } from "./types.js";

/**
 * **Everything THE CAROM and the body it throws out do**, as events.
 *
 * Split out of `events-creature.ts` when the fourth of them took that file
 * past its 250-line limit, and along the seam `config-carom.ts` argues for
 * next door: four events about one arrival have stopped being rows in a
 * shared list and become a section, and a section is a file. The three that
 * stayed with their neighbours — a disguise, armour, weather — are one or two
 * each and are read one at a time.
 *
 * They are also the one group in that list that describes a **sequence**
 * rather than an incident. A shell chips, a cloud shuts, a ghost lets go; each
 * is over when it has happened. These four are one arrival taken apart: it
 * turns at a wall, it cracks, it throws its body clear, and that body opens a
 * canopy at the top of the field — and every one of them is a thing the pair
 * has to do something different about. Read together they are the creature.
 *
 * One arm of `CreatureEvent` and not a union anything handles on its own:
 * every consumer still switches over the whole list, which is what keeps a new
 * event a compile error rather than a silence.
 */
export type CaromEvent =
  /**
   * THE CAROM touched a side wall and turned. `dir` is which way it is going
   * **now**, not which way it arrived, on `veilMorph`'s terms and for its
   * reason: the whole content of this event is that the lane the pair had
   * agreed on has stopped being on the way there. The wall is also the one
   * instant of this creature either of them can plan around, and the ear gets
   * it so the seat looking at the cannon rather than at the field hears the
   * turn happen.
   */
  | { type: "caromBounce"; col: number; row: number; dir: -1 | 1 }
  /**
   * The crust came off a carom and what is left is a rock. `color` is the shot
   * that opened it, which is also the body that was inside — nothing else
   * cracks one — and `span` is how wide that rock is, which is how wide the
   * carom was (`caromStruck`).
   *
   * Its own event rather than a `destroy`, and this is the sharpest case of
   * the argument `rindShed` and `recoilBounce` already make: the reflex that
   * pays off everywhere else on the field is only *half* right here. A kill
   * sound would tell the pair the column is closed at the exact moment it has
   * become the shield's problem, and the one thing this creature cannot
   * survive is player 1 hearing "done" and lifting their thumb off the trigger.
   */
  | { type: "caromCrack"; col: number; row: number; span: number; color: Color }
  /**
   * The body sealed inside that carom, blown out of the hatch on the same tick
   * the crust came off. `id` is the chute it became, for `rindShed`'s reason:
   * it is *travelling*, upward and fast, so the picture of the ejection has to
   * be redrawn around wherever it is this frame rather than frozen on the tile
   * the shot met it on.
   *
   * Beside `caromCrack` rather than in place of it, because they are two
   * things and the pair has to hear both: one is the rock the shield now owes,
   * and the other is the body the cannon still does.
   */
  | { type: "caromEject"; id: number; col: number; row: number; color: Color }
  /**
   * A chute reached the top of the field and its canopy opened. From this beat
   * it is coming back down instead of going up, which is the only transition
   * this body has — and it happens off the top of the screen's attention,
   * while both players are busy with the rock the same shot made.
   */
  | { type: "chuteOpen"; col: number; row: number; color: Color };
