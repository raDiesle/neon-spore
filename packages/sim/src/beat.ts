import { hullRow } from "./config.js";
import type { Creature } from "./types.js";
import { MILLI, type SpawnEntry, type World } from "./world.js";

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

  // Creatures glide exactly one tile per beat and are only ever on tile centres.
  for (const c of world.creatures) {
    c.fromRow = c.row;
    c.row += 1;
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
      col: entry.col,
      row: 0,
      fromRow: -1,
      color: entry.color,
      holes: 0,
    });
    world.spawned += 1;
  }

  // Hull resolution. Creatures that have reached it are removed and cause damage.
  resolveHull(world);

  // Wave progression: if all enemies are gone and all were spawned, the wave is
  // done. Wait `waveRestBeats` before the next one starts automatically.
  const cleared = world.spawned >= world.queue.length && world.creatures.length === 0;
  if (cleared) {
    if (world.restBeat === 0) {
      world.score += world.cfg.scoreWave;
      world.restBeat = world.beat + world.cfg.waveRestBeats;
    }
  }
}

/**
 * Check for impacts at the hull. Creatures that reach the hull row either
 * damage it (normal creatures and undeflected meteors) or are deflected
 * (meteors when the shield is in column and player 1 triggered it in time).
 *
 * Guard tries always increments for a meteor. Deflected, mistimed count the
 * two failure states that matter for learning (docs/spec/systems.md 5.8).
 */
function resolveHull(world: World): void {
  const survivors: Creature[] = [];
  const shipRow = hullRow(world.cfg);

  for (const c of world.creatures) {
    if (c.row < shipRow) {
      survivors.push(c);
      continue;
    }

    if (c.kind === "meteor") {
      const inColumn = world.shieldCol === c.col;
      const windowTicks = Math.round((world.cfg.guardWindowMs / 1000) * world.cfg.tickHz);
      const inTime = world.tick - world.guardTick <= windowTicks && world.guardTick <= world.tick;
      world.guard.tries += 1;

      if (inColumn && inTime) {
        world.guard.deflected += 1;
        world.score += world.cfg.scoreDeflect;
        world.events.push({ type: "deflect", col: c.col });
        continue;
      }
      if (inColumn) world.guard.mistimed += 1;
      damage(world, c.col, world.cfg.damageMeteor);
    } else {
      damage(world, c.col, world.cfg.damageCreature);
    }
  }
  world.creatures = survivors;
}

function damage(world: World, col: number, amount: number): void {
  if (!world.cfg.hullInvulnerable) {
    world.hullMilli = Math.max(0, world.hullMilli - amount * MILLI);
    if (world.hullMilli <= 0) world.over = true;
  }
  world.scars.push({ col, beat: world.beat });
  if (world.scars.length > world.cfg.maxScars) world.scars.shift();
  world.events.push({ type: "breach", col, damage: amount });
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
export function startWave(world: World, waveIndex: number, queue: SpawnEntry[]): void {
  const mid = Math.floor(world.cfg.cols / 2);
  world.wave = waveIndex;
  world.waveBeat = 0;
  world.spawned = 0;
  world.restBeat = 0;
  world.queue = queue;
  world.creatures = [];
  world.bullets = [];
  world.guardTick = -1_000_000;
  world.lastFireTick = -1_000_000;
  world.cannonCol = mid;
  world.shieldCol = mid;
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
}
