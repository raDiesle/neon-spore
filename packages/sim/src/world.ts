import { emptyRunStats, type RunStats } from "./balance.js";
import { onBeat, resetRun, startWave } from "./beat.js";
import type { BossState } from "./boss-state.js";
import { advanceBullets, fire } from "./bullets.js";
import { type SimConfig, ticksPerBeat } from "./config.js";
import { mirrorHeard, mirrorHoldsControls } from "./mirror.js";
import { advancePods } from "./pods.js";
import { createRng, type Rng } from "./rng.js";
import { fireStep, type MirrorStep, type MirrorVerdictReason } from "./simon.js";

export type { BossEntry, MirrorEntry, PodEntry, QueenEntry, SpawnEntry } from "./entries.js";

import type { PodEntry, SpawnEntry } from "./entries.js";
import type {
  Bullet,
  Color,
  Creature,
  GuardStats,
  Pod,
  PodKind,
  Scar,
  TimedCommand,
} from "./types.js";

/**
 * Everything the simulation knows. Integers only — see docs/architecture.md.
 * Sub-tile values are stored in thousandths so two devices can never disagree
 * about a rounding step. Interpolation for the eye happens in render/.
 */
export interface World {
  cfg: SimConfig;
  rng: Rng;
  tick: number;
  beat: number;
  nextId: number;

  cannonCol: number;
  shieldCol: number;
  /** Tick of the most recent shield trigger by player 1. */
  guardTick: number;
  /** Tick of the most recent maw opening by player 1. */
  intakeTick: number;
  /** Last tick the shield still counts as armed without a trigger, set by a `ward` pod. */
  wardUntilTick: number;
  lastFireTick: number;

  creatures: Creature[];
  bullets: Bullet[];
  pods: Pod[];
  scars: Scar[];
  /** Hull integrity in thousandths, 0..100000. */
  hullMilli: number;
  guard: GuardStats;
  /** The rest of the balance sheet — pods, colours, the streak. */
  balance: RunStats;
  /** The boss a wave installs, or null. */
  boss: BossState | null;

  wave: number;
  waveBeat: number;
  spawned: number;
  queue: SpawnEntry[];
  podQueue: PodEntry[];
  podSpawned: number;
  restBeat: number;

  over: boolean;
  score: number;

  /** Cleared every tick. render/ and audio read this; nothing writes back. */
  events: SimEvent[];
}

export type SimEvent =
  | { type: "beat"; beat: number }
  | { type: "waveStart"; wave: number }
  | { type: "needWave"; wave: number }
  | { type: "fire"; col: number; color: Color }
  | { type: "destroy"; col: number; row: number; color: Color }
  | { type: "hole"; col: number; row: number }
  | { type: "reject"; col: number; row: number }
  | { type: "deflect"; col: number; span: number; kind: Creature["kind"]; fromRow: number }
  | { type: "podLoose"; col: number; row: number }
  | { type: "podTaken"; col: number; kind: PodKind }
  | { type: "podLost"; col: number }
  | {
      type: "breach";
      col: number;
      damage: number;
      span: number;
      kind: Creature["kind"];
      fromRow: number;
      /** The beat this happened on — matches the `Scar`s it left, so render/
       * can tell a scar's crack apart from one an earlier beat left behind. */
      beat: number;
    }
  | { type: "petal"; col: number; row: number; left: number }
  | { type: "queenDown"; col: number; row: number }
  /**
   * THE MIRROR performed one step of a sequence. `index` is 1-based, and
   * `col` is the column its own cannon was standing in as it did — which is
   * where render/ drops the ghost of a shot it performed.
   */
  | { type: "mirrorShow"; step: MirrorStep; index: number; of: number; col: number }
  /** The pair answered one step of a sequence correctly. */
  | { type: "mirrorEcho"; step: MirrorStep; index: number; of: number }
  /** A round is settled — right or wrong, why, and where it landed. */
  | { type: "mirrorVerdict"; right: boolean; col: number; reason: MirrorVerdictReason }
  | { type: "mirrorDown"; col: number };

export const MILLI = 1000;

export function createWorld(
  cfg: SimConfig,
  seed: number,
  queue?: SpawnEntry[],
  podQueue?: PodEntry[],
): World {
  ticksPerBeat(cfg); // fail loudly at construction, not mid-game
  const mid = Math.floor(cfg.cols / 2);
  const world: World = {
    cfg,
    rng: createRng(seed),
    tick: 0,
    beat: 0,
    nextId: 1,
    cannonCol: mid,
    shieldCol: mid,
    guardTick: -1_000_000,
    intakeTick: -1_000_000,
    wardUntilTick: -1_000_000,
    lastFireTick: -1_000_000,
    creatures: [],
    bullets: [],
    pods: [],
    scars: [],
    hullMilli: 100 * MILLI,
    guard: { tries: 0, deflected: 0, mistimed: 0 },
    balance: emptyRunStats(),
    boss: null,
    wave: 0,
    waveBeat: 0,
    spawned: 0,
    queue: queue ?? [],
    podQueue: podQueue ?? [],
    podSpawned: 0,
    restBeat: 0,
    over: false,
    score: 0,
    events: [],
  };
  if (queue || podQueue) startWave(world, 0, queue ?? [], podQueue);
  return world;
}

/** Advance exactly one tick. The only way the world ever changes. */
export function step(world: World, commands: readonly TimedCommand[]): void {
  world.events.length = 0;
  // Commands are read even when the hull is through — otherwise `restart`
  // could never arrive and the game would be stuck on its own end screen.
  for (const c of commands) applyCommand(world, c);
  if (world.over) return;

  world.tick += 1;
  const tpb = ticksPerBeat(world.cfg);
  if (world.tick % tpb === 0) onBeat(world);

  advanceBullets(world);
  advancePods(world);
  regenerateHull(world);
  progressWave(world);
}

/**
 * Every command is also a gesture THE MIRROR may be listening for, so each of
 * the four that has a step to its name reports it (`mirrorHeard` ignores it
 * unless a sequence is actually open). The cannon is the one that has to be
 * *derived*: a column is a place, and the step is which way it moved, so the
 * old column is read before the new one is written. Any jump counts once, in
 * the direction it went — a thumb dragged three columns is one gesture, not
 * three, because that is how many things the player did.
 */
function applyCommand(world: World, timed: TimedCommand): void {
  const c = timed.command;
  if (c.kind === "restart") {
    // The sim clears the run and then asks for a queue. It cannot build one
    // itself: waves live in content/, and content points at sim, not back.
    // Read even while the controls are held, or a run could never be left.
    resetRun(world);
    world.events.push({ type: "needWave", wave: 0 });
    return;
  }
  // Nothing at all reaches the ship while THE MIRROR is presenting.
  if (mirrorHoldsControls(world)) return;

  switch (c.kind) {
    case "cannonCol": {
      const from = world.cannonCol;
      world.cannonCol = clampCol(world, c.col);
      if (world.cannonCol !== from) {
        mirrorHeard(world, world.cannonCol > from ? "cannonRight" : "cannonLeft");
      }
      break;
    }
    case "shieldCol":
      world.shieldCol = clampCol(world, c.col);
      break;
    case "guard":
      world.guardTick = world.tick;
      mirrorHeard(world, "guard");
      break;
    case "intake":
      world.intakeTick = world.tick;
      mirrorHeard(world, "intake");
      break;
    case "fire":
      fire(world, c.color);
      mirrorHeard(world, fireStep(c.color));
      break;
  }
}

function regenerateHull(world: World): void {
  if (world.over) return;
  const perTick = Math.round((world.cfg.hullRegenPerSecond * MILLI) / world.cfg.tickHz);
  world.hullMilli = Math.min(100 * MILLI, world.hullMilli + perTick);
}

/**
 * The rest between waves is over. Ask the host for the next queue — and mark
 * the request as sent, so it is not repeated on every following tick while the
 * host gets around to answering.
 */
function progressWave(world: World): void {
  if (world.restBeat <= 0 || world.beat < world.restBeat) return;
  world.restBeat = -1;
  world.events.push({ type: "needWave", wave: world.wave + 1 });
}

function clampCol(world: World, col: number): number {
  return Math.max(0, Math.min(world.cfg.cols - 1, Math.round(col)));
}

/** Hull integrity as a plain 0..100 number, for display only. */
export function hullPercent(world: World): number {
  return world.hullMilli / MILLI;
}
