/**
 * Every name the boss code puts on `@neon-spore/sim`'s surface, written out.
 *
 * `index.ts` used to say `export * from "./bosses.js"`, and `bosses.ts` is a
 * barrel of twenty more — so the package's surface was defined transitively
 * and could not be read anywhere. This file is the list, and it is the whole
 * of the file: `index.ts` re-exports it wholesale, which is safe precisely
 * because there is nothing here but names.
 *
 * A name here is one something outside `packages/sim` imports. Adding one is
 * how a boss rule leaves the package; if nothing imports it, it does not
 * belong here, and `bun run typecheck` will say so either way.
 */

// And the clock bosses' names, whole — a list of the same kind, cut for the
// same reason `bosses.ts` was (`boss-surface-clocks.ts`).
export * from "./boss-surface-clocks.js";
// And PINBALL's, whole: the round whose state is a shot rather than a clock
// (`boss-surface-pinball.ts`).
export * from "./boss-surface-pinball.js";
// And SNAKE's, whole: the round with two axes of state and the only one with
// a gesture on its own body (`boss-surface-snake.ts`).
export * from "./boss-surface-snake.js";
// THE SPLICE's, since its flights became a list (`boss-surface-splice.ts`).
export * from "./boss-surface-splice.js";
export {
  BOSS_KINDS,
  // The union itself: `render/touch-field.ts` carries one boss rather than one
  // nullable field per boss, and narrows it where a handle is hit-tested.
  type BossState,
  bossFillsWave,
  type CairnState,
  cairnHeldNow,
  cairnHoldLeft,
  cairnState,
  cairnWaited,
  enterScoutPhase,
  FLEET_LEN_MAX,
  FLEET_LEN_MIN,
  FLEET_SHIPS_MAX,
  type FleetEntry,
  type FleetShip,
  type FleetState,
  fleetAfloat,
  fleetBeatsLeft,
  fleetCols,
  fleetFault,
  fleetIndex,
  fleetOnBoard,
  fleetRows,
  fleetShipAt,
  // A square already fired at: the director's hand on the sights reads it
  // to walk past the splashes, the way the pair reads the chart's marks.
  fleetStruck,
  GAUGE_FULL,
  GAUGE_LEAD_BEATS,
  type GaugeEntry,
  type GaugeState,
  gaugeBeatsLeft,
  // The two states the round gained, and the width one of them changes: the
  // cue reads all three, and the dial draws the band at the width the
  // judgement uses rather than at the one in the config.
  gaugeBound,
  gaugeHolds,
  gaugeJammed,
  gaugeRound,
  gaugeSeated,
  gaugeSeatedBy,
  gaugeSettling,
  gaugeSpanNow,
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
  MIRROR_GESTURES,
  MIRROR_LEAD_BEATS,
  MIRROR_STEPS,
  type MirrorGesture,
  type MirrorPhase,
  type MirrorState,
  type MirrorStep,
  type MirrorVerdictReason,
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
  mirrorGesture,
  mirrorHoldsControls,
  mirrorListenBeats,
  NO_TETHER,
  PULSE_COUNT_BEATS,
  PULSE_JUDGES,
  PULSE_LANES,
  PULSE_PHASES,
  PULSE_VERDICT_BEATS,
  type PulseEntry,
  type PulseJudge,
  type PulseLane,
  type PulseNote,
  type PulsePhase,
  type PulseStage,
  type PulseState,
  pulseCalls,
  pulseCurrent,
  pulseEndTick,
  pulseFault,
  // What the shared meter has become (`pulse-hand.ts`).
  pulseHeart,
  pulseHolds,
  pulseLaneIndex,
  pulseNoteAt,
  pulseNoteTick,
  pulseRound,
  pulseVeiled,
  QUEEN_FLANK_TILES,
  type QueenGesture,
  type QueenState,
  queenGesture,
  queenMarkCol,
  queenTorchCol,
  type RepriseEntry,
  type RepriseState,
  ROCK_CYCLE,
  repriseEchoing,
  repriseHeld,
  repriseLeft,
  type ScoutArena,
  type ScoutEntry,
  type ScoutHazard,
  type ScoutMote,
  type ScoutPhase,
  type ScoutPoint,
  type ScoutState,
  scoutAtHome,
  scoutCleared,
  scoutCurrent,
  scoutHolds,
  scoutHome,
  scoutLeft,
  // What the motes aboard have made of the little ship (`scout-hand.ts`).
  scoutLoad,
  scoutMawOpen,
  scoutNose,
  scoutOpenRound,
  // Whether a burn takes this tick, which the flight and the picture must not
  // disagree about — the wake and the prime's dial both ask it
  // (`scout-hand.ts`, `render/scout-grip.ts`).
  scoutPrimed,
  scoutRound,
  shipCol,
  shipCovers,
  shipRow,
  stepBall,
  UNDERTOW_BREACH_STAGES,
  UNDERTOW_PHASES,
  type UndertowBreach,
  type UndertowBreachStage,
  type UndertowEntry,
  type UndertowPhase,
  type UndertowState,
  undertowBoss,
  undertowBowBeats,
  undertowBreachAt,
  undertowLastCol,
  undertowLobeAt,
  undertowPinned,
  undertowPlateBeside,
  undertowUnseated,
  VANE_CYCLE,
  VANE_CYCLE_BEATS,
  VANE_PHASES,
  type VaneState,
  vaneColor,
  vaneCycle,
  vaneCycleBeat,
  vaneFold,
  vaneOpen,
  vaneOpening,
  vaneOpeningNow,
  vanePhase,
  vanePivotCol,
  vaneReach,
  vaneReachMilli,
  vaneStageStart,
  vaneTipCol,
  vaneWeakCol,
  WARDEN_PHASES,
  type WardenGesture,
  type WardenState,
  type WellEntry,
  wardenColor,
  wardenCycle,
  wardenHandleMilli,
  wardenLowersRope,
  // The phase its plates put it in, for the STATES sheet's pose of each
  // (`tools/director/src/poses-bosses-clocks.ts`) — read, never re-derived.
  wardenPhase,
  wardenPullMilli,
  wardenTether,
} from "./bosses.js";
// And THE REPRISE's schedule and its clock, which the director and the
// measure along the top of the screen read (`reprise-plan.ts`).
export { type RepriseEcho, reprisePlan } from "./reprise-plan.js";
export { type RepriseClock, repriseClock, repriseEvery } from "./reprise-state.js";
