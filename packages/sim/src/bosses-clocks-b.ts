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
} from "./antiphon.js";
export {
  batonDrawing,
  batonDrawn,
  batonMayStrip,
  batonMergeSocket,
  batonSwelling,
} from "./baton-hand.js";
// And THE WARDEN's openness, handed to the third page on 22 September 2026
// when another boss's names took this one to its limit — the last block on the
// page goes, never the boss being worked on (`bosses-clocks-c.ts`).
export * from "./bosses-clocks-c.js";
// THE DIASTOLE's clamp (18 September 2026): the hurt window the beam asks,
// which the clamp moved off `diastole.ts`, and the seat whose thumb it is.
export {
  clearDiastoleClamp,
  diastoleClamped,
  diastoleClampHolds,
  diastoleClampSeat,
  diastoleCoincides,
  diastoleOpen,
} from "./diastole-open.js";
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
// THE GIMBAL's clock is nearly the whole boss: a ring is a position rather
// than an event, so the marks, the hold, the shear and the seam are all beats,
// and every name here is one a screen or a content test reads.
// biome-ignore format: one line, so a reading added to the rings does not cost this page a row
// biome-ignore format: and the readings, for the same reason
export { GIMBAL_PHASES, GIMBAL_RINGS, type GimbalEntry, type GimbalMark, type GimbalPhase, type GimbalRing, type GimbalState, gimbalAligned, gimbalBoss, gimbalLeaking, gimbalMarkMilli, gimbalOpen, gimbalRingTrue, gimbalShownMilli, gimbalTeeth, gimbalTurning, INNER, NO_SEAM, OUTER } from "./gimbal.js";
// THE GORGE's two thumbs (18 September 2026): whose the pinch and the pry are,
// so the ring is drawn for the seat the sack will hear (`gorge-hand.ts`).
export { gorgePinchSeat, gorgePrySeat } from "./gorge-hand.js";
// THE HIVE's clock is the opening: a site every `hiveOpenBeats`, swelling
// first on one screen and coloured on the other (`hive.ts`).
export {
  HIVE_PHASES,
  type HivePhase,
  type HiveState,
  hiveBoss,
  hiveDown,
  hiveLeft,
  hiveNext,
  hiveNextBeat,
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
  hiveLobeAt,
  hivePinched,
  hiveSealedBy,
  hiveSwellingAt,
  hiveWrungAt,
  NO_PINCH,
} from "./hive-lobe.js";
// THE INSTAR's clock is the script's: a morph, a window, a landing, per step
// (`instar.ts`) — and the engine every choreographed scene runs on.
export {
  type BossSequenceStep,
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
  NOT_DONE,
} from "./instar.js";
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
// And its cadence, out of order for the same reason and on the same day the
// cinch was built: the count player 2 says out loud — how often the gullet
// inhales, how long until it does, how much of the eversion is left — moved
// off `throat.ts` when the cinch and the haul left it no room, and page one
// was one line under its limit by then (`throat-clock.ts`).
export {
  throatEvertBeatsLeft,
  throatEvery,
  throatInhales,
  throatToInhale,
} from "./throat-clock.js";
// And its two hands, the same day: whether there is a ring to pinch, whether
// a thumb is on one, whether the mouth has already been asked to move. The cue
// asks all three and re-derives none of them — the handle the picture offers
// and the handle the simulation accepts are one question (`throat-hand.ts`).
export { throatCinchable, throatCinched, throatHauling } from "./throat-hand.js";
// THE THROAT's hold, out of order for THE BATON's reason above: it arrived on
// 19 September 2026 with the §6.1 lane and page one was two lines under its
// limit. Whether the gullet has a body — which is the same question as whether
// the next inhale will swallow it, since the swallow and the fall's refusal are
// one rule (`throat-pull.ts`). Read by the cue, never written out again.
export { throatHolds } from "./throat-pull.js";
// THE UNDERTOW is a clock the pair says out loud too — beats a plate bows,
// beats a lobe stands — with the difference that it counts *under* the field.
export {
  UNDERTOW_BREACH_STAGES,
  UNDERTOW_PHASES,
  type UndertowBreach,
  type UndertowBreachStage,
  type UndertowPhase,
  type UndertowState,
  undertowBoss,
  undertowBowBeats,
  undertowBreachAt,
  undertowLastCol,
  undertowLobeAt,
  undertowPinned,
  undertowPlateBeside,
  undertowUnseated,
} from "./undertow.js";
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
  vaneSplitCol,
  vaneTipAt,
  vaneTipNow,
} from "./vane-open.js";
