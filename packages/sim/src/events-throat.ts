/**
 * **What THE THROAT's two hands do that neither screen already says**, as
 * three events (`throat-hand.ts`).
 *
 * Its own file on `events-vane.ts`' terms, and for the same reason twice over:
 * one boss, one arm of `SimEvent`, and a file `packages/audio/test/bind.test.ts`
 * has to be told the name of. The gullet shipped silent because everything it
 * did followed from the beat and both screens drew it — the mouth travels, the
 * rings choke, the tube everts. These three do not follow from anything: they
 * are the pair's own hands on the picture, and the beat they land on is not a
 * beat either clock predicts.
 *
 * A cinch is both seats', and that is the whole bargain being announced: her
 * thumb stops the gullet breathing, and his window opens on the sound of it.
 * A slip is both seats' for the same reason turned around — the window shut,
 * and he must hear it without looking away from the gum he is carrying. A haul
 * is both seats' too: she has already said the mouth's column out loud, and the
 * sound is the beat that number stops being true.
 *
 * All three carry the column the tube stands in, because the pan is the whole
 * of what a fixture can say about *where* — nothing of the gullet is among
 * `world.creatures` and there is no body to point at.
 */
export type ThroatEvent =
  /** The navigator's thumb landed on a slack ring: the gullet stops breathing. */
  | { type: "throatCinch"; col: number }
  /** The cinch ended — lifted, or torn out by the cap after `throatCinchBeats`. */
  | { type: "throatSlip"; col: number }
  /** The pilot's carry dragged the mouth a column, onto this one. */
  | { type: "throatHaul"; col: number };
