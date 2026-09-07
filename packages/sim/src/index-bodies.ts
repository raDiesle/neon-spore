/**
 * **The four bodies that wear something**, narrowed to what render/ and the
 * tools actually ask of each — which body is inside, whether the covering is
 * still on, and what one costs the hull.
 *
 * Cut out of `index.ts` when THE COIL's row took that barrel past its 250-line
 * limit. A barrel is the one file in the simulation that cannot be split along
 * a seam in the *code*, because it has none — so it is split the way
 * `waves.ts` is, by subject, with the parent doing nothing but concatenating.
 * This is the group that grows: nearly every creature added since THE CLASP
 * has been a body inside a covering, and each has brought a line here.
 *
 * **Everything below is a reading, never a rule.** The step, the ward, the
 * shot and the chain are the simulation's alone and are called from inside it;
 * what leaves the package is only what a picture needs in order to draw what
 * is already true.
 */

export { type CaromDir, caromBecomes, caromHeading, caromImpactDamage } from "./carom.js";
export { chuteBecomes, chuteFalls, chuteIsOpen } from "./chute.js";
export { claspBecomes, claspIsShielded, claspStruck } from "./clasp.js";
export { coilImpactDamage } from "./coil.js";
export {
  type CoilDir,
  coilChargeAge,
  coilCharged,
  coilDue,
  coilHeading,
  coilIsDomed,
  coilWardReaches,
} from "./coil-state.js";
