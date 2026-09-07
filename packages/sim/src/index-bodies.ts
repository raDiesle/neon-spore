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

// THE BEATBOX's readings: what one is asking for, how far into a run it is,
// and which beat a thumb landing now would answer. Render draws the first on
// player 1's screen and the second on player 2's, and the hit test asks the
// third so that the swell a finger is aiming at and the beat the simulation
// credits are one moment. The rules stay inside — nothing here decides whether
// a tap counted (`beatbox-round.ts`).
export {
  beatboxBeatFor,
  beatboxHitsMade,
  beatboxIsBox,
  beatboxRunOpen,
  beatboxWanted,
  beatboxWindowTicks,
} from "./beatbox.js";
// THE BALLOON's readings: how far through its swell one is, how fast it
// climbs and how many times it still comes apart — everything a picture needs
// to draw a body growing, leaning and about to give.
export {
  balloonHeading,
  balloonIsSwelling,
  balloonRiseRows,
  balloonSplitsLeft,
  balloonSwellPhase,
} from "./balloon.js";
// And its two hands, the rows in this file that are not a reading of a body at
// all: the handles are a *control*, so render/ has to know how far each seat
// has carried its own in order to draw the skin giving on that side. The rule
// stays inside — nothing here decides whether a pull counted.
export {
  balloonHeld,
  balloonIsRubbed,
  balloonPull,
  balloonSideTaut,
  balloonTension,
} from "./balloon-pull.js";
export { type CaromDir, caromBecomes, caromHeading, caromImpactDamage } from "./carom.js";
export {
  choirBecomes,
  choirFusePhase,
  choirIsDots,
  choirIsFusing,
  choirOnField,
} from "./choir.js";
// THE CHOIR's hand, and the one row in this file that is not a reading of a
// body: the arrows and the shake are a *control*, so render/ has to know which
// arrow is standing out in order to draw the other one as the next thing to
// carry. The rule stays inside — nothing here decides whether a pull counted.
export { CHOIR_SHAKEN, type ChoirArm, type ChoirSide, choirArmed } from "./choir-gesture.js";
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
