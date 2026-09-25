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
 * a `BatonStage` through `@neon-spore/sim` had to move.
 */

export {
  BATON_SOCKET_DARK,
  BATON_SOCKET_LIT,
  BATON_SOCKET_SHED,
  BATON_SOCKET_SWELL,
  BATON_STAGES,
  type BatonBead,
  type BatonStage,
  type BatonState,
  batonBaseCol,
  batonDark,
  batonLead,
  batonLocked,
  batonOneSegment,
  batonSocketRow,
} from "./baton.js";
// biome-ignore format: one line, so a reading added to the arm does not cost this page a row
export { batonBeadCol, batonBeadRowMilli, batonLandTick, batonLaunchable, batonSocketCol, batonWaiting } from "./baton-bead.js";
export { batonActor } from "./baton-cross.js";
export { batonBoss } from "./baton-step.js";
// From THE SCUTTLE on, the second page (`bosses-clocks-b.ts`).
export * from "./bosses-clocks-b.js";
// THE LEDGER is a clock too, and it has a page of its own: the one boss here
// whose single drawn object is cut in half by seat (`bosses-ledger.ts`).
export * from "./bosses-ledger.js";
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
// THE CURTAIN keeps a clock for each of the roll-back, the soft set and the
// core's fire, and the one number the pair wants off it is where the fabric
// is not (`curtainCoreBare`).
// THE SINEW keeps a clock for each of the hold, the snap-back and the fall,
// and the two numbers the seats are shown are the sum and the zone.
export {
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
} from "./sinew.js";
export {
  STARE_PHASES,
  type StarePhase,
  type StareState,
  stareLidFree,
  stareLooking,
  stareOpening,
  stareShut,
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
  surgeWarding,
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
  tasterPried,
  tasterSoft,
  tasterStanding,
  tasterWeak,
  tasterWindow,
} from "./taster.js";
// The three gates its hands are held to, so the rings drawn on them ask the
// simulation rather than restating it (`taster-hand.ts`).
export { tasterPinnable, tasterPryable, tasterWipable } from "./taster-hand.js";
export {
  THROAT_PHASES,
  type ThroatPhase,
  type ThroatState,
  throatBoss,
  throatMouthCol,
  throatMouthRow,
  throatStride,
} from "./throat.js";
