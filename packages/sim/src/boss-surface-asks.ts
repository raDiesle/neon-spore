/**
 * What a boss asks a hand for, and the clocks drawn round it: the names its
 * rings and the director read rather than re-derive. Cut off `boss-surface.ts`
 * at its ceiling, 16 October 2026.
 */

// Whether THE FLEET's wound asks for both thumbs, which its rings read (`fleet-grip-marks.ts`).
export { fleetWoundAsks } from "./fleet-hand.js";
// Which parts THE GAUGE asks a hand for, which its rings read (`gauge-marks.ts`).
export { gaugeBandAsks } from "./gauge-hand.js";
// Which marks THE MIRROR and THE BULB QUEEN ask a thumb for, which their
// rings read rather than re-derive (`render/mirror-grip.ts`, `queen-marks.ts`).
export { mirrorAsks, mirrorLobesOf } from "./mirror-hand.js";
export { queenAsks } from "./queen-hand.js";
// And THE REPRISE's schedule and its clock, which the director and the
// measure along the top of the screen read (`reprise-plan.ts`).
export { type RepriseEcho, reprisePlan } from "./reprise-plan.js";
export { type RepriseClock, repriseClock, repriseEvery } from "./reprise-state.js";
// And THE VANE's two parts, which its rings read the same way (`vane-marks.ts`).
export { vaneArmAsks, vaneHousingAsks } from "./vane-open.js";
