/**
 * **THE SCOUT's names**, cut off `bosses.ts` the day the round gained a second
 * axis of state and took that barrel back over its 250-line limit.
 *
 * The seam is one round and nothing depends on it — `bosses.ts` re-exports the
 * whole of this — and it is the right round to cut, for the reason
 * `boss-surface-snake.ts` gives about SNAKE: THE SCOUT is spread over six
 * files of its own, it has two axes of state now, and it is the one whose list
 * goes on growing.
 */

export {
  SCOUT_PHASES,
  type ScoutArena,
  type ScoutHazard,
  type ScoutMote,
  type ScoutPhase,
  type ScoutPoint,
  type ScoutState,
  scoutCleared,
  scoutCurrent,
  scoutLeft,
  scoutMawOpen,
} from "./scout.js";
// Whether the little ship is on the mother ship's mouth: the round asks at
// the bank, the field's cue asks every tick (`scout-arena.ts`).
export { scoutAtHome } from "./scout-arena.js";
export { scoutNose } from "./scout-fly.js";
// The load its motes put the little ship in, and whether a heavy one's burn
// takes — read, never re-derived from `carrying.length` (`scout-hand.ts`).
export { scoutLoad, scoutPrimed } from "./scout-hand.js";
export { scoutHome, scoutStand } from "./scout-open.js"; // home, and one arena set out.
export { enterScoutPhase, scoutHolds, scoutOpenRound, scoutRound } from "./scout-round.js";
