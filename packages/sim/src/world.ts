import { emptyRunStats, type RunStats } from "./balance.js";
import type { BossState } from "./boss-union.js";
import { type Briefings, newBriefings } from "./briefing.js";
import { type SimConfig, ticksPerBeat } from "./config.js";
import { createRng, type Rng } from "./rng.js";
import { NO_SLOW } from "./slow.js";
import { newSpendLedger, type SpendLedger } from "./spend.js";
import { startWave } from "./wave-start.js";
import { type FaultState, newFaultState } from "./world-faults.js";
import { newShipState, type ShipState } from "./world-ship.js";

export type { BossEntry, MazeEntry, MirrorEntry, QueenEntry } from "./boss-entries.js";
export type { PodEntry, SpawnEntry } from "./entries.js";
export type { SimEvent } from "./events.js";
export type { FaultState, LitTile } from "./world-faults.js";
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
 * The faults and what they leave behind are `FaultState` in `world-faults.ts`,
 * the same way. What is left here is the field, the wave and the run.
 */
export interface World extends ShipState, FaultState {
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
   * Whether **holding** a colour fills the cannon lobe on this wave's panel.
   *
   * The panel's fact, not the wave's, and the sim is told it the way it is
   * told the fault: once, before the first tick, identically on both devices
   * (`startWave`). The rungs of the standard ladder hold the gesture back —
   * STANDARD 5 is the full panel that still does — and STANDARD itself has it
   * (`content/src/control-sets.ts`).
   *
   * Read through `lanceLeaks` rather than by name: the fill, the ring the
   * panel draws from it and the shaft in the column are all one question.
   */
  hasLance: boolean;

  /**
   * **The beats THE SLOW is holding**, `[slowFromBeat, slowToBeat)`, and
   * `NO_SLOW` on both while nothing is slowed.
   *
   * Two integers in the simulation for a thing the simulation does not do:
   * what they decide is how many milliseconds of wall clock a tick is worth in
   * `apps/game/src/loop.ts`, and nothing below that reads a clock at all. They
   * are here, and hashed, because that is the entire safety argument — the
   * owner's condition was that a slow window *start and end at the same time
   * for both players*, and a boundary both devices already agree about is the
   * only way to promise it (`slow.ts`, `docs/decisions.md` #33).
   *
   * Read through `slowing` and `slowRateMilli` rather than by name: whether a
   * beat is inside the window and how fast it is being played are one
   * question, and a caller that compared the two itself would be the second
   * copy of a half-open range.
   */
  slowFromBeat: number;
  slowToBeat: number;
  /** Whether the window up asks the pair for something (`slow.ts` `SlowKind`). */
  slowAsks: boolean;

  /**
   * **What the pair has spent, per colour, beat by beat** — the only thing in
   * the world that remembers the two *players* rather than itself.
   *
   * Read through `spentOver` and `spendLean` rather than by index: the ring is
   * keyed by the beat and a window is a question about `world.beat`, never a
   * position anything steps. Written only where a colour leaves the muzzle,
   * cleared by `startWave`, and hashed whole — two devices that disagreed
   * about it would disagree about the colour THE TASTER's next blade grows in
   * (`spend.ts`).
   */
  spend: SpendLedger;

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
  /**
   * The tick the field froze on, `NOT_FAILED` while nothing holds it.
   *
   * `failTick` cannot answer this: it is the same number for the length of the
   * pause and then becomes a sentinel, and the field is still held after that
   * — through the lost screen and the wait for the host. What reads it is
   * `framePhase`, so that a body struck halfway through its glide is drawn
   * where it was struck rather than finishing the step (`wave-fail.ts`).
   */
  heldTick: number;
  /** How many times a wave has been gone again, over the whole run. */
  retries: number;
  /** Ticks the pair has spent with a wave live, over the whole run. */
  playTicks: number;
  /** Which try at the current wave this is: 1 on a clean open, one more for
   * every retry (`wave-start.ts`). The intro says `TRY n` from 2. */
  waveTries: number;
  /** Every try at every wave over the whole run: one for each opening, a first
   * try and a retry alike (`wave-start.ts`). The lost screen prints it beside
   * the wave's name (`render/lost-words.ts`). */
  runTries: number;

  over: boolean;

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
    ...newFaultState(),
    hasLance: true,
    slowFromBeat: NO_SLOW,
    slowToBeat: NO_SLOW,
    slowAsks: false,
    spend: newSpendLedger(),
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
    heldTick: NOT_FAILED,
    retries: 0,
    playTicks: 0,
    waveTries: 0,
    runTries: 0,
    over: false,
    events: [],
  };
  if (queue || podQueue) startWave(world, 0, queue ?? [], podQueue);
  return world;
}
