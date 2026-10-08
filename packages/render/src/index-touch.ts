/**
 * **The touch half of the barrel** — a finger on the field, and whose it is.
 *
 * Cut out of `index.ts` on 25 September 2026, when `hitReach` took it to 237
 * of its 250 lines. The seam is by consumer: everything here is read by a host
 * that has to answer a pointer the way the frame is drawn — `apps/game`'s field
 * input, the director's stage and desk — and nothing that only draws imports
 * it. `index.ts` re-exports the page whole, so no import moved. The layout's
 * own hit tests (`hitCircle`, `hitReach`) stay with the layout they measure.
 */

export { creatureAt } from "./creature-under.js";
export { deskDown, deskDownAll, pressSeat } from "./desk-grab.js";
export { bothKey, DeskSeat, pointerSeat, pointerSeats, seatKey } from "./desk-seat.js";
// The gesture one sample cannot answer — a rub's turns — kept for whichever
// host owns the pointers: the game's field and the director's stage both
// (`fingers.ts`).
export { Fingers } from "./fingers.js";
// What a rub's count says; how many turns a thumb made, `rub-turns.ts`.
export { RUB_TURN, rubFinger, rubSays } from "./rub.js";
export type { Rubbed } from "./rub-turns.js";
export { type CanvasBox, clientOfStage, pointOnStage } from "./stage-point.js";
// The glow round a thumb on a boss's mark: which holds earn one, and what a
// host hands the frame for each (`thumb-aura.ts`, `fingers.ts`).
export { auraTouch, type Thumb } from "./thumb-aura.js";
export { type Field, type Hold, type Touch, touchDown, touchMove, touchUp } from "./touch.js";
export {
  cannonGrab,
  type ShipHand,
  type ShipMark,
  shieldGrab,
  shipHand,
  shipUnder,
  sucksOnLift,
  swipeColor,
} from "./touch-ship.js";
// Where the two lobes ride THE WELL's ring, for a caller that has to put a
// pointer on one rather than read where one landed (`apps/game/src/field-input.ts`).
export { wellCannonGrab, wellShieldGrab } from "./touch-well.js";
