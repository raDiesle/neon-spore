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

// Every boss's phase table in one place, for the director's STATES sheet
// (`boss-phases.ts` says why one table rather than nineteen).
export { BOSS_PHASES } from "./boss-phases.js";
// THE HIVE's entry, which authors nothing, and THE INSTAR's, which authors
// its script: both travel out of `boss-entries.ts` through `bosses.ts`.
export type { HiveEntry, InstarEntry } from "./bosses.js";
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
  antiphonHeld,
  antiphonIsOrgan,
  antiphonOrganAt,
  antiphonRailSize,
  antiphonShipUp,
  antiphonSinkBeat,
  antiphonTight,
  antiphonTurnMilli,
  antiphonTwins,
  antiphonWindow,
  // THE STARE's lid (18 September 2026): three questions the first page had
  // no room for. The lid's own picture reads them the way the eye's reads
  // `stareLooking`, and the director's STATES sheet reads them too.
  stareLidFree,
  stareOpening,
  stareShut,
} from "./bosses.js";
export {
  // The script and where the scene is in it: every mark is drawn from the
  // step under the cursor, by the seat it belongs to, and the content that
  // authors a script needs the step's shape and the closed lists it is written in.
  type BossSequenceStep,
  FILAMENT_PHASES,
  type FilamentEntry,
  type FilamentPath,
  type FilamentPhase,
  type FilamentState,
  type FilamentTile,
  filamentBoss,
  filamentCol,
  filamentDown,
  filamentGap,
  filamentIndexOf,
  filamentsLeft,
  filamentTileAt,
  filamentTiles,
  filamentTracing,
  filamentWalkable,
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
  INSTAR_GESTURES,
  INSTAR_PARTS,
  INSTAR_PHASES,
  INSTAR_POSES,
  INSTAR_SEATS,
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
  NO_GRAB,
  NOT_DONE,
  NOT_DRAWN,
  walkFilament,
} from "./bosses-clocks-b.js";
