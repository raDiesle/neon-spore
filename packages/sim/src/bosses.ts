/**
 * The seven bosses, as one barrel.
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
export type { BossState, FleetState, QueenState, VaneState, WardenState } from "./boss-state.js";
export {
  BOSS_KINDS,
  bossFillsWave,
  type FleetEntry,
  type GaugeEntry,
  type SnakeEntry,
  type VaneEntry,
  type WardenEntry,
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
  GAUGE_FULL,
  GAUGE_PHASES,
  type GaugePhase,
  type GaugeState,
  gaugeSeated,
} from "./gauge.js";
export {
  closeGauge,
  GAUGE_LEAD_BEATS,
  GAUGE_VERDICT_BEATS,
  gaugeBeats,
  gaugeHolds,
  gaugeRound,
  gaugeRoundHeard,
} from "./gauge-round.js";
export {
  MAZE_PHASES,
  MAZE_TURN,
  type MazePhase,
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
  MAZE_LEAD_BEATS,
  MAZE_READ_PER_WAY,
  MAZE_READ_SLACK,
  MAZE_TRAVEL_BEATS,
  MAZE_VERDICT_BEATS,
  mazeReadBeats,
} from "./maze-clock.js";
export { mazeRound } from "./maze-controls.js";
export {
  installMaze,
  type MazeState,
  type MazeVerdictReason,
  mazeCurrent,
} from "./maze-round.js";
export {
  type MazeCell,
  type MazeEntrance,
  type MazeMove,
  type MazeWheel,
  mazeCoreEntrance,
  mazeFault,
  mazeReachesCore,
  mazeRoute,
} from "./maze-wheel.js";
export { mirrorHoldsControls } from "./mirror.js";
export { queenMarkCol, queenOccupiesCol, ROCK_CYCLE } from "./queen-mark.js";
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
export { SNAKE_PHASES, type SnakePhase, type SnakeRound, type SnakeState } from "./snake.js";
export { SNAKE_MORPH_BEATS, SNAKE_VERDICT_BEATS, snakeHolds, snakeRound } from "./snake-round.js";
export { vaneOpen } from "./vane.js";
export {
  VANE_CYCLE,
  VANE_CYCLE_BEATS,
  VANE_PHASES,
  type VanePhase,
  type VaneStage,
  vaneColor,
  vaneCycle,
  vaneCycleBeat,
  vaneFold,
  vaneOpening,
  vanePhase,
  vanePivotCol,
  vaneReach,
  vaneReachMilli,
  vaneStageIndex,
  vaneStageStart,
  vaneTipCol,
  vaneWeakCol,
} from "./vane-cycle.js";
export { wardenEyeOpen, wardenPullMilli, wardenTether } from "./warden.js";
export {
  NO_TETHER,
  WARDEN_PHASES,
  type WardenPhase,
  wardenColor,
  wardenCycle,
  wardenCycleBeat,
  wardenPhase,
} from "./warden-cycle.js";
