import { faultsNow } from "./fault-placed.js";
import { isHarpoonKind } from "./harpoon.js";
import type { Malfunction } from "./malfunction.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Whether this press falls into a control the fault has taken over.
 *
 * **In the simulation and not in the panel**, which is the whole point of it
 * being here. render/ draws a dead button dead, but a button is not the only
 * way into either of these commands — the ship itself is a second one
 * (`render/src/touch-ship.ts`), a guide's rehearsal is a third, and the wire
 * is a fourth. A rule enforced only where it is drawn is a rule a swipe on the
 * hull walks straight past, and two devices that disagree about whether a shot
 * happened have desynced.
 */
export function faultSwallows(world: World, c: Command): boolean {
  // **Any of them**, not the one. A wave may place several and they may
  // overlap; a press is swallowed if a single fault in force this beat takes
  // it (`fault-placed.ts`).
  return faultsNow(world).some((m) => eats(m, c));
}

/** Whether one fault in force eats this press. */
function eats(m: Malfunction, c: Command): boolean {
  // `prime` as well as `fire`: the trigger is a hold now, so a lobe a cannon
  // fault has taken over is pressed as a `prime` and would otherwise fill and
  // fire a lance out of a button the panel is drawing dead (`lance.ts`).
  if (m.kind === "cannon") return c.kind === "fire" || c.kind === "prime";
  // The strip, the swipe on the hull and the wire are all one door to the
  // cannon's column, and under THE CHOKE that door is shut.
  if (m.kind === "steer") return c.kind === "cannonCol";
  // THE LEECH and THE LIMPET must not swallow the strip in particular: moving
  // it is the whole answer to them.
  // The last five swallow nothing at all, and in all five that is the fault:
  // every button works and answers the thumb, and what has changed is what it
  // means (`codex.ts`), whose screen it is on (`handover.ts`), what standing
  // still now costs (`harpoon.ts`), or where the field really is (`flip.ts`).
  if (m.kind === "codex" || m.kind === "handover" || isHarpoonKind(m.kind)) return false;
  if (m.kind === "flip" || m.kind === "dark") return false;
  return c.kind === "guard";
}
