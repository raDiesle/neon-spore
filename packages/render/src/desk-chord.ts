import { type DragTarget, TRIVET_PADS } from "@neon-spore/sim";
import { chordFinger } from "./chord.js";
import type { Touch } from "./touch.js";

/** A chord body: how many pads it has, the body it closes with, and whose that one is. */
interface ChordBody {
  pads: number;
  partner: DragTarget;
  /** Whether the partner is the other seat's body, or the same seat's other half. */
  across: boolean;
}

/** Every chord body in the game and its partner. A HALTER grip is one pad: the grip is the bit. */
const BODIES: Partial<Record<DragTarget, ChordBody>> = {
  trivetPadFront: { pads: TRIVET_PADS, partner: "trivetPadRear", across: true },
  trivetPadRear: { pads: TRIVET_PADS, partner: "trivetPadFront", across: true },
  halterChordLeft: { pads: 1, partner: "halterChordRight", across: false },
  halterChordRight: { pads: 1, partner: "halterChordLeft", across: false },
};

/**
 * **A desk press on a chord body is the whole chord** — the owner's answer of
 * 3 October 2026, the first of three: a held mouse on any pad of a chord says
 * every pad down, of its own body and of its partner's, the way THE INSTAR's
 * `HOLD BOTH` ring is both thumbs (`desk-grab.ts` `deskDownAll`).
 *
 * A chord is fingers counted in the order they land (`chord-pads.ts`), and a
 * mouse is one pointer, so it was one pad on one body and a two-body clamp
 * — all four pads — ran out and sprang every time.
 *
 * **The partner is the other seat's** on THE TRIVET's feet; the simulation hears a seat's own body
 * only, so the partner's hold is signed with the other seat. **THE HALTER's is
 * the same seat's other grip**: a chord there is one seat's two grips while
 * the other rests, and a grip from the rester would startle it
 * (`sim/halter-hand.ts`).
 *
 * Null for any press that is not on a chord body. A phone never asks: one
 * finger stays one pad.
 */
export function deskChord(first: Touch): Touch[] | null {
  const hold = first.hold;
  if (hold === null || !chordFinger(hold)) return null;
  const body = BODIES[hold.target];
  if (body === undefined) return null;
  const player = body.across ? (hold.player === 1 ? 2 : 1) : hold.player;
  const pads = BODIES[body.partner]?.pads ?? body.pads;
  return [
    { ...first, hold: { ...hold, pads: body.pads } },
    { player, command: null, hold: { ...hold, target: body.partner, player, pads } },
  ];
}
