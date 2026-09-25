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

// The band's two facts the picture has to share with the judgement: how wide
// it is at this moment, and whether it is wound at all (`gauge-band.ts`).
export { gaugeBound, gaugeSeatedBy, gaugeSpanNow } from "./gauge-band.js";

// And the needle's two: dead valve, and a hand that has not settled yet —
// with the pair of them named, which is the round's second axis.
export { GAUGE_GRIPS, type GaugeGrip, gaugeJammed, gaugeSettling } from "./gauge-hand.js";

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
// The two gates the round's hands are held to, so the rings drawn on them ask
// the simulation rather than restating it (`pinball-hand.ts`).
export { pinNudgeable, pinWindable } from "./pinball-hand.js";
// Standing a board up and asking what is left on it (`pinball-open.ts`).
export { pinballCurrent, pinTargetsLeft } from "./pinball-open.js";
export { type PinPhysics, stepBall } from "./pinball-physics.js";
export {
  closePinball,
  PINBALL_MORPH_BEATS,
  PINBALL_VERDICT_BEATS,
  pinballHolds,
  pinballRound,
} from "./pinball-round.js";
// Whether a cannon in this column would take a ball at this place: the round
// asks it at the floor, the field's cue asks it every tick of a flight
// (`pinball-shot.ts`).
export { launchBall, pinCaught, pinRestingBall, resetShot } from "./pinball-shot.js";

export {
  PULSE_COUNT_BEATS,
  PULSE_HEARTS,
  PULSE_JUDGES,
  PULSE_LANES,
  PULSE_PHASES,
  type PulseHeart,
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
// What the shared meter has become — read, never re-derived (`pulse-hand.ts`).
export { pulseBraced, pulseHeart } from "./pulse-hand.js";

export { pulseCurrent } from "./pulse-open.js";

export {
  closePulse,
  PULSE_VERDICT_BEATS,
  pulseHolds,
  pulseRound,
} from "./pulse-round.js";

export {
  SNAKE_GRIPS,
  SNAKE_PHASES,
  type SnakeGrip,
  type SnakePhase,
  type SnakeRound,
  type SnakeState,
  type SnakeTile,
  // What the body has become, off its own length — read by the STATES sheet
  // and the picture, never re-derived from `body.length` (`snake.ts`).
  snakeGrip,
  snakeLifted,
} from "./snake.js";

export { snakeCrashed, snakePointAt } from "./snake-arena.js";
export { snakeResting } from "./snake-controls.js";
// The way home after a cleared arena: the picture opens the mouth off it and
// slides the body on the same step the simulation takes (`snake-home.ts`).
export { snakeGate, snakeGoingHome, snakeStepTicks } from "./snake-home.js";
// Where a shot taken this instant would stop: the cue asks, so that the word
// `FIRE` and the shot itself cannot disagree (`snake-move.ts`).
export { snakeShotStop } from "./snake-move.js";
export { SNAKE_MORPH_BEATS, SNAKE_VERDICT_BEATS, snakeHolds, snakeRound } from "./snake-round.js";
