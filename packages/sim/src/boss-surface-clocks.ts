/**
 * **The clock bosses' half of the surface**, written out the same way.
 *
 * Split out of `boss-surface.ts` when THE THROAT's eight names took that file
 * two lines over its 250-line limit, along the seam `bosses-clocks.ts` cuts
 * one file down: every name here belongs to a boss whose whole difficulty is a
 * beat count the pair has to say out loud, which is also why every one of them
 * is imported by a *screen* — a number nobody can hear has to be drawn.
 *
 * Next door's rule holds word for word: a name here is one something outside
 * `packages/sim` imports, and `bun run typecheck` says so either way.
 */

export {
  BATON_SOCKET_DARK,
  BATON_SOCKET_LIT,
  BATON_SOCKET_SHED,
  BATON_STAGES,
  type BatonEntry,
  type BatonStage,
  type BatonState,
  batonBaseCol,
  batonBeadCol,
  batonBeadRowMilli,
  batonBoss,
  batonDark,
  batonLandTick,
  batonLocked,
  batonSocketRow,
  DIASTOLE_PHASES,
  DIASTOLE_SIDES,
  type DiastoleEntry,
  type DiastolePhase,
  type DiastoleSide,
  type DiastoleState,
  diastoleBeating,
  diastoleBoss,
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
  STARE_PHASES,
  type StareEntry,
  type StarePhase,
  type StareState,
  stareBoss,
  stareLooking,
  stareTellLeft,
  stareTurning,
  stareWatches,
  THROAT_PHASES,
  type ThroatEntry,
  type ThroatPhase,
  type ThroatState,
  throatBoss,
  throatEvery,
  throatInhales,
  throatMouthCol,
  throatMouthRow,
  throatStride,
} from "./bosses.js";
