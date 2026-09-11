/**
 * **The run itself**: the world and its step, the clock and the seeded rng, a
 * wave starting and ending, an opening and its guide, a replay, a scene, and
 * the fingerprint two devices compare.
 *
 * Cut out of `index.ts` with `index-creatures.ts` and `index-ship.ts`, for the
 * reason written at the top of the first of them. This is the group nothing on
 * the field belongs to: it is the frame every wave is played inside, and it is
 * what `apps/game`, `packages/net` and every tool reach for first.
 */

export { type BalanceSheet, balanceSheet, share, type Tally } from "./balance.js";
export { startWave } from "./beat.js";
export {
  beatPhase,
  beatPhaseTicks,
  beatStartTick,
  isBeatTick,
  nearestBeatTick,
} from "./beat-clock.js";
export { setBossRound } from "./boss-round.js";
export {
  ackBriefing,
  type Briefings,
  briefingAcked,
  briefingHolds,
  guideHolds,
  guidePage,
  guidePages,
  guideStepHeard,
  guideStepped,
  introHolds,
  OPENING_GUIDE,
  OPENING_INTRO,
  OPENING_PLAY,
  type OpeningPhase,
  onReadyPage,
  readyFill,
  readyFraction,
  readyHeld,
  readyHoldTicks,
  seatReady,
  toReadyPage,
} from "./briefing.js";
export {
  DEFAULT_CONFIG,
  FLEET_SHELL_BEATS,
  hullRow,
  midCol,
  msToTicks,
  PAIR_ON,
  type SimConfig,
  ticksPerBeat,
} from "./config.js";
export { hashWorld } from "./hash.js";
export { type Replay, record, runReplay } from "./replay.js";
export { createRng, next, nextInt, type Rng } from "./rng.js";
export { endRun, resetClock, resetRun } from "./run.js";
export { SceneRun, type SceneScript } from "./scene.js";
export { arrivingFirst, atBodyCol, type SceneCommand } from "./scene-aim.js";
export { roundSpent } from "./wave-end.js";
export {
  type BossEntry,
  createWorld,
  type MirrorEntry,
  type PodEntry,
  type QueenEntry,
  type SimEvent,
  type SpawnEntry,
  step,
  type World,
} from "./world.js";
