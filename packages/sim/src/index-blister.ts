/**
 * **THE BLISTER from outside**: whose blow counts, whether it is up, and the
 * gestures a pore can ask for — tap, hold, lever, rub, swipe and turn — each
 * with how far a hand on it has got.
 *
 * Cut out of `index-creatures.ts` with `index-maw.ts`, because it was the
 * largest family in that barrel by thirty lines and every new gesture adds a
 * group. The cycle and the tap stay inside (`stepBlister`, `blisterTapped`).
 *
 * **Everything here is a reading, never a rule**, as in its neighbours.
 */

export {
  BLISTER_SPENT,
  blisterByOf,
  blisterGestureOf,
  blisterHoldable,
  blisterIsUp,
  blisterMayTap,
  blisterPlaceRow,
  blisterSwelling,
} from "./blister.js";
// THE BLISTER: what render and the director ask of one — whose blow counts,
// whether it is up, whether its pore is swelling, how long it stays up.
// The cycle and the tap stay inside (`stepBlister`, `blisterTapped`); the
// gesture, whether a hand on it holds, and how far a hold is through its beat.
export { blisterHoldShare } from "./blister-hold.js";
export {
  blisterLeverDepth,
  blisterLeverHeld,
  blisterLeverInBand,
  blisterLeverShare,
} from "./blister-lever.js";
// And its three numbers, the gesture's default or the wave's for one body.
export {
  BLOWS as BLISTER_BLOWS_FIELDS,
  type BlisterLength,
  blisterBlowsLeft,
  blisterBlowsOf,
  blisterLengthMilliOf,
  blisterLengthOf,
  blisterUpBeatsOf,
  gestureBlows,
  gestureLengthMilli,
  gestureUpBeats,
  LENGTH as BLISTER_LENGTH_FIELDS,
  UP_BEATS as BLISTER_UP_BEATS_FIELDS,
} from "./blister-numbers.js";
export { blisterRubbing } from "./blister-rub.js";
export {
  blisterStrokes,
  blisterSwipeHeld,
  blisterSwipeShare,
  blisterWayOf,
} from "./blister-swipe.js";
export { blisterTurnHeld, blisterTurnShare, blisterTurnWayOf } from "./blister-turn.js";
export type {
  BlisterBy,
  BlisterGesture,
  BlisterSpawn,
  BlisterSwipeWay,
  BlisterTurnWay,
  BlisterWay,
} from "./creature-state-blister.js";
