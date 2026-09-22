/**
 * **PINBALL's names on `@neon-spore/sim`'s surface**, cut off `boss-surface.ts`
 * the day the round's two hands were drawn and the two gates behind them
 * (`pinWindable`, `pinNudgeable`) took that file over its 250-line limit.
 *
 * The third page along this seam, after the clocks and SNAKE, and cut for the
 * same reason each time: `boss-surface.ts` re-exports the whole of this, so
 * nothing that reached for a `PinPiece` had to move. PINBALL is the right one
 * to cut next — it is the only round whose state is a *shot* rather than a
 * clock, so it carries a physics, a board and a hand where the others carry a
 * phase, and its list is the longest of the three.
 */

export {
  PIN_THIN_MILLI,
  PINBALL_MORPH_BEATS,
  type PinBall,
  type PinballEntry,
  type PinballRound,
  type PinballState,
  type PinPhysics,
  type PinPiece,
  pinballFault,
  pinballHolds,
  pinballRound,
  pinCannonMilli,
  pinCaught,
  pinHeightMilli,
  pinLaneFloorMilli,
  pinLaunchVelocity,
  // Whether the spring is offering a wind and whether the table is offering a
  // shove: the rings drawn on the two handles ask these rather than restating
  // them, so the picture and the rule cannot drift (`pinball-hand.ts`).
  pinNudgeable,
  pinPhysics,
  pinRestingBall,
  pinTargetsLeft,
  pinWindable,
} from "./bosses.js";
