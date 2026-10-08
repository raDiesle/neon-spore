import { type DragTarget, TRIVET_PADS } from "@neon-spore/sim";
import { chordFinger } from "./chord.js";
import type { Touch } from "./touch.js";

/** A chord body: how many pads it has, and the body it closes with. */
interface ChordBody {
  pads: number;
  partner: DragTarget;
}

/** Every chord body in the game and its partner, which is always the other seat's. */
const BODIES: Partial<Record<DragTarget, ChordBody>> = {
  trivetPadFront: { pads: TRIVET_PADS, partner: "trivetPadRear" },
  trivetPadRear: { pads: TRIVET_PADS, partner: "trivetPadFront" },
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
 * only, so the partner's hold is signed with the other seat.
 *
 * Null for any press that is not on a chord body. A phone never asks: one
 * finger stays one pad.
 */
export function deskChord(first: Touch): Touch[] | null {
  const hold = first.hold;
  if (hold === null || !chordFinger(hold)) return null;
  const body = BODIES[hold.target];
  if (body === undefined) return null;
  const player = hold.player === 1 ? 2 : 1;
  const pads = BODIES[body.partner]?.pads ?? body.pads;
  return [
    { ...first, hold: { ...hold, pads: body.pads } },
    { player, command: null, hold: { ...hold, target: body.partner, player, pads } },
  ];
}
