/**
 * **THE SPLICE's names on `@neon-spore/sim`'s surface**, cut off
 * `boss-surface.ts` on 25 September 2026, the day a feed stopped being one
 * number in the air and became a list of them (`SpliceFlight`) and the two
 * names that came with it took that file to its limit. Another page along the seam
 * the clocks, SNAKE and PINBALL cut; `boss-surface.ts` re-exports it whole, so
 * nothing that reached for a `SpliceState` had to move.
 */

export {
  SPLICE_FIRST_STRAWS,
  SPLICE_SETTLE_BEATS,
  type SpliceEntry,
  type SpliceRound,
  type SpliceState,
  spliceCurrent,
  spliceEntranceRow,
  spliceNumberAt,
  spliceRound,
  spliceSpreadCol,
  spliceStraws,
  spliceWanted,
} from "./bosses.js";
// The two names the list of flights brought, from their own file rather than
// through `bosses.ts`, which is at its limit: the flight itself, and what a
// hand slides on to while one is still falling (`spliceHand`).
export { type SpliceFlight, spliceWantedAfterFlights } from "./splice.js";
