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
  liftTogetherUntil,
  NO_LIFT,
  nearestBeatTick,
} from "./beat-clock.js";
export { bossAnswerCol } from "./boss-answer.js";
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
  toGuidePage,
  toReadyPage,
} from "./briefing.js";
export {
  beatSeconds,
  DEFAULT_CONFIG,
  FLEET_SHELL_BEATS,
  hullRow,
  midCol,
  msToTicks,
  PAIR_ON,
  type SimConfig,
  ticksPerBeat,
} from "./config.js";
// THE FLEET's family of events, whole: `audio/bind-fleet.ts` reads it by one
// guard rather than ten cases in a file at its limit.
export type { FleetEvent } from "./events-fleet.js";
export { hashWorld } from "./hash.js";
export { type Replay, record, runReplay } from "./replay.js";
export { createRng, next, nextInt, type Rng } from "./rng.js";
export { endRun, resetClock, resetRun } from "./run.js";
export { SceneRun, type SceneScript } from "./scene.js";
export { arrivingFirst, atBodyCol, type SceneCommand } from "./scene-aim.js";
// **THE SLOW**, and it leaves the package because it has to: the only clock in
// the stack is `apps/game/src/loop.ts`, so the simulation says *which beats are
// slowed* and the app says *how long a tick is worth* (`docs/decisions.md` #33).
export { NO_SLOW, type SlowKind, slowing, slowRateMilli } from "./slow.js";
// **The spend ledger's one reader outside the simulation**, and the narrowest
// one there is: how many shots of a colour the pair has spent over a window,
// which is the number the navigator is shown on THE TASTER's wave and has to
// say out loud (`taster-draw.ts`, `spend.ts`). `spendLean` stays inside: a
// screen that worked out for itself which side of the ledger is winning is a
// second copy of the boss's own rule, which is the row `copies-table.ts`
// carries — what the picture shows is the two counts, and the reading of them
// is the pair's.
export { spentOver } from "./spend.js";
export { clearHolds, restSeconds, roundSpent } from "./wave-end.js";
export {
  clockText,
  failHolds,
  failWave,
  framePhase,
  lostAsks,
  playSeconds,
  retriesText,
} from "./wave-fail.js";
// And the unit those thousandths are in. `MILLI` is CLAUDE.md rule 3's own
// name for it and every `*Milli` field in the package is measured against it,
// so a caller outside the package that reads one needs it to mean anything.
export {
  type BossEntry,
  createWorld,
  type LitTile,
  MILLI,
  type MirrorEntry,
  type PodEntry,
  type QueenEntry,
  type SimEvent,
  type SpawnEntry,
  step,
  type World,
} from "./world.js";
