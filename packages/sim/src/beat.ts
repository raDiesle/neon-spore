import { stepBoss } from "./boss.js";
import { lureIsSpent, throbIsOpen } from "./creature-rules.js";
import { grippedFallTiles } from "./grip.js";
import { resolveHull } from "./hull.js";
import { spawnPods } from "./pods.js";
import { shellOnSpawn } from "./shell.js";
import { clampSpanCol, fallTilesPerBeat, isBossBody } from "./types.js";
import type { World } from "./world.js";

// `startWave` (and its private `installWarden`) is the shape of a wave
// beginning, not of a beat — it lives in wave-start.ts. Re-exported here so
// nothing that already reaches for it through beat.ts has to move.
export { startWave } from "./wave-start.js";

/**
 * Everything that happens on a beat. Creatures glide smoothly but land on tile
 * centres each beat, all at once, so a creature's `row` is exact. The shell
 * has no intermediate state — collision happens the moment a tile-change brings
 * someone to the hull row (docs/spec/systems.md 5.8).
 */
/**
 * The metronome on its own: the shared clock ticking over, and nothing about a
 * field. Separate because THE GAUGE is a round with no field in it and the
 * beat still runs through one — the ear would notice ninety seconds of silence
 * and the round's own drift is counted in beats. Call it rather than writing
 * the two lines again.
 */
export function beatMetronome(world: World): void {
  world.beat += 1;
  world.events.push({ type: "beat", beat: world.beat });
}

export function onBeat(world: World): void {
  beatMetronome(world);
  world.waveBeat += 1;

  // A lure goes on the beat it would step off the row `lureVanishRows` above
  // the hull — asked *before* the fall, so the beat it spent gliding into that
  // row was in plain sight of both players and nothing about it read as
  // different until it was not there. Collected rather than filtered in place:
  // the loop below is still walking `world.creatures`.
  const spent = world.creatures.filter((c) => lureIsSpent(world.cfg, c));
  if (spent.length > 0) {
    for (const c of spent) {
      world.events.push({
        type: "lureVanished",
        col: c.col,
        row: c.row,
        // Not null: `resolveLure` is the only branch a lure can take with a
        // shot in it, so a lure always carries the disguise's own colour, and
        // that is the colour the picture that fades has to be drawn in.
        color: c.color ?? "cyan",
      });
    }
    const gone = new Set(spent.map((c) => c.id));
    world.creatures = world.creatures.filter((c) => !gone.has(c.id));
  }

  // Creatures land on tile centres each beat, all at once — most move one
  // tile, a rock may move several, but never a fraction of one.
  for (const c of world.creatures) {
    // A boss body holds its row: the queen until petals make her descend, the
    // Warden for good. `isBossBody` is the one place both are named.
    if (isBossBody(c.kind)) continue;
    c.fromRow = c.row;
    // Not `fallTilesPerBeat` directly: a hand held on this creature slows it,
    // and `grippedFallTiles` is where that is decided (grip.ts).
    c.row += grippedFallTiles(world, c);
    // Decided once a beat, from the beat this creature now stands on, and
    // stored — bullet-hit.ts and render/ both read it off the creature rather
    // than asking `throbIsOpen` a second time at a possibly different tick.
    if (c.kind === "throb") c.throbOpen = throbIsOpen(world.cfg, world.beat);
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
    const col = clampSpanCol(entry.col, world.cfg.cols, entry.kind);
    // Said once, at the top of the field, so player 2's ear has the column
    // before the eye has found the ring. A hit should always be player 2's
    // haste and never player 2's surprise.
    if (entry.kind === "lure") world.events.push({ type: "lureSeen", col });
    world.creatures.push({
      id: world.nextId++,
      kind: entry.kind,
      col,
      row: 0,
      // Glide onto the field at the kind's own speed, not a flat one tile —
      // a torch (`fallTilesPerBeat` far above 1) that crept in for its first
      // beat and only then jumped to full speed read as a stutter, not a fall.
      fromRow: -fallTilesPerBeat(entry.kind),
      color: entry.color,
      // Authored by the wave, and the same value on both devices. Which of the
      // two screens lays an alarm over the body it names is render's question
      // and never the simulation's (`Creature.wears`).
      ...(entry.wears ? { wears: entry.wears } : {}),
      holes: 0,
      petals: 0,
      dragMilli: 0,
      throbOpen: entry.kind === "throb" && throbIsOpen(world.cfg, world.beat),
      // Every piece on, for the one kind that wears any. The colour under
      // them is deliberately *not* settled here: a shelled body arrives with
      // `color` null and gets one only when the last piece comes off, so
      // there is no instant at which anything — render included — could have
      // shown the pair something they were not meant to know yet.
      shell: shellOnSpawn(entry.kind),
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
  // A boss still standing holds the wave open even when the field is empty.
  // The queen is a creature and counted herself; THE MIRROR is not on the
  // field at all, so without this its wave would clear on its first beat.
  const cleared =
    world.spawned >= world.queue.length && world.creatures.length === 0 && world.boss === null;
  if (cleared) {
    if (world.restBeat === 0) {
      world.balance.wavesCleared += 1;
      world.score += world.cfg.scoreWave;
      world.restBeat = world.beat + world.cfg.waveRestBeats;
    }
  }
}
