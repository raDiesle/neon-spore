import { clampQueenCol, initialDropSide } from "./boss.js";
import { openBriefings } from "./briefing.js";
import type { WardenEntry } from "./entries.js";
import { closeFork } from "./fork.js";
import { clearGrips } from "./grip.js";
import { clearInterlude } from "./interlude.js";
import { endPrime } from "./lance.js";
import { installMirror } from "./mirror.js";
import { WARDEN_COLS } from "./types.js";
import { installVane } from "./vane.js";
import { NO_TETHER } from "./warden-cycle.js";
import type { BossEntry, PodEntry, SpawnEntry, World } from "./world.js";

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
  // Nothing held and nothing charged — the second a field now (`shot-charge.ts`).
  endPrime(world);
  world.charge = null;
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
