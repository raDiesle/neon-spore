import type { BossEntry } from "../src/boss-entries.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { BOSS_KINDS } from "../src/entries.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";
import { BOSS_ENTRIES_A, patchBossA } from "./hash-fixture-bosses-a.js";
import { BOSS_ENTRIES_B, patchBossB } from "./hash-fixture-bosses-b.js";
import { BOSS_ENTRIES_C, patchBossC } from "./hash-fixture-bosses-c.js";
import { BOSS_ENTRIES_D, patchBossD } from "./hash-fixture-bosses-d.js";
import { beam, bullet, charge, creature, pod, prime, scar } from "./hash-fixture-fields.js";

/**
 * A world with **something in every field**, for `hash-coverage.test.ts` to
 * walk.
 *
 * Every field it fills is at a deliberately odd value rather than a default:
 * the walk mutates a leaf and asks whether the fingerprint noticed, and a
 * field that was already at the value the mutation picks would answer no for
 * the wrong reason. The fixtures of the world's own lists, and the `Required`
 * typing that is the gate on them, are next door in `hash-fixture-fields.ts`.
 *
 * The bosses are four pages beside it (`hash-fixture-bosses-{a,b,c,d}.ts`),
 * each holding the entries and the patches of its stretch of `BOSS_KINDS`;
 * this file composes them, and the `Record` below is what says every kind
 * has an entry on one of them. The file stood at 766 lines before the cut,
 * 18 September 2026, and every boss added a branch to it.
 */

/** What each boss is authored with, so `startWave` installs a real one. */
export const BOSS_ENTRIES: Record<BossEntry["kind"], BossEntry> = {
  ...BOSS_ENTRIES_A,
  ...BOSS_ENTRIES_B,
  ...BOSS_ENTRIES_C,
  ...BOSS_ENTRIES_D,
};

/** Every boss kind, so the walk covers each arm of `bossHashParts`. */
export const FIXTURE_BOSSES = BOSS_KINDS;

/**
 * A world carrying one of everything, with the named boss installed.
 *
 * The boss is patched after `startWave` rather than driven to a state by
 * playing: what is being tested is that a *field* reaches the fingerprint, and
 * a test that pressed buttons to get there would be testing the rules instead.
 */
export function populatedWorld(bossKind: BossEntry["kind"]): World {
  const world = createWorld(DEFAULT_CONFIG, 1);
  startWave(world, 2, [], [], BOSS_ENTRIES[bossKind], true);

  world.tick = 41;
  world.beat = 7;
  world.nextId = 23;
  world.cannonCol = 2;
  world.shieldCol = 5;
  world.guardTick = 30;
  world.intakeTick = 28;
  world.wardUntilTick = 33;
  world.lastFireTick = 26;
  world.gripP1 = 7;
  world.gripP2 = 3;
  world.pushP1 = { milli: 1400, cols: 1 };
  world.pushP2 = { milli: -2300, cols: -2 };
  world.prime = prime();
  world.charge = charge();
  world.beam = beam();
  // A cannon fault rather than a shield one, because it is the arm that
  // carries a second field: the walk can only mutate what is there, so the
  // union's larger member is the one that covers both. Placed on rows, and on
  // rows that are not zero, so a fixture that stopped hashing either of them
  // would be caught (`sim/fault-placed.ts`).
  world.faults = [{ kind: "cannon", color: "alternating", at: 2, beats: 6 }];
  // A lit square of THE DARK, with every number off zero (`sim/dark.ts`).
  world.lit = [{ col: 3, row: 5, untilTick: 900 }];
  // First, not last: a boss that stands on the field has already put its own
  // body in this list, and the walk only ever mutates element zero. Behind a
  // queen, the fixture's creature — the one carrying every optional field —
  // would never be the one looked at, and half the fields here would be
  // covered by a test that reported them covered.
  world.creatures.unshift(creature());
  world.bullets.push(bullet());
  world.pods.push(pod());
  world.scars.push(scar());
  world.guard = { tries: 4, deflected: 3, mistimed: 1 };
  world.balance = {
    podsFreed: 2,
    podsTaken: 1,
    podsLost: 1,
    colorHits: 9,
    colorMisses: 4,
    streak: 3,
    bestStreak: 5,
    wavesCleared: 2,
    husksRefused: 3,
    husksSwallowed: 1,
  };
  world.brief = {
    phase: 1,
    guide: true,
    ack: 2,
    steps: 5,
    stepP1: 2,
    stepP2: 4,
    fillP1: 5,
    fillP2: 3,
    holdP1: true,
    holdP2: false,
  };
  world.waveBeat = 6;
  world.spawned = 1;
  world.podSpawned = 1;
  world.restBeat = 12;
  world.failTick = 39;
  world.retries = 2;
  world.playTicks = 3_100;
  world.over = true;
  world.rng.state = 123_456;

  patchBoss(world);
  return world;
}

/**
 * Move every boss off the state `startWave` installs it in, so no field is
 * sitting at the value a mutation would pick. The lists a boss keeps are given
 * an entry apiece for the same reason: an empty array cannot prove its own
 * length is in the fingerprint. Each page patches its own bosses and leaves
 * the others alone, so all three are asked.
 */
function patchBoss(world: World): void {
  const boss = world.boss;
  if (boss === null) return;
  patchBossA(boss, scar);
  patchBossB(boss);
  patchBossC(boss);
  patchBossD(boss);
}
