import { emptyRunStats, type RunStats } from "./balance.js";
import type { BossState } from "./boss-state.js";
import { type Briefings, newBriefings } from "./briefing.js";
import { type SimConfig, ticksPerBeat } from "./config.js";
import type { Malfunction } from "./malfunction.js";
import { createRng, type Rng } from "./rng.js";
import { startWave } from "./wave-start.js";
import { newShipState, type ShipState } from "./world-ship.js";

export type {
  BossEntry,
  MazeEntry,
  MirrorEntry,
  PodEntry,
  QueenEntry,
  SpawnEntry,
} from "./entries.js";
export type { SimEvent } from "./events.js";
export type { ShipState } from "./world-ship.js";

import type { PodEntry, SpawnEntry } from "./entries.js";
import type { SimEvent } from "./events.js";
import type { Bullet, Creature, GuardStats, Pod, Scar } from "./types.js";
import { NOT_FAILED } from "./wave-fail.js";

// `step` is the shape of a tick, not of the world's own state — it lives in
// step.ts along with `progressWave`. Re-exported here so nothing that already
// reaches for it through world.ts has to move.
export { step } from "./step.js";

/**
 * Everything the simulation knows. Integers only — see docs/architecture.md.
 * Sub-tile values are stored in thousandths so two devices can never disagree
 * about a rounding step. Interpolation for the eye happens in render/.
 *
 * The ship's own twenty-odd fields — both hands, the arm, the crank and the
 * three stages of a shot — are `ShipState` in `world-ship.ts`, extended rather
 * than nested so `world.cannonCol` stays where every reader already looks.
 * What is left here is the field, the wave and the run.
 */
export interface World extends ShipState {
  cfg: SimConfig;
  rng: Rng;
  tick: number;
  /**
   * A label, not a position: never `beat * ticksPerBeat`. A beat is the unit
   * the content is written in and the tick is the unit the world is stepped
   * in, and the two are related by `ticksPerBeat(cfg)` only at the moment one
   * is converted to the other — which is `beat-clock.ts`'s job and nowhere
   * else's. Read it as "which beat of this wave are we on", and ask that file
   * anything about when the next one falls.
   */
  beat: number;
  nextId: number;

  /**
   * The fault this wave is played under, or null for every wave that is played
   * straight. Installed by `startWave` from the wave's own field, exactly the
   * way a boss is, and never written again while the wave runs.
   *
   * Read through `malfunction.ts` rather than by name — what a fault does on
   * a beat and what it loads are that file's business, and the panel, the
   * picture and the beat all ask the same question.
   */
  malfunction: Malfunction | null;

  creatures: Creature[];
  bullets: Bullet[];
  pods: Pod[];
  scars: Scar[];
  guard: GuardStats;
  /** The rest of the balance sheet — pods, colours, the streak. */
  balance: RunStats;
  /** The boss a wave installs, or null. */
  boss: BossState | null;
  /**
   * The cards this wave still owes, and everything the pair has already been
   * taught. World state rather than the app's, because a card stops the wave:
   * two devices that disagree about whether one is up disagree about whether
   * the world ticked at all (`briefing.ts`).
   */
  brief: Briefings;

  wave: number;
  waveBeat: number;
  spawned: number;
  queue: SpawnEntry[];
  podQueue: PodEntry[];
  podSpawned: number;
  restBeat: number;
  /**
   * The tick a hit failed this opening of the wave, `NOT_FAILED` while none
   * has, and a second sentinel once the retry is asked for (`wave-fail.ts`).
   */
  failTick: number;
  /** How many times a wave has been gone again, over the whole run. */
  retries: number;
  /** Ticks the pair has spent with a wave live, over the whole run. */
  playTicks: number;

  over: boolean;
  score: number;

  /** Cleared every tick. render/ and audio read this; nothing writes back. */
  events: SimEvent[];
}

export const MILLI = 1000;

export function createWorld(
  cfg: SimConfig,
  seed: number,
  queue?: SpawnEntry[],
  podQueue?: PodEntry[],
): World {
  ticksPerBeat(cfg); // fail loudly at construction, not mid-game
  const world: World = {
    cfg,
    rng: createRng(seed),
    tick: 0,
    beat: 0,
    nextId: 1,
    ...newShipState(cfg),
    malfunction: null,
    creatures: [],
    bullets: [],
    pods: [],
    scars: [],
    guard: { tries: 0, deflected: 0, mistimed: 0 },
    balance: emptyRunStats(),
    boss: null,
    brief: newBriefings(),
    wave: 0,
    waveBeat: 0,
    spawned: 0,
    queue: queue ?? [],
    podQueue: podQueue ?? [],
    podSpawned: 0,
    restBeat: 0,
    failTick: NOT_FAILED,
    retries: 0,
    playTicks: 0,
    over: false,
    score: 0,
    events: [],
  };
  if (queue || podQueue) startWave(world, 0, queue ?? [], podQueue);
  return world;
}
