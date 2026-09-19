/**
 * **What THE THROAT does that neither screen already says**, as seven events:
 * the pair's two hands on the gullet (`throat-hand.ts`), and the gullet's own
 * clock.
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
 * The clock's four came later, and the reason they were not there on the first
 * day was wrong: both screens *draw* the inhale, the choke, the swallow and the
 * eversion, and what the pair actually does during this fight is look at the
 * other half of its own screen. The inhale is the beat player 2 has been
 * counting down out loud and the one beat being wrong about costs a ring; the
 * swallow is the boss healing off the pair's own habit of clearing the field,
 * which is the one thing here they are punished for not noticing; the choke is
 * the payoff for the arithmetic sentence they said to each other; and the
 * eversion is the ending. A thing you are punished for not seeing, in a game
 * whose control scheme is talking, has to have a sound.
 *
 * All seven carry the column the tube stands in, because the pan is the whole
 * of what a fixture can say about *where* — nothing of the gullet is among
 * `world.creatures` and there is no body to point at.
 */
export type ThroatEvent =
  /** The navigator's thumb landed on a slack ring: the gullet stops breathing. */
  | { type: "throatCinch"; col: number }
  /** The cinch ended — lifted, or torn out by the cap after `throatCinchBeats`. */
  | { type: "throatSlip"; col: number }
  /** The pilot's carry dragged the mouth a column, onto this one. */
  | { type: "throatHaul"; col: number }
  /** The gullet drew breath this beat — the count player 2 has been saying. */
  | { type: "throatInhale"; col: number }
  /** A flung gum arrived at the mouth: a ring goes slack, and stays slack. */
  | { type: "throatChoke"; col: number }
  /** The mouth took what stood in it, and every mouthful re-tightens a ring. */
  | { type: "throatSwallow"; col: number }
  /** The last ring went slack: the tube turns through its own mouth. */
  | { type: "throatEvert"; col: number };
