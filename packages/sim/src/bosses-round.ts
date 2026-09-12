/**
 * The rounds, as their half of the boss barrel.
 *
 * Split out of `bosses.ts` when THE TELL pushed that file past its 250-line
 * limit, along the seam this repository has now cut four times for the same
 * growth — `mechanics-rounds.ts`, `ship-fields-round.ts`, `ship-notes-round.ts`
 * and `config-rounds.ts`. What is left next door is a boss with a body on the
 * grid; everything here is a round that takes the grid away and brings its own
 * picture and its own panel (`docs/spec/interludes.md`). Nine more are
 * designed, and this is the half that grows.
 *
 * `bosses.ts` re-exports the whole of it, so nothing that already reached for
 * a `PulseStage` or a `SnakeTile` through `@neon-spore/sim` had to move.
 */

export {
  GAUGE_FULL,
  GAUGE_PHASES,
  type GaugePhase,
  type GaugeState,
  gaugeBeatsLeft,
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
  PIN_SHOTS,
  PINBALL_PHASES,
  type PinballPhase,
  type PinballRound,
  type PinballState,
  type PinShot,
  pinballCurrent,
  pinTargetsLeft,
} from "./pinball.js";
export {
  pinballFault,
  pinCannonMilli,
  pinFieldCol,
  pinHeightMilli,
  pinLaneFloorMilli,
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
export { launchBall, pinRestingBall, resetShot } from "./pinball-shot.js";

export {
  PULSE_COUNT_BEATS,
  PULSE_JUDGES,
  PULSE_LANES,
  PULSE_PHASES,
  type PulseJudge,
  type PulseLane,
  type PulseNote,
  type PulsePhase,
  type PulseStage,
  type PulseState,
} from "./pulse.js";

export {
  pulseAim,
  pulseCalls,
  pulseEndTick,
  pulseFault,
  pulseLaneIndex,
  pulseNoteAt,
  pulseNoteTick,
  pulseVeiled,
} from "./pulse-chart.js";

export { pulseCurrent } from "./pulse-open.js";

export {
  closePulse,
  PULSE_VERDICT_BEATS,
  pulseHolds,
  pulseRound,
} from "./pulse-round.js";

export {
  SNAKE_PHASES,
  type SnakePhase,
  type SnakeRound,
  type SnakeState,
  type SnakeTile,
} from "./snake.js";

export { snakeCrashed } from "./snake-arena.js";
export { snakeResting } from "./snake-controls.js";
export { SNAKE_MORPH_BEATS, SNAKE_VERDICT_BEATS, snakeHolds, snakeRound } from "./snake-round.js";
