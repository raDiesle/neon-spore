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

// A chord's fingers, counted into pads by the host that owns them (`apps/game/src/chord.ts`).
export { chordFinger, chordSays } from "./chord.js";
export { creatureAt } from "./creature-under.js";
export { deskDown, deskDownAll, pressSeat } from "./desk-grab.js";
export { bothKey, DeskSeat, pointerSeat, pointerSeats, seatKey } from "./desk-seat.js";
// A pinch's two fingers, paired by the host that owns them (`apps/game/src/pinch.ts`).
export { FINGERTIPS_MILLI, pinchGapMilli, pinching, pinchSays } from "./pinch.js";
export { type CanvasBox, clientOfStage, pointOnStage } from "./stage-point.js";
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
