import { emptyRunStats, type RunStats } from "./balance.js";
import type { BossState } from "./boss-state.js";
import { type Briefings, newBriefings } from "./briefing.js";
import { midCol, type SimConfig, ticksPerBeat } from "./config.js";
import { NO_GRIP } from "./grip.js";
import { NO_PRIME } from "./lance.js";
import { createRng, type Rng } from "./rng.js";
import type { ShotCharge } from "./shot-charge.js";
import { startWave } from "./wave-start.js";

export type {
  BossEntry,
  MazeEntry,
  MirrorEntry,
  PodEntry,
  QueenEntry,
  SpawnEntry,
} from "./entries.js";
export type { SimEvent } from "./events.js";

import type { PodEntry, SpawnEntry } from "./entries.js";
import type { SimEvent } from "./events.js";
import type { Bullet, Creature, GuardStats, Pod, Scar } from "./types.js";

// `step` is the shape of a tick, not of the world's own state — it lives in
// step.ts along with `progressWave`. Re-exported here so nothing that already
// reaches for it through world.ts has to move.
export { step } from "./step.js";

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
  /**
   * The creature each player has a hand on, or `NO_GRIP`. Read them through
   * `gripsCreature` (grip.ts) rather than by name — which field is whose is
   * that file's business.
   */
  gripP1: number;
  gripP2: number;
  /**
   * The tick player 1's thumb went down on the lance, or `NO_PRIME`. Read it
   * through `lance.ts` rather than by name — how full the lobe is and whether
   * the next shot is a lance are that file's business, and render/, the band
   * and the shot itself all ask the same question from three places.
   *
   * There is no `primeCol` beside it, deliberately: a cannon that moves ends
   * the fill, so while this is set the column *is* `cannonCol`, and a second
   * copy of it could only ever disagree.
   */
  primeTick: number;
  /**
   * The shot player 2 has pressed that has not left the muzzle yet, or null.
   * World state for the reason a bullet in flight is: two devices that
   * disagree about whether a shot exists have desynced. Ask `shot-charge.ts`.
   */
  charge: ShotCharge | null;

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
  const mid = midCol(cfg);
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
    gripP1: NO_GRIP,
    gripP2: NO_GRIP,
    primeTick: NO_PRIME,
    charge: null,
    creatures: [],
    bullets: [],
    pods: [],
    scars: [],
    hullMilli: 100 * MILLI,
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
    over: false,
    score: 0,
    events: [],
  };
  if (queue || podQueue) startWave(world, 0, queue ?? [], podQueue);
  return world;
}
