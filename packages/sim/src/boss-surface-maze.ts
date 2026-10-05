/**
 * **THE MAZE's names on `@neon-spore/sim`'s surface**, cut off
 * `boss-surface.ts` on 29 September 2026, the day the lever's ring moved into
 * the simulation — its radius is the lever's gearing now, one turn a lap
 * (`mazeLeverOutMilli`) — and the name that came with it took that file to its
 * limit. Another page along the seam SPLICE, SNAKE and PINBALL cut;
 * `boss-surface.ts` re-exports it whole, so nothing that reached for a
 * `MazeState` had to move.
 */

export {
  installMaze,
  MAZE_APPROACH_BEATS,
  MAZE_REASONS,
  MAZE_TURN,
  MAZE_VERDICT_BEATS,
  type MazeEntrance,
  type MazeGeometry,
  type MazeState,
  type MazeStep,
  type MazeWheel,
  mazeArc,
  mazeBottomCol,
  mazeCenterMilli,
  mazeCircleMilli,
  mazeCopyWheel,
  mazeCoreEntrance,
  mazeCosMilli,
  mazeCurrent,
  mazeEntranceAngle,
  mazeEntranceCol,
  mazeEntrances,
  mazeFault,
  mazeHeartColor,
  mazeHeartShot,
  mazeRadiusMilli,
  mazeReachesCore,
  mazeReadBeats,
  mazeRingMilli,
  mazeRound,
  mazeSinMilli,
  mazeSolveRoute,
  mazeSweep,
  mazeWheel,
} from "./bosses.js";
// The ring the lever's knob runs round, from its own file rather than through
// `bosses.ts`, which is at its limit: the picture draws the knob on the ring
// the simulation gears the wheel to (`mazeDragTurn`).
export { mazeLeverRadiusMilli } from "./maze.js";
// Which parts THE MAZE asks a hand for, which its rings read (`maze-marks.ts`).
export { mazeStringAsks } from "./maze-controls.js";
export { mazeHeartAsks } from "./maze-hand.js";
// The heart's room and how far through the shake the pair is, which the
// picture draws the heart and its green count from (`maze-grip.ts`).
export { mazeShakeFreeMilli, mazeShakeSeatDone, mazeShakeThrough } from "./maze-shake.js";
// Which losses bring the drum down on the ship, which `maze-fall.ts` drops.
export { mazeFalls } from "./maze-verdict.js";
// The gearing of a lever carried round a rim, THE MAZE's and THE OCULUS's (`rim-turn.ts`).
export { rimLapMilli, rimTurnMilli } from "./rim-turn.js";
