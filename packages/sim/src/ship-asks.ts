import { claspIsShielded } from "./clasp.js";
import { linkIsArmoured, linkIsSucked } from "./crawler-part.js";
import { crystalUnder } from "./crystal.js";
import { isWardable } from "./kinds.js";
import { morselIsLimp } from "./morsel.js";
import { moultIsPod } from "./moult.js";
import { inMawReach } from "./pod-intake.js";
import { occupiesCol } from "./span.js";
import { MILLI, type World } from "./world.js";

/**
 * **Whether something on the field is asking for the shield or the mouth
 * this frame** — the owner, 16 October 2026: *when the shield or cannon is
 * below a boss tile vertical or an enemy which requires shield, then also the
 * button should highlight … for shield and suck, show it also for regular
 * waves, whenever vertical.*
 *
 * Read by render to ring the SHIELD and SUCK buttons with the shot's mark
 * (`ship-button-mark.ts`), and by nothing in the rules. Each half is the
 * union of the rules that already answer the question, called rather than
 * written out again, so a body the dome turns is a body the button lights for.
 */

/**
 * A body the dome answers is standing in the shield's column: a rock or a
 * volley (`isWardable`), a clasp (`breakClaspsInColumn`), a moult wearing its
 * rock (`moultArrives`), a crystal the plate is under (`crystalUnder`), or a
 * shield ring of THE CRAWLER (`wardLink`).
 */
export function shieldAsked(world: World): boolean {
  const rock = !moultIsPod(world.cfg, world.waveBeat);
  for (const c of world.creatures) {
    if (c.kind === "crystal") {
      if (crystalUnder(world, c)) return true;
      continue;
    }
    const answered =
      isWardable(c.kind) || claspIsShielded(c) || (c.kind === "moult" && rock) || linkIsArmoured(c);
    if (answered && occupiesCol(c, world.shieldCol)) return true;
  }
  return false;
}

/**
 * A cargo falling where the mouth reaches: a pod knocked loose, a moult
 * wearing its pod, a limp morsel — all inside `inMawReach` of the cannon — or
 * a suck ring of THE CRAWLER in the cannon's own column (`crawler-suck.ts`).
 *
 * **A husk lights it too**, on purpose. It shows player 1 a real pod's face
 * (`pod-types.ts`), and a button that stayed dark under a husk would be the
 * tell the creature exists to withhold.
 */
export function suckAsked(world: World): boolean {
  for (const p of world.pods) {
    if (p.loose && inMawReach(world, Math.round(p.colMilli / MILLI))) return true;
  }
  const pod = moultIsPod(world.cfg, world.waveBeat);
  for (const c of world.creatures) {
    const cargo = (c.kind === "moult" && pod) || (c.kind === "morsel" && morselIsLimp(c));
    if (cargo && inMawReach(world, c.col)) return true;
    if (linkIsSucked(c) && c.col === world.cannonCol) return true;
  }
  return false;
}
