import {
  type BatonBead,
  batonActor,
  batonLaunchable,
  batonLead,
  batonLocked,
} from "@neon-spore/sim";
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
 * **Either seat's, since 6 October 2026** — the owner: *both players can
 * tap.* A bead sitting in its socket answers whichever thumb is on it, signed
 * with that screen's seat, and the simulation locks whoever pressed. The
 * crossing's trigger is still his alone, as it shipped: a navigator's thumb
 * on that bead falls through to whatever is behind it.
 */

/** The bead this seat's thumb would send now, or null while it would send none. */
function sendable(field: Field): BatonBead | null {
  const b = bossOf(field, "baton");
  if (b === null) return null;
  // A locked seat's thumb falls through: the simulation would swallow it, and
  // on the desk's both-seats screen the free seat is the one to sign it.
  if (batonLocked(b, field.seat, field.beat)) return null;
  if (b.stage === "passing") return batonLaunchable(field.cfg, b);
  if (b.stage === "crossing" && field.seat === 1 && batonActor(b) === 1) return batonLead(b);
  return null;
}

/** A press on the bead the trigger would send: this seat's `guard`. */
export function batonBeadUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const b = bossOf(field, "baton");
  const bead = sendable(field);
  if (b === null || bead === null) return null;
  const at = beadPoint(l, field.cfg, b, bead, field.tick);
  if (!hitCircle({ ...at, r: handleRadius(l, field.cfg) }, x, y)) return null;
  return { player: field.seat, command: { kind: "guard" }, hold: null };
}
