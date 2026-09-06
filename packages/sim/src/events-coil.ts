/**
 * **THE COIL's two**: a dome coming off, and the charge it was holding leaving
 * for the next one.
 *
 * Their own file beside `events-carom.ts`, `events-volley.ts` and the four
 * others, on the terms those set: `events-creature.ts` is at its 250-line
 * limit, and these two are not two incidents that happen to share a creature —
 * they are one thing said twice, from each end. A dome fails, and a beat and a
 * half later another one fails *because of it*. Read together they are the
 * chain, which is the creature.
 *
 * One arm of `CreatureEvent` and not a union anything handles on its own:
 * every consumer still switches over the whole list, which is what keeps a new
 * event a compile error rather than a silence.
 */
export type CoilEvent =
  /**
   * A dome came off a coil and what is left is a rock at a torch's speed.
   *
   * `ward` is which of the two ways it happened: the shield reaching up its
   * column, or the charge arriving from another dome. It is on the event
   * rather than worked out downstream because the two have different pictures
   * — the ward's bolts come up out of the hull in the shield's column
   * (`render/clasp-strike.ts`), a chained one's came from the dome that failed
   * (`render/coil-jump.ts`) — and nothing else on this event tells them apart.
   *
   * `id` is the body, for `claspBreak`'s reason: the dome comes apart around a
   * creature that is *still on the field*, and a torch at thirteen rows a beat
   * is somewhere else on the next frame — so the picture of it failing has to
   * be redrawn wherever that body is rather than frozen where it opened. A
   * column and a row name a place; only an id names the thing that moved.
   *
   * No colour, because there is nothing alive in one: a coil is a rock in a
   * dome the whole way down, and the pair's whole exchange about one is a
   * column.
   */
  | { type: "coilBreak"; id: number; col: number; row: number; ward: boolean }
  /**
   * The charge left a failed dome for another coil still standing, and that one
   * comes open `coilJumpBeats` later.
   *
   * `col` and `row` are where it left **from**, and `id` is where it is going
   * — the asymmetry is deliberate and it is the same one `recoilBounce` makes.
   * The origin is a place: the dome that failed is already a rock falling out
   * of the picture, so freezing the tile it left is the honest thing to draw
   * from. The destination is a *body*, and that body is still crossing the
   * field for the whole flight, so a column and a row would have the bolt land
   * two lanes behind it.
   *
   * The bolt reaches player 1's screen and no one else's
   * (`render/coil-jump.ts`) — the seat that cannot move the dome — and the ear
   * gets it on both devices, panned to the **origin**. That is safe for
   * `wispHop`'s reason read the other way: the dome that just failed is a
   * thing both players watched happen, so a pip placed there tells player 2
   * nothing they did not see. A pip placed at the *destination* would put the
   * one fact player 1 has to say out loud straight through the speaker of the
   * phone in their partner's hand.
   */
  | { type: "coilJump"; id: number; col: number; row: number };
