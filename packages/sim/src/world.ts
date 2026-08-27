import { emptyRunStats, type RunStats } from "./balance.js";
import { onBeat, startWave } from "./beat.js";
import type { BossState } from "./boss-state.js";
import { ackBriefing, type Briefings, briefingHolds, newBriefings } from "./briefing.js";
import { advanceBullets } from "./bullets.js";
import { applyCommand } from "./commands.js";
import { type SimConfig, ticksPerBeat } from "./config.js";
import { forkOpen, NO_FORK, restEnded } from "./fork.js";
import { dropLostGrips, NO_GRIP } from "./grip.js";
import { NO_PRIME, noteLanceFull } from "./lance.js";
import { advancePods } from "./pods.js";
import { createRng, type Rng } from "./rng.js";
import { pullTether } from "./warden.js";

export type { BossEntry, MirrorEntry, PodEntry, QueenEntry, SpawnEntry } from "./entries.js";
export type { SimEvent } from "./events.js";

import type { PodEntry, SpawnEntry } from "./entries.js";
import type { SimEvent } from "./events.js";
import type { Bullet, Creature, GuardStats, Pod, Scar, TimedCommand } from "./types.js";

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

  /**
   * The beat THE FORK opened on, or `NO_FORK` while a wave is running. Ask
   * `fork.ts` rather than comparing it here — whether the run is waiting, whose
   * thumb is in and how long the breath has been are that file's business, and
   * it is deliberately never compared with a deadline.
   */
  forkBeat: number;

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
    gripP1: NO_GRIP,
    gripP2: NO_GRIP,
    primeTick: NO_PRIME,
    creatures: [],
    bullets: [],
    pods: [],
    scars: [],
    hullMilli: 100 * MILLI,
    guard: { tries: 0, deflected: 0, mistimed: 0 },
    balance: emptyRunStats(),
    boss: null,
    brief: newBriefings(),
    forkBeat: NO_FORK,
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
  // A card is up. Nothing reaches the ship — the same rule THE MIRROR plays by
  // while it is presenting — and the only command that means anything is the
  // one that puts the card away.
  //
  // The tick still counts, and that is not a detail: a press is scheduled
  // `inputDelayTicks` into the future on both devices at once, so a world that
  // froze its tick counter would be waiting for a dismissal it had arranged to
  // never reach itself. The wave is what stands still, not the clock.
  if (briefingHolds(world)) {
    for (const c of commands) if (c.command.kind === "brief") ackBriefing(world, c.player);
    world.tick += 1;
    return;
  }
  // Commands are read even when the hull is through — otherwise `restart`
  // could never arrive and the game would be stuck on its own end screen.
  for (const c of commands) applyCommand(world, c);
  if (world.over) return;

  world.tick += 1;
  // Before the beat and before the shots: the lobe fills on the tick counter,
  // so the tick it comes full on is this one, whatever else happens next.
  noteLanceFull(world);
  const tpb = ticksPerBeat(world.cfg);
  if (world.tick % tpb === 0) onBeat(world);

  advanceBullets(world);
  // After the shots, before anything else asks who is holding what: a hand
  // stays on a creature until the creature stops existing.
  dropLostGrips(world);
  // The Warden's rescue is the one hold measured in ticks rather than beats,
  // because it accumulates: see `wardenPullBeats`.
  pullTether(world);
  advancePods(world);
  regenerateHull(world);
  progressWave(world);
}

function regenerateHull(world: World): void {
  // A fork is a wait with no end on it, so a hull that healed through one
  // would make standing at it the cheapest move in the game. Nothing mends
  // while the run belongs to the pair (`fork.ts`).
  if (world.over || forkOpen(world)) return;
  const perTick = Math.round((world.cfg.hullRegenPerSecond * MILLI) / world.cfg.tickHz);
  world.hullMilli = Math.min(100 * MILLI, world.hullMilli + perTick);
}

/**
 * The rest between waves is over — and mark it spent, so the question is not
 * asked again on every following tick while the host gets around to it.
 *
 * What happens next is `restEnded`'s and not this file's: either the host is
 * asked for the next queue, as it always was, or the run stops and waits for
 * both thumbs. See `fork.ts`.
 */
function progressWave(world: World): void {
  if (world.restBeat <= 0 || world.beat < world.restBeat) return;
  world.restBeat = -1;
  restEnded(world);
}

/** Hull integrity as a plain 0..100 number, for display only. */
export function hullPercent(world: World): number {
  return world.hullMilli / MILLI;
}
