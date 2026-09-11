import type { CreatureKind } from "@neon-spore/sim";
import type { Talker } from "./comms.js";

/**
 * **One row per creature: who has to speak about it.**
 *
 * Cut out of `comms.ts` on purpose rather than under pressure — that file sat
 * at 250 lines exactly and takes a row for every creature added, so the next
 * lane would have been the one choosing where the cut went (`docs/queue.md`,
 * 6 September 2026). The seam is the one the file already had in it: next door
 * is the argument for there being a single siren at all and the reading that
 * lights it, and this is the table that argument is about.
 */

/**
 * **Every kind has a row, including the twelve that say nothing.** This was a
 * `Partial<Record<…>>` with five entries, which reads as the shorter list and
 * is the one that goes wrong: a kind whose whole point is that one screen sees
 * it and the other does not is exactly the kind somebody adds in a hurry, and
 * leaving it out here cost no compile error, no failing test, and no visible
 * defect — only a siren that never lit, on the one creature that needed it.
 * `satisfies Record<CreatureKind, …>` makes the omission a build error, so the
 * question is asked of every new body whether or not the answer is `null`.
 *
 * `null` means the two of them see the same thing and neither has to speak.
 * That is the ordinary answer and it is a decision, not a blank.
 */
export const TALKER = {
  veil: "p1",
  // THE GHOST, and the plainest row in the table: the navigator is the only
  // one who can see the body at all, and the pilot — who holds the cannon
  // that has to be under it — is shown a band across its row and nothing
  // about the column. So the navigator speaks, and what they say is a number.
  ghost: "p2",
  lure: "p2",
  dart: "p2",
  queen: "p2",
  torch: "p1",
  // The sharpest row in the table: every other creature here is a body both
  // screens draw with something about it hidden. A wisp is not on player 1's
  // screen at all, so there is nothing for the pilot to be looking at while
  // they listen — which makes the siren the only thing telling them that the
  // empty field they are staring at is not empty.
  wisp: "p2",
  // THE GYRE, both halves, and it is the loudest `null` in the table. Both
  // screens draw the whole wheel and every colour on it — nothing at all is
  // hidden — and the pair still cannot stop talking, because what has to be
  // said about one is not a secret but a *moment*: which column a rim position
  // will have reached, and when the maw goes. A siren here would teach them to
  // look for something withheld, and nothing is.
  gyre: null,
  mount: null,
  // THE LID, and it is the gyre's `null` said about a hand instead of a beat.
  // Both screens draw the whole body, the plates, how far they have parted and
  // the colour of the lens behind them — nothing at all is withheld — and the
  // pair still has to talk, because what they have to agree on is a *moment*
  // in two hands. A siren here would teach them to look for something hidden,
  // and there is nothing hidden to find.
  lid: null,
  // Both screens carry these whole: nothing about them is split, so a siren
  // over one would be a lamp saying "look at the field", which is not news.
  slick: null,
  bulb: null,
  throb: null,
  // THE ECHO carries nothing hidden either — both screens draw all four bodies
  // whole. What the pair has to say about one is an order rather than a
  // secret, and a siren over a body neither of them is missing anything about
  // would be teaching them to look instead of to decide.
  echo: null,
  // THE RIND carries nothing hidden either, and less than any of them: both
  // screens draw the whole body and its size says what is left of it. What the
  // pair has to say about one is that it is not finished, which is a thing
  // they can both already see — a siren would be teaching them to look at the
  // strip instead of at the column they are meant to be holding.
  rind: null,
  // THE RECOIL is the same `null` as THE GYRE's, said about a body instead of
  // a wheel: both screens draw the cage, the damage on it and the colour
  // inside, and nothing whatever is withheld. The pair still cannot stop
  // talking, because what they have to say is a column and a colour that both
  // went stale on the beat their own shot landed — and a siren here would
  // teach them to look for something hidden that is not there.
  recoil: null,
  // THE CAROM, and it is THE RECOIL's `null` said about a wall instead of a
  // bounce: both screens carry the whole body, the crust, the colour burning
  // through it and the diagonal it is on, and nothing whatever is withheld.
  // The pair still cannot stop talking, because what they have to agree is a
  // column neither of them can reach in one beat and then an *order* — crack
  // it, then ward what falls out. A siren here would teach them to look for
  // something hidden that is not there.
  carom: null,
  // And the body it throws out, on exactly the same terms: both screens draw
  // the whole of it, going up and then coming down, in a colour neither of
  // them has to be told. What the pair has to say about one is *that it is
  // still up there* while they are both looking at the rock — which is a thing
  // to remember rather than a thing to reveal, and a siren cannot help with
  // remembering.
  chute: null,
  // THE VOLLEY, and it is THE CAROM's `null` said about a ward instead of a
  // wall: both screens carry the whole body, the shell, the plates still on it
  // and the colour burning through the seams, and nothing whatever is
  // withheld. The pair still cannot stop talking, because what they have to
  // agree is a column three times over and each one expires on the beat their
  // own ward lands. A siren here would teach them to look for something hidden
  // that is not there — the strip already says one is coming, on the seat that
  // holds the trigger and cannot move the shield.
  volley: null,
  shell: null,
  clasp: null,
  warden: null,
  tether: null,
  // The rocks, for the reason written above: one is in nearly every wave, and
  // a siren lit through a whole wave stops being a warning. The torch has its
  // own row up there because it is the one rock that cannot be answered late.
  // The one rock in the table, and it is there for the reason the plain tiers
  // are not: a meteor on the field is a column both screens can read, and this
  // one's column expires three times on the way down. The pilot is drawn the
  // arrow and the navigator holds the shield, so the pilot speaks.
  veer: "p1",
  meteor: null,
  meteorMedium: null,
  meteorFast: null,
  meteorFaster: null,
  meteorFastest: null,
  // THE STRAND, and the only `"both"` in the table. See `Talker` above: this
  // is the one body where each seat is holding half of one sentence and
  // neither half is worth anything alone.
  strand: "both",
  // THE CRAWLER, and it is THE GYRE's `null` said about two *controls* instead
  // of one moment. Both screens carry the whole worm — the head, the tail, and
  // every segment in the colour or the plate that answers it — and nothing
  // whatever is withheld. The pair still cannot stop talking, because what
  // they have to agree is an *order of work* on one body that is walking: who
  // takes the next link, and therefore which of them is about to be holding a
  // column and which a trigger. A siren here would teach them to look for
  // something hidden, and the whole point of this creature is that the plan is
  // in plain sight and still has to be spoken.
  crawler: null,
  // THE FENCE, and the table's own rule with nothing left over: the pilot is
  // shown where the wall is open and the navigator, the one seat that can move
  // the dome, is shown a line with no way through it at all. It is THE VEER's
  // row pushed as far as it goes — there the pilot knows which lane the rock
  // takes next, here the pilot knows the only lane there is.
  fence: "p1",
  // THE MAGNET, and the one row here that is not about a fact one screen is
  // missing. Both seats see the horseshoe, the plate and both poles; what only
  // the pilot knows is which side they are about to come in from, because they
  // are the one deciding it. That makes it a **decision** withheld rather than
  // a picture withheld, and it is withheld the same way for the same reason:
  // player 2 is holding both triggers and cannot pick one until it is said.
  magnet: "p1",
  // THE COIL, and it is THE FENCE's row said about an *order* instead of a
  // place. Both screens carry the domes, the rocks that drop out of them and
  // the whole crossing; what only the pilot is drawn is the **bolt** — which
  // dome the charge is on its way to (`render/coil-jump.ts`). So the one thing
  // withheld is which column comes open next, and it is withheld from the only
  // seat that can put the plate there. Four beats between the bolt leaving and
  // the rock landing is one call, not a sentence.
  coil: "p1",
  // THE CHOIR, and the first row here where what one seat has is not a *fact*
  // the other lacks but a **gesture** the other has not got. Both screens draw
  // the same pair and the same grey membrane; only the pilot's carries
  // the arrows, and only the pilot's phone is the one being shaken. The
  // navigator is holding both triggers over a body nothing can shoot yet, so
  // the one thing they need to hear is that it is about to become one — which
  // is this table's own sentence said about a hand instead of a picture.
  choir: "p1",
  // THE BEATBOX, and the plainest row in this table since THE GHOST's column.
  // Both screens draw the same swelling body; only the pilot's carries the
  // **number of beats** it is asking for, and only the navigator can put a
  // thumb on it. So what has to cross the room is a single digit, said once,
  // early enough that the thumb can spend it — and the seat that can read it
  // is by construction the seat with nothing to press.
  beatbox: "p1",
  // THE BALLOON, and the first row here where **nothing at all is withheld**.
  // Both screens draw the whole body, both handles and both stretches; there
  // is no fact one seat has and the other lacks. What is split is not the
  // information but the *hand*: one each, and neither is worth anything on its
  // own, so a field of several rising bodies is answered by both of them
  // saying the same one out loud. `"both"` for a reason THE STRAND's row does
  // not have — there each seat holds half a fact, here each holds half a
  // gesture — and it is the same conclusion, which is why it is the same word.
  balloon: "both",
  // THE CRYSTAL: both screens draw the whole of it, the join's colour
  // included, and the light under the join is on both. Nothing is withheld —
  // what the pair has to do is put four thumbs in one lane on one beat, which
  // a siren cannot help with.
  crystal: null,
  // THE GUM: the balloon's "both" for the balloon's reason — each seat holds
  // half a gesture, the cannon under it and the swipe across it, and neither
  // half is anything on its own.
  gum: "both",
  // Both again, for the gum's reason turned round: the pilot has to say how
  // many taps are left and the navigator where the cannon will be on the
  // beat she fires, and neither can read the other's off the screen.
  choke: "both",
} as const satisfies Record<CreatureKind, Talker | null>;
