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
  type PinballEntry,
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
export {
  installMaze,
  type MazeState,
  mazeCurrent,
  mazeHeartColor,
  mazeHeartShot,
} from "./maze-round.js";
export { mazeEntrances, mazeSolveRoute, mazeWheel } from "./maze-solve.js";
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
  launchBall,
  PIN_SHOTS,
  PINBALL_PHASES,
  type PinballPhase,
  type PinballRound,
  type PinballState,
  type PinShot,
  pinballCurrent,
  pinRestingBall,
  pinTargetsLeft,
} from "./pinball.js";
export {
  pinballFault,
  pinClampBucket,
  pinFieldCol,
  pinHeightMilli,
  pinLaunchVelocity,
  pinPhysics,
  pinPower,
  pinSweep,
  pinWidthMilli,
} from "./pinball-board.js";
export {
  hitPiece,
  isqrt,
  PIN_PIECE_KINDS,
  PIN_THIN_MILLI,
  type PinBall,
  type PinPiece,
  type PinPieceKind,
} from "./pinball-contact.js";
export { type PinPhysics, stepBall } from "./pinball-physics.js";
export {
  closePinball,
  PINBALL_MORPH_BEATS,
  PINBALL_VERDICT_BEATS,
  pinballHolds,
  pinballRound,
} from "./pinball-round.js";
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
export {
  SNAKE_PHASES,
  type SnakePhase,
  type SnakeRound,
  type SnakeState,
  type SnakeTile,
} from "./snake.js";
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
