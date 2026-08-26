import { emptyRunStats } from "./balance.js";
import { clampQueenCol, initialDropSide, stepBoss } from "./boss.js";
import { resolveHull } from "./hull.js";
import { spawnPods } from "./pods.js";
import { clampSpanCol, fallTilesPerBeat } from "./types.js";
import { type BossEntry, MILLI, type PodEntry, type SpawnEntry, type World } from "./world.js";

/**
 * Everything that happens on a beat. Creatures glide smoothly but land on tile
 * centres each beat, all at once, so a creature's `row` is exact. The shell
 * has no intermediate state — collision happens the moment a tile-change brings
 * someone to the hull row (docs/spec/systems.md 5.8).
 */
export function onBeat(world: World): void {
  world.beat += 1;
  world.waveBeat += 1;
  world.events.push({ type: "beat", beat: world.beat });

  // Creatures land on tile centres each beat, all at once — most move one
  // tile, a rock may move several, but never a fraction of one.
  for (const c of world.creatures) {
    // The queen holds her row until she is made to descend — see `boss.ts`.
    if (c.kind === "queen") continue;
    c.fromRow = c.row;
    c.row += fallTilesPerBeat(c.kind);
  }

  // Spawn creatures from the queue. Wave entries are authored to beat 0..N,
  // and they enter at the top (row 0) and move normally from there.
  // "They appear when their beat has passed" means: if we're at beat 5, a
  // creature with beat 3 should already exist, so spawn at beat >= waveBeat - 1
  // (one beat *before* the current one, because creatures then move once and
  // stand on beat waveBeat).
  while (world.spawned < world.queue.length) {
    const entry = world.queue[world.spawned]!;
    if (entry.beat > world.waveBeat - 1) break;
    world.creatures.push({
      id: world.nextId++,
      kind: entry.kind,
      col: clampSpanCol(entry.col, world.cfg.cols, entry.kind),
      row: 0,
      // Glide onto the field at the kind's own speed, not a flat one tile —
      // a torch (`fallTilesPerBeat` far above 1) that crept in for its first
      // beat and only then jumped to full speed read as a stutter, not a fall.
      fromRow: -fallTilesPerBeat(entry.kind),
      color: entry.color,
      holes: 0,
      petals: 0,
    });
    world.spawned += 1;
  }
  // What she releases this beat has to be on the field before the hull is resolved.
  stepBoss(world);
  spawnPods(world);

  // Hull resolution. Creatures that have reached it are removed and cause damage.
  resolveHull(world);

  // Wave progression: if all enemies are gone and all were spawned, the wave is
  // done. Wait `waveRestBeats` before the next one starts automatically. Pods
  // are deliberately not counted — a power-up never blocks the end of a wave
  // (docs/spec/systems.md 5.7), so one left hanging is one left behind.
  const cleared = world.spawned >= world.queue.length && world.creatures.length === 0;
  if (cleared) {
    if (world.restBeat === 0) {
      world.balance.wavesCleared += 1;
      world.score += world.cfg.scoreWave;
      world.restBeat = world.beat + world.cfg.waveRestBeats;
    }
  }
}

/**
 * Begin playing a wave. The queue is built by the app from `content/` and
 * passed in, so the sim never needs to know about waves, act structure or
 * authored entries — it only knows a sequence of spawns. Direction stays
 * `content -> sim`.
 *
 * Only wave-local state is reset. Hull, scars, score and the guard balance
 * carry across waves, exactly as in the prototype: damage is permanent and the
 * balance is the record of the whole run.
 */
export function startWave(
  world: World,
  waveIndex: number,
  queue: SpawnEntry[],
  podQueue: PodEntry[] = [],
  boss: BossEntry | null = null,
): void {
  const mid = Math.floor(world.cfg.cols / 2);
  world.wave = waveIndex;
  world.waveBeat = 0;
  world.spawned = 0;
  world.restBeat = 0;
  world.queue = queue;
  world.podQueue = podQueue;
  world.podSpawned = 0;
  world.creatures = [];
  world.bullets = [];
  world.pods = [];
  world.guardTick = -1_000_000;
  world.intakeTick = -1_000_000;
  world.wardUntilTick = -1_000_000;
  world.lastFireTick = -1_000_000;
  world.cannonCol = mid;
  world.shieldCol = mid;
  world.boss = null;

  if (boss) {
    const id = world.nextId++;
    world.creatures.push({
      id,
      kind: "queen",
      // Wherever a wave put her, she stands where both her flank torches are
      // on the field — see `clampQueenCol`.
      col: clampQueenCol(world.cfg, boss.col),
      row: world.cfg.queenRow,
      fromRow: world.cfg.queenRow,
      color: null,
      holes: 0,
      petals: boss.petals,
    });
    world.boss = {
      creatureId: id,
      // -1 is not a real phase; it means "has not entered one yet", so the
      // first beat is read as a phase change and she can open on it.
      phase: -1,
      phaseBeat: 0,
      tellCol: -1,
      tellColor: null,
      openBeat: -1,
      closeBeat: -1,
      startPetals: boss.petals,
      dropSide: initialDropSide(world),
      releaseBeat: -1,
      releaseSide: 0,
      scratch: [],
    };
  }

  world.events.push({ type: "waveStart", wave: waveIndex });
}

/**
 * Wipe the run itself: hull, scars, score and balance. Used by a restart after
 * the hull is through, and by jumping to a wave in the test build.
 */
export function resetRun(world: World): void {
  world.hullMilli = 100 * MILLI;
  world.scars = [];
  world.score = 0;
  world.over = false;
  world.guard.tries = 0;
  world.guard.deflected = 0;
  world.guard.mistimed = 0;
  world.balance = emptyRunStats();
}

/**
 * End the run where it stands, without waiting for the hull to go. The game
 * never calls this — there the hull decides — but the director does, because
 * it plays with the hull held (`hullInvulnerable`) and the balance sheet is a
 * screen that has to be reachable to be judged.
 */
export function endRun(world: World): void {
  world.over = true;
}
