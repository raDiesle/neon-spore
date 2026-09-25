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
 *
 * **THE BATON's five arm-hand names are here too**, out of order, for the
 * reason `bosses-clocks-b.ts` carries the same five: they arrived on 18
 * September 2026 with the §6.2 lane and page one was exactly at its limit.
 * The rest of the arm's names are still there.
 *
 * **A third page opened when THE HASP's door took this one to 258 lines**, and
 * THE WELL's rows went across: the last ones here, never the boss being
 * written (`boss-surface-clocks-c.ts`).
 */

// Every boss's phase table in one place, for the director's STATES sheet
// (`boss-phases.ts` says why one table rather than nineteen).
export { BOSS_PHASES } from "./boss-phases.js";
// THE WELL's names, the last rows this page held (`boss-surface-clocks-c.ts`).
export * from "./boss-surface-clocks-c.js";
// THE INSTAR's script and the scene's place in it (`boss-surface-instar.ts`).
export * from "./boss-surface-instar.js";
// THE HIVE's entry, which authors nothing, and THE INSTAR's, which authors
// its script: both travel out of `boss-entries.ts` through `bosses.ts`.
export type {
  HaspEntry,
  HiveEntry,
  InstarEntry,
  SpoolEntry,
} from "./bosses.js";
// THE BATON's arm as a control: which socket is coming away, whose thumb may
// take it, and whose bead is whose while the two are drawn together — all four
// read by `render/baton-grip.ts` and the cue beside it (`baton-hand.ts`).
export {
  ANTIPHON_SHIP,
  type AntiphonCandidate,
  type AntiphonEntry,
  type AntiphonOrgan,
  type AntiphonState,
  antiphonBoss,
  antiphonCrossed,
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
  BATON_SOCKET_SWELL,
  batonDrawing,
  batonMayStrip,
  batonMergeSocket,
  batonSwelling,
  // THE SINEW's whole surface (19 September 2026), out of order and on this
  // page for THE BATON's reason three lines up: `orreryAdrift` arrived and
  // page one was exactly at its limit, so a block had to cross the seam.
  // This one crossed because it is the only block on that page with no
  // comment inside it — every name is read off `sinew.ts`'s own header — so
  // the move costs page one nothing but the lines.
  type SinewEntry,
  type SinewState,
  sinewBandMilli,
  sinewBoss,
  sinewCatching,
  sinewCaught,
  sinewDecaying,
  sinewGone,
  sinewHeld,
  sinewInZone,
  sinewMassLeft,
  sinewMassRow,
  sinewPull,
  sinewSum,
  sinewSwinging,
  sinewWalked,
  sinewZone,
  sinewZoneWidth,
  // THE STARE's lid (18 September 2026): three questions the first page had
  // no room for. The lid's own picture reads them the way the eye's reads
  // `stareLooking`, and the director's STATES sheet reads them too.
  stareLidFree,
  stareOpening,
  stareShut,
  // And the two hands it gained the day after (19 September 2026): the cue
  // over a body in the mouth asks the simulation whether a ring may be pinched
  // and whether the tube may be hauled, rather than re-deriving either from
  // the phase (`throat-hand.ts`).
  throatCinchable,
  throatCinched,
  throatHauling,
  // THE THROAT's hold (19 September 2026): whether the gullet has this body,
  // which is the same question as whether the next inhale will swallow it —
  // the swallow and the fall's refusal are one rule (`throat-pull.ts`). On
  // this page because page one is exactly at its limit.
  throatHolds,
} from "./bosses.js";
export {
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
  // THE GORGE's two thumbs: whose ring goes on the full intake, whose on the mouth.
  gorgePinchSeat,
  gorgePrySeat,
  // The underside the screens read different halves of: what colour each open
  // site is for the pilot, which site is swelling next for the navigator —
  // and the mass's own two states, which they answer with a thumb each.
  HIVE_LOBES,
  HIVE_PHASES,
  type HiveLobe,
  type HivePhase,
  type HiveState,
  hiveBoss,
  hiveClenched,
  hiveClenchUntil,
  hiveDown,
  hiveLeft,
  hiveLobeAt,
  hiveNext,
  hiveNextBeat,
  hiveOpen,
  hiveOpenAt,
  hiveOpenCount,
  hivePinched,
  hiveSealedBy,
  hiveSealedCount,
  hiveSiteCols,
  hiveSwelling,
  hiveSwellingAt,
  hiveTwins,
  hiveWrungAt,
  NO_GRAB,
  NO_PINCH,
  NOT_DRAWN,
  // THE VANE's arm once a thumb is on it, and its bearing under all three
  // phases — read, never re-derived from the cycle (`vane-open.ts`).
  vaneBearingOpen,
  vaneOpeningSpent,
  vanePinned,
  // The same two off a config and a beat, for the hit test, which is handed a
  // `Field` and never a world (`render/vane-grip.ts`).
  vanePinnedAt,
  vanePinSide,
  vaneSplitCol,
  vaneTipAt,
  vaneTipNow,
  walkFilament,
  // THE WARDEN's openness under its three phases, for the picture and the
  // cues — read, never re-derived from the rope (`warden-open.ts`).
  wardenEyeOpen,
  wardenHatchMilli,
  wardenLidsMilli,
  wardenThrown,
} from "./bosses-clocks-b.js";
// THE FILAMENT's clock: whose move the line waits on, and until which beat.
export * from "./filament-turn.js";
export { fleetWindowLeft } from "./fleet-flood.js";
export { FLEET_PHASES, type FleetPhase } from "./fleet-state.js";
// THE FLEET's second and third states: the phase, the window and the plume
// for the pictures, the cue and the director's hand — on this page because
// `boss-surface.ts` is at its limit (`fleet-state.ts`).
// THE GIMBAL's rings: the phase, the teeth left, the marks and the mirror the
// navigator's face is drawn through. Straight off `gimbal.ts` and on this page
// for THE FLEET's reason below — `boss-surface.ts` is at its limit — and on
// two lines because `bosses-clocks-b.ts` is within a handful of its own.
// biome-ignore format: one line, so a reading added to the rings does not cost a row
// biome-ignore format: and the readings, for the same reason
export { GIMBAL_PHASES, GIMBAL_RINGS, type GimbalEntry, type GimbalMark, type GimbalPhase, type GimbalRing, type GimbalState, gimbalAligned, gimbalBoss, gimbalLeaking, gimbalMarkMilli, gimbalOpen, gimbalRingTrue, gimbalShownMilli, gimbalTeeth, gimbalTurning, INNER, NO_SEAM, OUTER } from "./gimbal.js";
// And the one figure off its hand: how far a desk key turns a ring in a tick,
// asked for rather than chosen, THE ORRERY's ring's arrangement exactly
// (`gimbal-hand.ts`, `apps/game/src/keys-turn.ts`).
export { gimbalTurnPerTickMilli } from "./gimbal-hand.js";
// THE HASP's door: whether a clasp is up to be worked, whether the latch is
// down, how far the wheel has come and whether a bolt is loose — read by the
// two pictures, the cue and the director's hand. Straight off `hasp.ts`, on
// this page for THE FLEET's reason above and on one line for THE GIMBAL's.
// biome-ignore format: one line, so a reading added to the door does not cost a row
export { HASP_COUNT, HASP_PHASES, type HaspPhase, type HaspState, haspBoss, haspBurning, haspClear, haspHeatMilli, haspHeld, haspLoose, haspTurning, haspWorking, haspWoundMilli, NO_BOLT, NO_BURN, NO_LATCH } from "./hasp.js";
// THE SPOOL's line: the phase, the ribs, the brake's depth, the zone and the
// paid-out length — the two halves of the `SplitGauge` the pair shout across,
// and every reading either screen takes. Straight off `spool.ts` and on one
// line for THE GIMBAL's reason.
// biome-ignore format: one line, so a reading added to the spool does not cost a row
export { NO_BRAKE, SPOOL_LEGS, SPOOL_PHASES, SPOOL_RIBS, type SpoolPhase, type SpoolState, spoolBoss, spoolBrakeForRateMilli, spoolCol, spoolDepthMilli, spoolEasing, spoolGone, spoolGrace, spoolHeld, spoolInZone, spoolLegLeft, spoolLegs, spoolPaying, spoolPayRateMilli, spoolSlack, spoolSlipped, spoolZone, spoolZoneMilli } from "./spool.js";
