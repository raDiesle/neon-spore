import { clampQueenCol, initialDropSide, stepBoss } from "./boss.js";
import { openBriefings } from "./briefing.js";
import { throbIsOpen } from "./creature-rules.js";
import type { WardenEntry } from "./entries.js";
import { closeFork } from "./fork.js";
import { clearGrips, grippedFallTiles } from "./grip.js";
import { resolveHull } from "./hull.js";
import { clearInterlude } from "./interlude.js";
import { endPrime } from "./lance.js";
import { installMirror } from "./mirror.js";
import { spawnPods } from "./pods.js";
import { clampSpanCol, fallTilesPerBeat, isBossBody, WARDEN_COLS } from "./types.js";
import { installVane } from "./vane.js";
import { NO_TETHER } from "./warden-cycle.js";
import type { BossEntry, PodEntry, SpawnEntry, World } from "./world.js";

/**
 * Everything that happens on a beat. Creatures glide smoothly but land on tile
 * centres each beat, all at once, so a creature's `row` is exact. The shell
 * has no intermediate state — collision happens the moment a tile-change brings
 * someone to the hull row (docs/spec/systems.md 5.8).
 */
/**
 * The metronome on its own: the shared clock ticking over, and nothing about a
 * field. Separate because an interlude is a round with no field in it and the
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
      dragMilli: 0,
      throbOpen: entry.kind === "throb" && throbIsOpen(world.cfg, world.beat),
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
  clearGrips(world);
  // A wave that starts over starts with nothing held and nothing charged.
  endPrime(world);
  world.pods = [];
  world.guardTick = -1_000_000;
  world.intakeTick = -1_000_000;
  world.wardUntilTick = -1_000_000;
  world.lastFireTick = -1_000_000;
  world.cannonCol = mid;
  world.shieldCol = mid;
  world.boss = null;

  if (boss?.kind === "mirror") {
    world.boss = installMirror(world, boss.rounds);
  } else if (boss?.kind === "vane") {
    // No creature and no row. THE VANE hangs off the top edge rather than
    // standing on the grid, so there is nothing of it for the fall loop, the
    // hull or a hand to find (docs/spec/transfers-bosses.md).
    world.boss = installVane(world, boss);
  } else if (boss?.kind === "warden") {
    installWarden(world, boss);
  } else if (boss) {
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
      dragMilli: 0,
      throbOpen: false,
    });
    world.boss = {
      kind: "queen",
      creatureId: id,
      // -1 is not a real phase; it means "has not entered one yet", so the
      // first beat is read as a phase change and she can open on it.
      phase: -1,
      phaseBeat: 0,
      tellCol: -1,
      tellColor: null,
      // Both overwritten before either is ever read: `pickNextBloom` runs on
      // her very first beat, from `enterPhase`.
      weakSide: 1,
      pickBeat: 0,
      spentSide: 0,
      openBeat: -1,
      closeBeat: -1,
      startPetals: boss.petals,
      dropSide: initialDropSide(world),
      releaseBeat: -1,
      releaseSide: 0,
      scratch: [],
    };
  }

  // A wave that has started is not a wave waiting to start, so THE FORK closes
  // here and nowhere else can leave one open behind a running field (`fork.ts`).
  // It is also the order the two gates run in: the pair commits, and then the
  // card tells them what they committed to.
  closeFork(world);
  // And any interlude, for the same reason: a wave that has started is not a
  // round waiting in front of it. The record of which gap was played lives
  // only from the round's end to here, so it goes too (`interlude.ts`).
  clearInterlude(world);

  // Last, so it can read the boss that was just installed: whatever this wave
  // asks of the pair for the first time is a card it opens on, and the field
  // holds still behind it until both of them have put it away.
  openBriefings(world, queue, podQueue, boss);

  world.events.push({ type: "waveStart", wave: waveIndex });
}

/**
 * THE WARDEN takes the field where it stands and never leaves it: dead centre,
 * at `wardenRow`, five columns wide. There is no starting column to author —
 * a ring placed off centre is a ring with a short side — so the only thing a
 * wave says about it is how many plates it wears.
 *
 * The pupil starts in the middle of the body, which is also the column the two
 * controls start in: the first cycle's line comes down over the pupil, and the
 * pair's first move in the fight is to get out from under their own eye.
 */
function installWarden(world: World, entry: WardenEntry): void {
  const id = world.nextId++;
  const col = Math.floor((world.cfg.cols - WARDEN_COLS) / 2);
  world.creatures.push({
    id,
    kind: "warden",
    col,
    row: world.cfg.wardenRow,
    fromRow: world.cfg.wardenRow,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    throbOpen: false,
  });
  world.boss = {
    kind: "warden",
    creatureId: id,
    tetherId: NO_TETHER,
    pupilCol: col + Math.floor(WARDEN_COLS / 2),
    pupilDir: 1,
    plates: entry.plates ?? world.cfg.wardenPlates,
    tornBeat: -1,
    openBeat: -1,
    eyeSpent: false,
    pullTicks: 0,
  };
}
