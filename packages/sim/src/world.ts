import { emptyRunStats, type RunStats } from "./balance.js";
import type { BossState } from "./boss-state.js";
import { type Briefings, newBriefings } from "./briefing.js";
import { midCol, type SimConfig, ticksPerBeat } from "./config.js";
import { NO_GRIP } from "./grip.js";
import type { GripPush } from "./grip-push.js";
import type { Prime } from "./lance.js";
import type { Malfunction } from "./malfunction.js";
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
  /**
   * The tick the shield arrived in the column it is standing in — how long it
   * has been *still*, rather than where it is.
   *
   * One reader today and it is a picture: the current a fence throws at the
   * dome goes out once the dome has stood in one of its gaps long enough to
   * have settled there (`fenceSettleTicks`, fence.ts). That is a fact about
   * the world rather than about a canvas — both devices have to agree when the
   * arc stops, and a renderer timing it off its own frame clock would be two
   * different answers to one question.
   *
   * Set only when the column actually changes, so a seat holding the control
   * against a wall is not restarting the clock every tick.
   */
  shieldSinceTick: number;
  /** Tick of the most recent shield trigger by player 1. */
  guardTick: number;
  /** Tick of the most recent maw opening by player 1. */
  intakeTick: number;
  /**
   * THE CLAW's arm, which is what player 1's swelling is on the `claw` panel:
   * `0` at rest on the hull, `1` reaching up its column, `-1` coming back
   * (`reach.ts`). Four fields rather than one struct because they are ship
   * state like `cannonCol` beside them — the arm is not a boss and not a
   * round, it is the gun replaced by a hand.
   */
  reachDir: -1 | 0 | 1;
  /** The column it went up, held while it is out so that sliding the strip
   * under a travelling arm cannot bend it. */
  reachCol: number;
  /** How far up from the hull the tip has got, in thousandths of a tile. */
  reachMilli: number;
  /** The id of the pod it closed on, or 0. It is an id rather than the pod
   * itself for `FleetState.sunkBeat`'s reason: the list is the truth and a
   * second reference to a member of it is a second truth. */
  reachHeld: number;
  /**
   * THE CHOIR's half-made gesture: which of the two arrows the pilot has
   * carried outward, `2` for a phone shaken once, `0` while nothing has been
   * done (`NO_CHOIR_ARM`, `CHOIR_SHAKEN`). It is ship state beside `guardTick`
   * rather than a field of any one body, because a hand belongs to a seat and
   * a wave may put two membranes on the field at once (`choir-gesture.ts`).
   */
  choirArm: -1 | 0 | 1 | 2;
  /** The tick that arm's window shuts on. Past it with only one arrow out,
   * the thing sings and the hull pays (`stepChoirWindow`). */
  choirArmTick: number;
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
   * The hand each player is carrying a body sideways with, or null while they
   * are only holding one still. Read them through `gripPushOf` (grip-push.ts)
   * rather than by name, for the reason the two above are read through
   * `gripsCreature`: which field is whose is that file's business.
   *
   * They are beside the grips rather than on the body being carried because a
   * carry belongs to a *hand* — two hands may be on one rock, each of them a
   * different distance from where it grabbed — while the beat a body was last
   * carried on belongs to the body and is `Creature.pushBeat`.
   */
  pushP1: GripPush | null;
  pushP2: GripPush | null;
  /**
   * Player 2's thumb resting on a colour, filling the cannon lobe, or null.
   * Read it through `lance.ts` rather than by name — how full the lobe is,
   * which colour is in it and whether it has already gone are that file's
   * business, and render/, the band and the shot itself all ask the same
   * question from three places.
   *
   * There is no `primeCol` beside it, deliberately: a cannon that moves resets
   * the fill, so while this is filling the column *is* `cannonCol`, and a
   * second copy of it could only ever disagree.
   */
  prime: Prime | null;
  /**
   * The shot player 2 has pressed that has not left the muzzle yet, or null.
   * World state for the reason a bullet in flight is: two devices that
   * disagree about whether a shot exists have desynced. Ask `shot-charge.ts`.
   */
  charge: ShotCharge | null;
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
    shieldSinceTick: 0,
    guardTick: -1_000_000,
    intakeTick: -1_000_000,
    reachDir: 0,
    reachCol: mid,
    reachMilli: 0,
    reachHeld: 0,
    choirArm: 0,
    choirArmTick: 0,
    wardUntilTick: -1_000_000,
    lastFireTick: -1_000_000,
    gripP1: NO_GRIP,
    gripP2: NO_GRIP,
    pushP1: null,
    pushP2: null,
    prime: null,
    charge: null,
    malfunction: null,
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
