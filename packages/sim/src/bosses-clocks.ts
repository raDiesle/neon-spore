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
  type BatonStage,
  type BatonState,
  batonBaseCol,
  batonBeadCol,
  batonBeadRowMilli,
  batonDark,
  batonLandTick,
  batonLocked,
  batonSocketRow,
} from "./baton.js";
export { batonBoss } from "./baton-step.js";
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
  undertowUnseated,
} from "./undertow.js";
export { undertowBowBeats } from "./undertow-step.js";
