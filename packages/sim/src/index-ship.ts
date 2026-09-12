/**
 * **The ship, and what a thumb does to it**: the hull and its guard, the grip
 * and the carry out of it, the lance, the lock, the maw and its pods, THE
 * LID's cord, THE CLAW's arm, and a shot being laid.
 *
 * Cut out of `index.ts` with `index-creatures.ts`, for the reason written at
 * the top of that file. The line between the two is the one the game is built
 * on: over there is what arrives, and here is what the pair has to answer it
 * with.
 *
 * **Everything here is a reading, never a rule.** What a press does is decided
 * inside the package (`commands.ts`); what leaves it is only what a picture and
 * a panel need in order to draw what is already true.
 */

export {
  crankBites,
  crankTurnedMilli,
  crankWinds,
  NO_CRANK,
  TURN as CRANK_TURN,
  windPerTickMilli,
} from "./crank.js";
export {
  gripBrakes,
  gripCount,
  gripsCreature,
  NO_GRIP,
  nearestHull,
  setGrip,
} from "./grip.js";
export { carryIsReady, type GripPush, gripPushOf } from "./grip-push.js";
// What a hand on a body *is* — the one rule the sim, the hit test and the
// picture all ask rather than answer for themselves (`hand.ts`).
export { type HandMeans, handMeans } from "./hand.js";
export { isqrt, type PullVec, tileCentreMilli } from "./handle-pull.js";
export { type BreachWeight, guardArmed, ticksSinceGuard } from "./hull.js";
export {
  beamTicks,
  type LanceBeam,
  lanceReady,
  type Prime,
  primeChargeMilli,
  primeColor,
  priming,
} from "./lance.js";
export { lidHandleMilli, lidIsHeld, lidIsOpen, lidOpenMilli, lidPull, lidSide } from "./lid.js";
export { isLockedOn, lockedBody } from "./lock.js";
export { mawOpen, podKindOf } from "./pods.js";
export { ARM_HOME, reachOut, reachTipMilli } from "./reach.js";
export {
  chargeDueTick,
  chargeMilli,
  chargePartTicks,
  laying,
  type ShotCharge,
} from "./shot-charge.js";
// THE WEIGHT: whether both hands are on one, and how far the press has come.
// The picture asks both rather than reading `weightPressTicks` off the body —
// absent and nought are the same answer to a caller and two different worlds to
// the fingerprint, and the moment is the tick count's to decide, never the
// rounded readout's (`weight.ts`).
export { weightPressed, weightPressMilli, weightPressTicks } from "./weight.js";
