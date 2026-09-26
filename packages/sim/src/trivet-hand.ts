import { midCol } from "./config.js";
import { chording, TRIVET_PADS, trivetBoss, trivetClosed } from "./trivet.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Two chords on THE TRIVET, one foot each.
 *
 * **Geometry says whose foot is whose**, THE MANTLE's rule (`mantle-hand.ts`):
 * `trivetPadFront` answers only Player 1 and `trivetPadRear` only Player 2,
 * and the wrong seat's press does nothing, silently.
 *
 * **One drag is one pad**: its `id` names the socket, nought up to
 * `TRIVET_PADS`, and `on` says whether it is down — `ChordHold`, §30's
 * primitive, as a mask of the pads each seat holds. An `id` off the foot is
 * not heard. Recorded whenever the stand is present, so a chord already down
 * when a step lights is counted from its first beat.
 *
 * What a chord is worth is counted on the beat (`trivet-step.ts`); what is
 * heard here is the one instant the beat cannot see — **a pad lifting** while
 * the lit chord step was counting, which starts its count again from nought.
 */
export function trivetHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  if (command.target !== "trivetPadFront" && command.target !== "trivetPadRear") return;
  const s = trivetBoss(world);
  if (s === null) return;
  const side: 0 | 1 = command.target === "trivetPadFront" ? 0 : 1;
  const wants: 1 | 2 = side === 0 ? 1 : 2;
  if (player !== wants) return;
  const pad = command.id ?? -1;
  if (!Number.isInteger(pad) || pad < 0 || pad >= TRIVET_PADS) return;
  const was = trivetClosed(s);
  const bit = 1 << pad;
  s.padsDown[side] = command.on ? s.padsDown[side] | bit : s.padsDown[side] & ~bit;
  if (!was || trivetClosed(s) || !chording(s)) return;
  s.heldBeats = 0;
  world.events.push({ type: "trivetSlip", side, col: midCol(world.cfg) });
}
