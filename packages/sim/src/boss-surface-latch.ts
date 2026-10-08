/**
 * **THE LATCH's names, on a page of their own** — the tendril, the grips and
 * the script, for the picture, the cue, the touch and the director's hand.
 *
 * Its own page from the day it was written because every clocks page and
 * `boss-surface.ts` stood within thirty lines of the 250-line limit, the
 * reason THE INSTAR's names have one (`boss-surface-instar.ts`). The surface
 * rule holds: a name here is one something outside `packages/sim` imports.
 */
export type { LatchConfig } from "./config-latch.js";
export type { LatchEvent, LatchSlipWhy } from "./events-latch.js";
export {
  freshLatch,
  LATCH_ASKS,
  LATCH_PHASES,
  type LatchAsk,
  type LatchEntry,
  type LatchGrip,
  type LatchPhase,
  type LatchState,
  type LatchStep,
  latchBoss,
  latchDone,
  latchGripCol,
  latchGripSeat,
  latchHeld,
  latchKnotAlong,
  latchKnotsAll,
  latchLitStep,
  latchPuller,
  latchRearing,
  latchSeatGrip,
  latchYanks,
} from "./latch.js";
