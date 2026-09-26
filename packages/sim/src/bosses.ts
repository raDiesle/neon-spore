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

export { clampQueenCol, QUEEN_FLANK_TILES, queenHalfCols, queenTorchCol } from "./boss.js";
export type {
  AntiphonEntry,
  BatonEntry,
  CairnEntry,
  CurtainEntry,
  FilamentEntry,
  FleetEntry,
  GaugeEntry,
  GimbalEntry,
  GorgeEntry,
  HaspEntry,
  HiveEntry,
  InstarEntry,
  KeelEntry,
  LeadEntry,
  LedgerEntry,
  MantleEntry,
  PinballEntry,
  PulseEntry,
  RepriseEntry,
  ScoutEntry,
  ScuttleEntry,
  SinewEntry,
  SnakeEntry,
  SpliceEntry,
  SpoolEntry,
  StareEntry,
  SurgeEntry,
  TasterEntry,
  ThroatEntry,
  UndertowEntry,
  ValveEntry,
  VaneEntry,
  WardenEntry,
  WellEntry,
} from "./boss-entries.js";
export type { FleetState, QueenState, VaneState, WardenState } from "./boss-state.js";
export type { BossState } from "./boss-union.js";
// And the five bosses that are a clock, whole, for that file's reason said
// about beats rather than about pictures (`bosses-clocks.ts`).
export * from "./bosses-clocks.js";
// The six rounds are next door and re-exported whole (`bosses-round.ts`).
export * from "./bosses-round.js";
// THE SCOUT, whole, and re-exported (`bosses-scout.ts`).
export * from "./bosses-scout.js";
export { type CairnState, cairnState } from "./cairn.js";
export { cairnHeldNow, cairnHoldLeft, cairnWaited } from "./cairn-hold.js";
export { BOSS_KINDS, bossFillsWave } from "./entries.js";
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
// THE LEAD is a boss with a *place* and no clock — a column, a way and a
// lean — which is why it is here and not among the counts next door
// (`lead.ts`, `config-lead.ts`).
export {
  type LeadFlight,
  type LeadState,
  leadAim,
  leadBoss,
  leadCrossed,
  leadForecasts,
  leadGrippable,
  leadHeading,
  leadHolding,
  leadLast,
  leadLead,
  leadPace,
  leadPassDir,
  leadPassing,
  leadRunning,
  leadShootable,
  leadStill,
  leadWalk,
} from "./lead.js";
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
export {
  QUEEN_GESTURES,
  type QueenGesture,
  queenGesture,
  queenMarkCol,
  queenOccupiesCol,
  ROCK_CYCLE,
} from "./queen-mark.js";
export {
  type RepriseState,
  repriseEchoing,
  repriseHeld,
  repriseLeft,
} from "./reprise-state.js";
export {
  fireStep,
  MIRROR_GESTURES,
  MIRROR_HOLD_BEATS,
  MIRROR_LEAD_BEATS,
  MIRROR_PHASES,
  MIRROR_STEPS,
  type MirrorGesture,
  type MirrorPhase,
  type MirrorState,
  type MirrorStep,
  type MirrorVerdictReason,
  mirrorGesture,
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
export { vaneOpen } from "./vane.js"; // `vaneBearingOpen` and the pinned arm: `bosses-clocks-b.ts`.
export { vaneFold, vanePivotCol, vaneReach, vaneTipCol, vaneWeakCol } from "./vane-arm.js";
export {
  VANE_CYCLE,
  VANE_CYCLE_BEATS,
  VANE_PHASES,
  type VaneGesture,
  type VanePhase,
  type VaneStage,
  vaneColor,
  vaneCycle,
  vaneCycleBeat,
  vaneOpening,
  vaneOpeningNow,
  vanePhase,
  vaneReachMilli,
  vaneSplitsOnCycle,
  vaneStageIndex,
  vaneStageStart,
} from "./vane-cycle.js";
export {
  NO_TETHER,
  WARDEN_PHASES,
  type WardenGesture,
  type WardenPhase,
  wardenColor,
  wardenCycle,
  wardenCycleBeat,
  wardenLowersRope,
  wardenPhase,
} from "./warden-cycle.js";
// `wardenEyeOpen` and the hatch's and lids' openness: `bosses-clocks-b.ts`.
export { wardenHandleMilli, wardenPullMilli, wardenTether } from "./warden-rope.js";
export {
  installWell,
  NO_WELL_GRIP,
  WELL_PHASES,
  type WellPhase,
  type WellState,
  wellBoss,
  wellHeldNow,
  wellHoldLeft,
  wellMaxOffsetMilli,
} from "./well.js";
