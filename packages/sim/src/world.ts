import { onBeat, resetRun, startWave } from "./beat.js";
import { advanceBullets, fire } from "./bullets.js";
import { type SimConfig, ticksPerBeat } from "./config.js";
import { advancePods } from "./pods.js";
import { createRng, type Rng } from "./rng.js";
import type { Bullet, Color, Creature, GuardStats, Pod, Scar, TimedCommand } from "./types.js";

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
  lastFireTick: number;

  creatures: Creature[];
  bullets: Bullet[];
  pods: Pod[];
  scars: Scar[];
  /** Hull integrity in thousandths, 0..100000. */
  hullMilli: number;
  guard: GuardStats;

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

export interface SpawnEntry {
  beat: number;
  col: number;
  kind: Creature["kind"];
  color: Color | null;
}

/**
 * Where a pod is left hanging. Its own queue rather than an entry in the spawn
 * queue: a pod is not a creature, it is never cleared, and a wave that ends
 * with one still hanging has still ended (docs/spec/systems.md 5.7).
 */
export interface PodEntry {
  beat: number;
  col: number;
  /** Row it hangs at, from the top. Never the hull row. */
  row: number;
}

export type SimEvent =
  | { type: "beat"; beat: number }
  | { type: "waveStart"; wave: number }
  | { type: "needWave"; wave: number }
  | { type: "fire"; col: number; color: Color }
  | { type: "destroy"; col: number; row: number; color: Color }
  | { type: "hole"; col: number; row: number }
  | { type: "reject"; col: number; row: number }
  | { type: "deflect"; col: number }
  | { type: "podLoose"; col: number; row: number }
  | { type: "podTaken"; col: number }
  | { type: "podLost"; col: number }
  | { type: "breach"; col: number; damage: number };

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
    lastFireTick: -1_000_000,
    creatures: [],
    bullets: [],
    pods: [],
    scars: [],
    hullMilli: 100 * MILLI,
    guard: { tries: 0, deflected: 0, mistimed: 0 },
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

function applyCommand(world: World, timed: TimedCommand): void {
  const c = timed.command;
  switch (c.kind) {
    case "cannonCol":
      world.cannonCol = clampCol(world, c.col);
      break;
    case "shieldCol":
      world.shieldCol = clampCol(world, c.col);
      break;
    case "guard":
      world.guardTick = world.tick;
      break;
    case "intake":
      world.intakeTick = world.tick;
      break;
    case "fire":
      fire(world, c.color);
      break;
    case "restart":
      // The sim clears the run and then asks for a queue. It cannot build one
      // itself: waves live in content/, and content points at sim, not back.
      resetRun(world);
      world.events.push({ type: "needWave", wave: 0 });
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
