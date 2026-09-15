import { faultOn, type World } from "@neon-spore/sim";

/**
 * **What a harpooned control says under the dial of the seat that cannot move
 * it**: MOVE CANNON! and MOVE SHIELD!, the owner's own wording of 14 September
 * 2026, mark and all.
 *
 * `duty.ts` already carries a word for each of these two kinds, because both
 * shipped as creatures first: a leech falls down a lane onto the cannon, and
 * the table says KEEP MOVING to the pilot who holds it and SAY MOVE to the
 * navigator who can see it stuck. Those rows are right and they stay. What
 * they cannot say is *which* control, because as a creature there is a body
 * falling down a lane and both seats watched it land.
 *
 * **As a malfunction there is nothing to watch.** The fault is a pencil on the
 * map, the body is fired from the emitter and is already holding the control
 * on the beat the placement starts (`sim/harpoon.ts`), and the seat without
 * that control has no panel to read it off. So the general word is replaced by
 * the specific one, on that seat and on no other — `fenceWord`'s arrangement
 * one kind along, and for the same reason: the row is the shape and the
 * default, and something about the world picks the wording.
 *
 * The seat that *has* the control keeps KEEP MOVING, which is the whole of
 * what it owes: it can feel the control failing and the only answer is the
 * thumb already on it.
 *
 * The exclamation is the owner's and it is kept. Nothing else on either dial
 * carries one, which is why it reads: a line that shouts every time is a line
 * shouting about nothing.
 */

/** The seat that cannot move each kind's control, and what it is told to ask
 * for. Not a `Partial` and not a lookup by control name: the pairing of a kind
 * to a seat is the fact, and writing it once is what stops the cannon's word
 * ever appearing under the seat holding the cannon. */
const AWAY = {
  // THE LEECH takes the cannon, which is the pilot's — so the navigator asks.
  leech: { seat: "p2", word: "MOVE CANNON!" },
  // THE LIMPET takes the dome, which is the navigator's — so the pilot asks.
  limpet: { seat: "p1", word: "MOVE SHIELD!" },
} as const;

/**
 * The word this kind puts under this seat instead of the table's, or null for
 * every other seat and every wave that placed no such pencil.
 *
 * `faultOn` rather than `faultInWave`: the word is about a control that is
 * stuck *now*. A wave carrying the pencil eight beats from here has nothing to
 * ask for yet, and a dial that said so early would be the siren lighting for a
 * body that has not arrived — which is a thing this game does exactly once, on
 * purpose, for THE TORCH (`comms.ts`).
 */
export function harpoonWord(kind: string, seat: "p1" | "p2", world: World): string | null {
  const of = kind === "leech" || kind === "limpet" ? AWAY[kind] : null;
  if (!of || of.seat !== seat) return null;
  return faultOn(world, kind as "leech" | "limpet") === null ? null : of.word;
}
