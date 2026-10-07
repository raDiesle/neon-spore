/**
 * **The bosses that are a clock, the second page** — the clock half of the
 * boss barrel from THE SCUTTLE on.
 *
 * Cut when THE SCUTTLE's seventeen names would have put `bosses-clocks.ts`
 * eight lines over its 250-line limit, the way `ship-fields-choreo-b.ts` was
 * cut off the director's page the day before: the seam is the order the
 * bosses were built in and nothing depends on it. `bosses-clocks.ts`
 * re-exports the whole of it, so nothing that reaches for a name through
 * `@neon-spore/sim` knows there are two pages.
 *
 * **THE BATON's arm-hand readings are here too**, out of order, and that is
 * the one thing on this page the seam above does not explain: they arrived on
 * 18 September 2026 with the §6.2 lane (`baton-hand.ts`) and page one was
 * exactly at its limit, so the choice was this page or a third. The rest of
 * the arm's names are still next door. **THE UNDERTOW is here for the same
 * reason and nothing else** — 19 September 2026, when THE SINEW's catch added
 * two names to page one and it was at its limit again. It was the last boss on
 * that page, which is the rule (`.claude/skills/new-boss-state`): the page
 * gives a boss back rather than grow, and never the boss being worked on.
 *
 * THE SCUTTLE is a clock in the plainest sense on the page: its whole
 * difficulty is the beats a part hangs before it is thrown, which is a count
 * one seat says out loud and the other shoots on (`scuttle.ts`). THE
 * ANTIPHON's clock is the window an organ stands for, which the seat who
 * can see it is counting down to the seat who cannot (`antiphon.ts`).
 */

export {
  ANTIPHON_SHIP,
  type AntiphonCandidate,
  type AntiphonOrgan,
  type AntiphonState,
  antiphonBoss,
  antiphonChooser,
  antiphonDown,
  antiphonExplainer,
  antiphonExplainerOn,
  antiphonFamilyOf,
  antiphonFull,
  antiphonGrown,
  antiphonHeld,
  antiphonIsOrgan,
  antiphonLevel,
  antiphonOrganAsks,
  antiphonOrganCol,
  antiphonOrganRow,
  antiphonRailAsks,
  antiphonRailSize,
  antiphonShipUp,
  antiphonSinkBeat,
  antiphonStanding,
  antiphonTight,
  antiphonTurnMilli,
  antiphonWindow,
} from "./antiphon.js";
export { antiphonOpenLevel } from "./antiphon-step.js";
export {
  antiphonAlongVein,
  antiphonSlotCol,
  antiphonVein,
  antiphonVeinMilli,
} from "./antiphon-vein.js";
export {
  batonDrawAsks,
  batonDrawing,
  batonDrawn,
  batonMayStrip,
  batonMergeSocket,
  batonStripAsks,
  batonSwelling,
} from "./baton-hand.js";
// THE INSTAR's clock is the script's: a morph, a window, a landing, per step
// (`instar.ts`). Its names are one page, shared with the surface.
export * from "./boss-surface-instar.js";
// And THE WARDEN's openness, handed to the third page on 22 September 2026
// when another boss's names took this one to its limit — the last block on the
// page goes, never the boss being worked on (`bosses-clocks-c.ts`).
export * from "./bosses-clocks-c.js";
// THE FILAMENT's clock is the pauses between filaments; the line itself is
// the thumbs' (`filament.ts`), and every name here is one a screen or a
// content test reads — the tiles lit, the two indices, the words walked.
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
  NO_GRAB,
  NOT_DRAWN,
  walkFilament,
} from "./filament.js";
// THE FILAMENT's clock: whose move the line waits on, and until which beat.
export * from "./filament-turn.js";
// THE GIMBAL's clock is nearly the whole boss: a ring is a position rather
// than an event, so the marks, the hold, the shear and the seam are all beats,
// and every name here is one a screen or a content test reads.
// biome-ignore format: one line, so a reading added to the rings does not cost this page a row
// biome-ignore format: and the readings, for the same reason
export { GIMBAL_PHASES, GIMBAL_RINGS, type GimbalEntry, type GimbalMark, type GimbalPhase, type GimbalRing, type GimbalState, gimbalAligned, gimbalBoss, gimbalLeaking, gimbalLettingGo, gimbalMarkMilli, gimbalOpen, gimbalRingAsks, gimbalRingTrue, gimbalShownMilli, gimbalTeeth, gimbalTrueMilli, gimbalTurning, INNER, NO_LET_GO, NO_SEAM, OUTER } from "./gimbal.js";
// THE GIMBAL's leaking bead, where a bolt meets it and the picture lays it (`gimbal-bead.ts`).
export { GIMBAL_BEAD_MILLI, GIMBAL_ROW_MILLI, gimbalBeadMilli } from "./gimbal-bead.js";
// THE GORGE's tap (1 October 2026): whose thumb opens the ring's bottom
// bubble (`gorge-hand.ts`), which bubbles are on offer and asking, and where
// a bubble can be shot, for the picture's marks and halo.
export { gorgeAsks, gorgeOffers, gorgeTapSeat } from "./gorge-hand.js";
export { gorgeColOf, gorgeRowOf } from "./gorge-ring.js";
// THE HIVE's clock is the opening: a site every `hiveOpenBeats`, swelling
// first on one screen and coloured on the other (`hive.ts`).
export {
  HIVE_PHASES,
  HIVE_TOP,
  type HivePhase,
  type HiveState,
  hiveBoss,
  hiveDown,
  hiveLeft,
  hiveNext,
  hiveNextBeat,
  hiveOnWall,
  hiveOpen,
  hiveOpenAt,
  hiveOpenCount,
  hiveSealedCount,
  hiveSiteCols,
  hiveSwelling,
  hiveTwins,
} from "./hive.js";
// And its second axis: what one lobe of that underside is, which is what the
// two thumbs are answering (`hive-lobe.ts`).
export {
  HIVE_LOBES,
  type HiveLobe,
  hiveClenched,
  hiveClenchUntil,
  hiveHaulAsks,
  hiveLobeAsks,
  hiveLobeAt,
  hivePinched,
  hiveSealedBy,
  hiveSwellingAt,
  hiveWrungAt,
  NO_PINCH,
} from "./hive-lobe.js";
// And its two walls: where the cocoons are, and the one the pilot's thumb is
// steering his shots into (`hive-wall.ts`).
export { hiveAim, hiveHoldable, hiveWallFront, hiveWallPlaces } from "./hive-wall.js";
export {
  type ScuttlePart,
  type ScuttlePartKind,
  type ScuttleState,
  scuttleAttached,
  scuttleBoss,
  scuttleCadence,
  scuttleFast,
  scuttleLeft,
  scuttleLeftCol,
  scuttleNextCol,
  scuttlePartCol,
  scuttleShootable,
  scuttleSocketCol,
  scuttleSocketRow,
  scuttleSwingable,
  scuttleSwingCol,
  scuttleThrowBeat,
  scuttleTwins,
  scuttleWindBeats,
  scuttleWinding,
} from "./scuttle.js";
// And its hands (1 October 2026): which seat sets which colour, and whether a
// colour swallows a body — the cue and the shake ask both and re-derive
// neither (`throat-hand.ts`, `throat-suck.ts`).
export { throatModeSeat } from "./throat-hand.js";
export { throatTakes } from "./throat-suck.js";
// THE UNDERTOW is a clock the pair says out loud too — beats a lobe stands,
// beats left on the level — with the difference that it counts *under* the field.
export {
  UNDERTOW_ANSWERS,
  UNDERTOW_LOBE_STAGES,
  UNDERTOW_PHASES,
  type UndertowAnswer,
  type UndertowLobe,
  type UndertowLobeStage,
  type UndertowPhase,
  type UndertowState,
  undertowBoss,
  undertowEbbing,
  undertowLevelLeft,
  undertowLobeAt,
  undertowLobesIn,
  undertowPlateBeside,
} from "./undertow.js";
// The last form's walk, a clock of whole cycles (`vane-arm.ts`), and the guard
// arms each re-formed bearing adds (`vane-guard.ts`).
export { vaneDriftCol } from "./vane-arm.js";
export { vaneGuardBeat, vaneGuardCount, vaneGuarded, vaneGuardedAt } from "./vane-guard.js";
// THE VANE's two hands (18 September 2026): where the arm is standing once a
// thumb has pinned it, and whether the bearing is open under each of its three
// phases. A clock on this page's terms — the pin runs for `vanePinBeats` and
// the window goes with it (`vane-open.ts`).
export {
  vaneBearingOpen,
  vaneOpeningSpent,
  vanePinned,
  vanePinnedAt,
  vanePinSide,
  vanePivotAt,
  vanePivotNow,
  vaneSplitCol,
  vaneTipAt,
  vaneTipNow,
} from "./vane-open.js";
// The phases the pins put it in, split off `vane-cycle.ts` (`vane-phases.ts`).
export {
  VANE_PHASES,
  type VaneGesture,
  type VanePhase,
  vanePhase,
  vaneSplitsOnCycle,
} from "./vane-phases.js";
