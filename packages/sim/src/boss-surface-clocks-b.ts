/**
 * **The clock bosses' half of the surface, the second page** — from THE
 * ANTIPHON on.
 *
 * Cut when THE ANTIPHON's names would have put `boss-surface-clocks.ts`
 * over its 250-line limit, the seam `bosses-clocks-b.ts` cut a day earlier:
 * the order the bosses were built in, and nothing depends on it.
 * `boss-surface-clocks.ts` re-exports the whole of it, so nothing that
 * reaches for a name through `@neon-spore/sim` knows there are two pages.
 *
 * The first page's rule holds word for word: a name here is one something
 * outside `packages/sim` imports — every one of THE ANTIPHON's is read by a
 * screen, because its whole split is what one seat is shown and the other
 * is not (`antiphon.ts`).
 */

// THE HIVE's entry, which authors nothing: it travels with the other
// thirty-two, out of `boss-entries.ts` through `bosses.ts`.
export type { HiveEntry } from "./bosses.js";
export {
  ANTIPHON_SHIP,
  type AntiphonCandidate,
  type AntiphonEntry,
  type AntiphonOrgan,
  type AntiphonState,
  antiphonBoss,
  antiphonDown,
  antiphonFamilyOf,
  antiphonFull,
  antiphonGrown,
  antiphonIsOrgan,
  antiphonOrganAt,
  antiphonRailSize,
  antiphonShipUp,
  antiphonSinkBeat,
  antiphonTight,
  antiphonTwins,
  antiphonWindow,
} from "./bosses.js";
export {
  // The underside the screens read different halves of: what colour each open
  // site is for the pilot, which site is swelling next for the navigator.
  type HiveState,
  hiveBoss,
  hiveDown,
  hiveLeft,
  hiveNext,
  hiveNextBeat,
  hiveOpen,
  hiveOpenAt,
  hiveOpenCount,
  hiveSiteCols,
  hiveSwelling,
  hiveTwins,
} from "./bosses-clocks-b.js";
