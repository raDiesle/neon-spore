/**
 * **The bosses that are a clock**, as their half of the boss barrel.
 *
 * Split out of `bosses.ts` when THE THROAT's names took that file two lines
 * over its 250-line limit — `bosses-round.ts`' cut made a second time, along
 * the seam `config-boss-clocks.ts` cut the same day and for the same reason.
 * What is left next door is a boss with a *place*: the queen's row, the
 * Warden's ring, the pile, the arm of a vane. Everything here is a boss whose
 * whole difficulty is a **beat count the pair has to say out loud** — how long
 * the eye takes to turn, how far apart two cadences that never divide each
 * other are, how many beats a handover is in the air, how many beats until the
 * next inhale — and every name in it is one a screen needs in order to draw a
 * number nobody can hear.
 *
 * `bosses.ts` re-exports the whole of it, so nothing that already reached for
 * a `DiastoleSide` or a `BatonStage` through `@neon-spore/sim` had to move.
 */

export {
  BATON_SOCKET_DARK,
  BATON_SOCKET_LIT,
  BATON_SOCKET_SHED,
  BATON_STAGES,
  type BatonBead,
  type BatonStage,
  type BatonState,
  batonBaseCol,
  batonDark,
  batonLaunchable,
  batonLead,
  batonLocked,
  batonOneSegment,
  batonSocketRow,
  batonWaiting,
} from "./baton.js";
export { batonBeadCol, batonBeadRowMilli, batonLandTick, batonSocketCol } from "./baton-bead.js";
export { batonBoss } from "./baton-step.js";
// From THE SCUTTLE on, the second page (`bosses-clocks-b.ts`).
export * from "./bosses-clocks-b.js";
// THE CANDLE keeps the shortest clock of the six: a glow that drifts and
// turns on counts the pair says out loud, in a dark the sim does not know.
export {
  CANDLE_PHASES,
  type CandlePhase,
  type CandleState,
  candleBoss,
  candleEating,
  candleMoving,
} from "./candle.js";
export {
  type CurtainState,
  curtainBody,
  curtainBoss,
  curtainCoreBare,
  curtainCovers,
  curtainLobesLeft,
  curtainReach,
  curtainSoftAt,
  curtainStride,
} from "./curtain.js";
export {
  DIASTOLE_PHASES,
  DIASTOLE_SIDES,
  type DiastolePhase,
  type DiastoleSide,
  type DiastoleState,
  diastoleBeating,
  diastoleBridgeCol,
  diastoleChamberCol,
  diastoleCoincides,
  diastoleColor,
  diastoleContracts,
  diastoleEvery,
  diastoleHits,
  diastoleSeat,
  diastoleSince,
  diastoleStanding,
} from "./diastole.js";
export { diastoleBoss } from "./diastole-step.js";
// THE GORGE keeps no clock of its own but the vent and the spit: what it
// holds is the pair's own shots, seven tallies wide.
export {
  GORGE_PHASES,
  type GorgeIntake,
  type GorgePhase,
  type GorgeState,
  gorgeBeads,
  gorgeBoss,
  gorgeFull,
  gorgeIntakeAt,
  gorgeNearestFull,
  gorgePhase,
  gorgeSink,
} from "./gorge.js";
// THE ORRERY is three clocks rather than one, and the only number the pair
// ever wants off it is a beat that has not happened yet (`orreryNextOpen`).
// THE LEDGER's cord is a clock with the pair's own hand on it: every return
// on it is a beat count they started, and the cadence shortens as the seam
// widens (`ledger.ts`, `config-ledger.ts`).
export {
  LEDGER_PHASES,
  type LedgerBead,
  type LedgerPhase,
  type LedgerState,
  ledgerBoss,
  ledgerCadence,
  ledgerCovers,
  ledgerLetThrough,
  ledgerNext,
  ledgerPhase,
  ledgerSeamCol,
  ledgerWalk,
  ledgerWhips,
} from "./ledger.js";
export {
  ORRERY_PHASES,
  ORRERY_RINGS,
  type OrreryPhase,
  type OrreryState,
  orreryBoss,
  orreryCoreCol,
  orreryDir,
  orreryGapSlot,
  orreryNextOpen,
  orreryOrbit,
  orreryRingBroken,
  orreryRingOpen,
  orreryShaftOpen,
} from "./orrery.js";
export { orreryGapCol, orreryReach } from "./orrery-gap.js";
// The pilot's hand on a ring, and the two things the picture asks about it:
// which ring answers a thumb, and how far it is wound against its next
// detent — which is a strain to be drawn and never a rotation
// (`orrery-hand.ts`).
export {
  NO_RING,
  orreryHandHolds,
  orreryHandRing,
  orreryTurnPerTickMilli,
  orreryWoundMilli,
} from "./orrery-hand.js";
// THE CURTAIN keeps a clock for each of the roll-back, the soft set and the
// core's fire, and the one number the pair wants off it is where the fabric
// is not (`curtainCoreBare`).
// THE SINEW keeps a clock for each of the hold, the snap-back and the fall,
// and the two numbers the seats are shown are the sum and the zone.
export {
  type SinewState,
  sinewBandMilli,
  sinewBoss,
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
} from "./sinew.js";
export {
  STARE_PHASES,
  type StarePhase,
  type StareState,
  stareLooking,
  stareTellLeft,
  stareTurning,
  stareWatches,
} from "./stare.js";
export { stareBoss } from "./stare-step.js";
// THE SURGE keeps a clock for each of the lift, the burst and the eversion,
// and the two numbers the seats are shown are the pressure and the notches.
export {
  type SurgeState,
  surgeBand,
  surgeBoss,
  surgeBulbLeft,
  surgeBulbRow,
  surgeBulbSpan,
  surgeChargePerHand,
  surgeCovers,
  surgeEverting,
  surgeHands,
  surgeHeld,
  surgeHoldsCharge,
  surgeInBand,
  surgeNotchMilli,
  surgeSealing,
} from "./surge.js";
// THE TASTER keeps no clock but the growth and the re-edge: what it holds is
// a fan of eleven blades, and the colour of every one of them was read off
// what the pair had spent by the beat it set (`taster.ts`, `spend.ts`).
export {
  TASTER_PHASES,
  type TasterBlade,
  type TasterPhase,
  type TasterState,
  tasterBladeAt,
  tasterBoss,
  tasterGrowing,
  tasterLean,
  tasterLifted,
  tasterOrder,
  tasterPhase,
  tasterSoft,
  tasterStanding,
  tasterWeak,
  tasterWindow,
} from "./taster.js";
export {
  THROAT_PHASES,
  type ThroatPhase,
  type ThroatState,
  throatBoss,
  throatEvertBeatsLeft,
  throatEvery,
  throatInhales,
  throatMouthCol,
  throatMouthRow,
  throatStride,
  throatToInhale,
} from "./throat.js";
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
  undertowBreachAt,
  undertowLastCol,
  undertowLobeAt,
  undertowPlateBeside,
  undertowUnseated,
} from "./undertow.js";
export { undertowBowBeats } from "./undertow-step.js";
