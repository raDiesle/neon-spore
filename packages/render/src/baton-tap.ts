import { type BatonBead, batonActor, batonLaunchable, batonLead } from "@neon-spore/sim";
import { beadPoint } from "./baton-bead-draw.js";
import { handleRadius } from "./handle-draw.js";
import { hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **Player 1's thumb on the bead is the trigger.** The field writes `TAP` /
 * `TO LAUNCH IT` on a bead in its socket and `TAP` / `TO SEND IT DOWN` on the
 * crossing's (`boss-cue-read-i-b.ts`, `boss-cue-read-i.ts`), and until 2
 * October 2026 nothing answered a finger there: the launch was the `guard`
 * button on the band and the shield lobe on the hull, and a player who did
 * what the field said pressed nothing. A control is never drawn in one place
 * and answered in another (`touch.ts`), so the bead now answers the word
 * written on it.
 *
 * It sends `guard` and nothing else, because that *is* the launch
 * (`sim/baton-press.ts` `batonLaunch`): the dome coming up with it is what
 * the button already does, and a second command for the same act would be a
 * second thing for the lock and the replay to agree on.
 *
 * **His alone.** The mark is only ever on his screen; a navigator's thumb on
 * the bead falls through to whatever is behind it, which is also what lets
 * the desk's both-seats screen find it by asking the other seat
 * (`desk-grab.ts`, its second question).
 */

/** The bead the trigger would send now, or null while it would send none. */
function sendable(field: Field): BatonBead | null {
  const b = bossOf(field, "baton");
  if (b === null) return null;
  if (b.stage === "passing") return batonLaunchable(field.cfg, b);
  if (b.stage === "crossing" && batonActor(b) === 1) return batonLead(b);
  return null;
}

/** A press on the bead the trigger would send: player 1's `guard`. */
export function batonBeadUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const b = bossOf(field, "baton");
  const bead = sendable(field);
  if (field.seat !== 1 || b === null || bead === null) return null;
  const at = beadPoint(l, field.cfg, b, bead, field.tick);
  if (!hitCircle({ ...at, r: handleRadius(l, field.cfg) }, x, y)) return null;
  return { player: 1, command: { kind: "guard" }, hold: null };
}
