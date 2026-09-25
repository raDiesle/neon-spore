/**
 * **THE INSTAR's names, on a page of their own** — the script and where the
 * scene is in it.
 *
 * Cut when `bosses-clocks-b.ts` and `boss-surface-clocks-b.ts` stood at 246
 * and 248 of their 250 lines, both listing these same twenty-nine names: the
 * barrel and the surface each `export *` this page now, so the list is
 * written once and the next INSTAR reading costs neither of them a row.
 *
 * The surface rule holds: a name here is one something outside `packages/sim`
 * imports. Every mark is drawn from the step under the cursor, by the seat it
 * belongs to, and the content that authors a script needs the step's shape
 * and the closed lists it is written in (`instar.ts`) — the engine every
 * choreographed scene runs on.
 */
export {
  type BossSequenceStep,
  INSTAR_ARRIVALS,
  INSTAR_GESTURES,
  INSTAR_PARTS,
  INSTAR_PHASES,
  INSTAR_POSES,
  INSTAR_SEATS,
  type InstarArrival,
  type InstarGesture,
  type InstarMark,
  type InstarPart,
  type InstarPhase,
  type InstarPose,
  type InstarSeat,
  type InstarState,
  instarActing,
  instarAllDone,
  instarBoss,
  instarDown,
  instarHeld,
  instarMarkCol,
  instarMarkDone,
  instarSeatHears,
  instarStep,
  instarStrikeBeat,
  instarSwipeAlong,
  NOT_DONE,
} from "./instar.js";
