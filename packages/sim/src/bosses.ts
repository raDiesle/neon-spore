/**
 * The bosses, as one barrel — the ones played on the field.
 *
 * Split out of `index.ts` when THE FLEET pushed that file past its 250-line
 * limit, and along the seam `hash.ts` and `hash-boss.ts` already cut: what is
 * left next door is the **field** — the ship, the bodies on it, the shots, the
 * wave's own clock — and everything here is whichever mechanism happens to be
 * installed above one. The field's half grows by a name at a time; this half
 * grows by a whole boss at a time, and seven of them are already the larger
 * share.
 *
 * `index.ts` re-exports the whole of it, so nothing that already reached for a
 * `VaneStage` or a `MazeWheel` through `@neon-spore/sim` had to move.
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
export { clampQueenCol, QUEEN_FLANK_TILES, queenHalfCols, queenTorchCol } from "./boss.js";
export type { BossState, FleetState, QueenState, VaneState, WardenState } from "./boss-state.js";
// The six rounds are next door and re-exported whole (`bosses-round.ts`).
export * from "./bosses-round.js";
export { type CairnState, cairnState, cairnWaited } from "./cairn.js";
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
  type BatonEntry,
  BOSS_KINDS,
  bossFillsWave,
  type CairnEntry,
  type DiastoleEntry,
  type FleetEntry,
  type GaugeEntry,
  type PinballEntry,
  type PulseEntry,
  type RepriseEntry,
  type ScoutEntry,
  type SnakeEntry,
  type SpliceEntry,
  type StareEntry,
  type ThroatEntry,
  type VaneEntry,
  type WardenEntry,
  type WellEntry,
} from "./entries.js";
export {
  fleetAfloat,
  fleetBeatsLeft,
  fleetRound,
  fleetStruck,
} from "./fleet.js";
export {
  FLEET_DIRS,
  FLEET_LEN_MAX,
  FLEET_LEN_MIN,
  FLEET_SHIPS_MAX,
  type FleetDir,
  type FleetShip,
  fleetCol,
  fleetCols,
  fleetFault,
  fleetIndex,
  fleetOnBoard,
  fleetRow,
  fleetRows,
  fleetShipAt,
  fleetSquares,
  shipCol,
  shipCovers,
  shipHits,
  shipRow,
  shipSunk,
} from "./fleet-board.js";
export {
  MAZE_PHASES,
  MAZE_TURN,
  type MazePhase,
  mazeBottomCol,
  mazeCenterMilli,
  mazeClickAngle,
  mazeCosMilli,
  mazeEntranceAngle,
  mazeEntranceCol,
  mazeEntranceX,
  mazeRadiusMilli,
  mazeSinMilli,
  mazeWrap,
} from "./maze.js";
export {
  MAZE_APPROACH_BEATS,
  MAZE_LEAD_BEATS,
  MAZE_READ_PER_WAY,
  MAZE_READ_SLACK,
  MAZE_TRAVEL_BEATS,
  MAZE_VERDICT_BEATS,
  mazeReadBeats,
} from "./maze-clock.js";
export { mazeRound } from "./maze-controls.js";
export { mazeHeartColor, mazeHeartShot } from "./maze-round.js";
export { mazeEntrances, mazeSolveRoute, mazeWheel } from "./maze-solve.js";
export { installMaze, type MazeState, mazeCurrent } from "./maze-state.js";
export { MAZE_REASONS, type MazeVerdictReason } from "./maze-verdict.js";
export {
  type MazeEntrance,
  type MazeGeometry,
  type MazeStep,
  type MazeWheel,
  mazeArc,
  mazeCircleMilli,
  mazeCopyWheel,
  mazeCoreEntrance,
  mazeFault,
  mazeReachesCore,
  mazeRingMilli,
  mazeSweep,
} from "./maze-wheel.js";
export { mirrorHoldsControls } from "./mirror.js";
export { queenMarkCol, queenOccupiesCol, ROCK_CYCLE } from "./queen-mark.js";
export {
  type RepriseState,
  repriseEchoing,
  repriseHeld,
  repriseLeft,
} from "./reprise-state.js";
export {
  SCOUT_PHASES,
  type ScoutArena,
  type ScoutHazard,
  type ScoutMote,
  type ScoutPhase,
  type ScoutState,
  scoutCleared,
  scoutCurrent,
  scoutLeft,
} from "./scout.js";
export { scoutHolds, scoutRound } from "./scout-round.js";
export {
  fireStep,
  MIRROR_HOLD_BEATS,
  MIRROR_LEAD_BEATS,
  MIRROR_PHASES,
  MIRROR_STEPS,
  type MirrorPhase,
  type MirrorState,
  type MirrorStep,
  type MirrorVerdictReason,
  mirrorListenBeats,
} from "./simon.js";
export {
  SPLICE_FIRST_STRAWS,
  type SpliceRound,
  type SpliceState,
  spliceCurrent,
  spliceEntranceRow,
  spliceNumberAt,
  spliceStraws,
  spliceWanted,
} from "./splice.js";
export {
  installSplice,
  SPLICE_SETTLE_BEATS,
  spliceHeard,
  spliceRound,
} from "./splice-round.js";
export { spliceSpreadCol } from "./splice-tangle.js";
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
export { vaneOpen } from "./vane.js";
export { vaneFold, vanePivotCol, vaneReach, vaneTipCol, vaneWeakCol } from "./vane-arm.js";
export {
  VANE_CYCLE,
  VANE_CYCLE_BEATS,
  VANE_PHASES,
  type VanePhase,
  type VaneStage,
  vaneColor,
  vaneCycle,
  vaneCycleBeat,
  vaneOpening,
  vanePhase,
  vaneReachMilli,
  vaneStageIndex,
  vaneStageStart,
} from "./vane-cycle.js";
export {
  NO_TETHER,
  WARDEN_PHASES,
  type WardenPhase,
  wardenColor,
  wardenCycle,
  wardenCycleBeat,
  wardenPhase,
} from "./warden-cycle.js";
export {
  wardenEyeOpen,
  wardenHandleMilli,
  wardenPullMilli,
  wardenTether,
} from "./warden-rope.js";
export { installWell, type WellState } from "./well.js";
