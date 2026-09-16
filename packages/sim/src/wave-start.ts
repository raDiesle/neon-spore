import { clampQueenCol, initialDropSide } from "./boss.js";
import { openWave } from "./briefing.js";
import { installCairn } from "./cairn.js";
import { midCol } from "./config.js";
import { NO_CRANK } from "./crank.js";
import type { PlacedFault } from "./fault-placed.js";
import { installFleet } from "./fleet.js";
import { installGauge } from "./gauge-round.js";
import { clearGrips } from "./grip.js";
import { endPrime } from "./lance.js";
import { installMaze } from "./maze-state.js";
import { installMirror } from "./mirror.js";
import { installPinball } from "./pinball-round.js";
import { installPulse } from "./pulse-round.js";
import { installReprise } from "./reprise-state.js";
import { installScout } from "./scout-round.js";
import { NO_SHELL } from "./shell.js";
import { installSnake } from "./snake-round.js";
import { installSplice } from "./splice-round.js";
import { installStare } from "./stare-step.js";
import { installVane } from "./vane.js";
import { installWarden } from "./warden-start.js";
import { NOT_FAILED } from "./wave-fail.js";
import { installWell } from "./well.js";
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
 *
 * `hasGuide` is whether content wrote a `guide` on this wave. It is a boolean
 * and not the guide itself on purpose: the sim decides *whether* the field is
 * held and for how many states, and it never reads a word of what is on the
 * screen. A caller that leaves it out gets an introduction and then the wave.
 *
 * `faults` are the wave's malfunctions, each with the beat it enters on and
 * the number of beats it holds, and they arrive here beside the boss for the
 * reason the boss does: read once, before the first tick, identically on both
 * devices. A wave that places none is played straight, which is most of them.
 * It was one whole-wave fault until 15 September 2026 (`fault-placed.ts`).
 *
 * `hasLance` is the last of them and the only one that is the **panel's**:
 * whether holding a colour fills the cannon lobe at all. It is handed in for
 * the same reason — the sim may not read content, and the caller has the set
 * already (`content/src/control-sets.ts` `setLance`). Left out, the panel has
 * the gesture, which is STANDARD and every generated wave.
 */
export function startWave(
  world: World,
  waveIndex: number,
  queue: SpawnEntry[],
  podQueue: PodEntry[] = [],
  boss: BossEntry | null = null,
  hasGuide = false,
  guideSteps = 0,
  faults: PlacedFault[] = [],
  hasLance = true,
): void {
  const mid = midCol(world.cfg);
  world.wave = waveIndex;
  world.waveBeat = 0;
  world.spawned = 0;
  world.restBeat = 0;
  // Which try this is. A wave opened while a hit still holds the field is the
  // same wave gone again (`wave-fail.ts`), and that is the retry — counted
  // here, where it is taken, and not on the hit that asked for it; any other
  // opening — the next wave, a jump, a replay — is a first try. Read off
  // `failTick` rather than told, so two devices cannot be told differently.
  if (world.failTick === NOT_FAILED) {
    world.waveTries = 1;
  } else {
    world.waveTries += 1;
    world.retries += 1;
  }
  world.failTick = NOT_FAILED;
  world.queue = queue;
  world.podQueue = podQueue;
  world.podSpawned = 0;
  world.creatures = [];
  world.bullets = [];
  clearGrips(world);
  // Nothing held, nothing charged and no column still burning — all three are
  // fields now (`shot-charge.ts`, `lance.ts`).
  endPrime(world);
  world.charge = null;
  world.beam = null;
  world.pods = [];
  world.guardTick = -1_000_000;
  world.intakeTick = -1_000_000;
  world.wardUntilTick = -1_000_000;
  world.lastFireTick = -1_000_000;
  // The fault, and the brake the seat holding it starts with unspent. Both are
  // wave-local: a scar, a pause and a rest are all measured from a tick, and a
  // wave that inherited one would open with a window already half run.
  world.faults = faults;
  // And the panel's hold, read through `lanceLeaks` everywhere (`lance.ts`).
  world.hasLance = hasLance;
  // And nothing standing still yet: a count carried across a wave would open
  // the next one already half-way to a round lost (`harpoon.ts`).
  world.leechStillTicks = 0;
  world.limpetStillTicks = 0;
  world.leechHarpoonId = 0;
  world.limpetHarpoonId = 0;
  // The arm home and empty. A wave that inherited one halfway up a column
  // would open with a hand reaching for something the last wave had.
  world.reachDir = 0;
  // And nobody's hand on the crank: a bearing kept across a wave would wind
  // the first sample of the next one against a finger that has gone
  // (`crank.ts`).
  world.crankAtMilli = NO_CRANK;
  world.reachCol = mid;
  world.reachMilli = 0;
  world.reachHeld = 0;
  world.cannonCol = mid;
  world.shieldCol = mid;
  world.shieldSinceTick = world.tick;
  world.boss = null;

  if (boss?.kind === "gauge") {
    // No creature, no row and no field at all. THE GAUGE replaces the whole
    // picture for as long as it stands, and `step` returns before a rule of
    // the field runs — so there is nothing of it anywhere but its own screen.
    world.boss = installGauge(world);
  } else if (boss?.kind === "snake") {
    // The same nothing THE GAUGE leaves on the field, for the same reason: the
    // arena is the round's own and the ship is in it as the snake, so there is
    // no body here for the fall loop, the hull or a hand to find.
    world.boss = installSnake(world, boss.rounds);
  } else if (boss?.kind === "pinball") {
    // The same nothing again: the table is the round's own picture and the
    // ship is in it as the bucket, so no body of this boss is on the field for
    // the fall loop, the hull or a hand to find.
    world.boss = installPinball(world, boss.rounds);
  } else if (boss?.kind === "pulse") {
    // The same nothing a third time: four lanes of falling arrows are the
    // round's own picture and the ship is not in it at all, so there is no
    // body here for the fall loop, the hull or a hand to find.
    world.boss = installPulse(world, boss.stages);
  } else if (boss?.kind === "splice") {
    // A row of mouths and a tangle over them, and the field underneath is the
    // field: no creature, no row of its own for the fall loop to find, and
    // every control the ship has still answering. The straws are laid here,
    // from the seeded rng, so both devices draw the same ones (`splice.ts`).
    world.boss = installSplice(world, boss.rounds);
  } else if (boss?.kind === "mirror") {
    world.boss = installMirror(world, boss.rounds);
  } else if (boss?.kind === "maze") {
    // No creature and no row either. THE MAZE is three mouths in the sky and a
    // wheel behind them, so there is nothing of it for the fall loop or a
    // hand to find — the same shape THE VANE has, one branch down.
    world.boss = installMaze(world, boss.rounds);
  } else if (boss?.kind === "fleet") {
    // No creature and no row: a chart is not a body. Nothing of THE FLEET
    // falls, can be warded or can be taken hold of — the ships are squares on
    // a lattice over the field, and the only thing that ever reaches one is a
    // salvo (`fleet.ts`).
    world.boss = installFleet(world, boss);
  } else if (boss?.kind === "vane") {
    // No creature and no row. THE VANE hangs off the top edge rather than
    // standing on the grid, so there is nothing of it for the fall loop, the
    // hull or a hand to find (docs/spec/transfers-bosses.md).
    world.boss = installVane(world, boss);
  } else if (boss?.kind === "well") {
    // Less than any of them: no creature, no row, no state and no rule. THE
    // WELL is a projection — the field drawn inside out on one screen of the
    // two — so there is nothing of it anywhere but the picture, and the wave
    // under it runs exactly as its author wrote it (`well.ts`).
    world.boss = installWell(world);
  } else if (boss?.kind === "reprise") {
    // No creature and no row, THE VANE's shape exactly: the mechanism hangs at
    // the top middle and everything it ever puts on the field is a body the
    // wave's own author wrote, sent a second time with nothing drawn
    // (`reprise.ts`). Nothing of the boss itself falls, can be warded or can
    // be taken hold of.
    world.boss = installReprise(world.cfg, boss);
  } else if (boss?.kind === "cairn") {
    // A creature and a row, like the Warden and unlike the six above it: the
    // pile is a body standing on the grid, wide enough to have lanes of its
    // own, and a hand has to be able to find it (`cairn.ts`).
    world.boss = installCairn(world, boss);
  } else if (boss?.kind === "scout") {
    // The same nothing THE GAUGE and SNAKE leave on the field, for the same
    // reason: the arena is the round's own picture and the ship is in it as
    // the little one that was put out of it, so there is no body here for the
    // fall loop, the hull or a hand to find (`scout.ts`).
    world.boss = installScout(world, boss.arenas);
  } else if (boss?.kind === "stare") {
    // No creature and no row: the eye is in the sky and takes no damage, so
    // there is nothing of it for the fall loop, the hull or a hand to find.
    // The wave underneath is the wave its author wrote (`stare.ts`).
    world.boss = installStare(world);
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
      shell: NO_SHELL,
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

  // Last: the wave's name and sentence stand on the field, then its guide if
  // it has one, and the field holds still behind both of them.
  openWave(world, hasGuide, guideSteps);

  world.events.push({ type: "waveStart", wave: waveIndex });
}
