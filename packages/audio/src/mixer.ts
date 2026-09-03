/**
 * The game's ear: what the host calls, once per frame.
 *
 * Two kinds of sound reach it. `world.events` says what *happened*, and
 * `bind.ts` turns each one into a cue. But several things the pair needs to
 * hear are not events at all — the cannon arriving in a column, the guard
 * window closing on nothing, the hull passing a quarter — so this file also
 * remembers a little of the previous frame's world and sounds the difference.
 *
 * That remembered state is the one dangerous thing here. `world.tick` and
 * `world.beat` are **not monotonic** (see CLAUDE.md): a restart builds a fresh
 * `World` and both start again at zero. Anything cached against them has to be
 * cleared when that happens, or the first frame of a new run is heard as the
 * middle of the last one. `reset()` is that clearing and `sawRestart` is how it
 * is noticed — the same arrangement `Effects.reset()` makes in render/.
 */

import { guardArmed, hullRow, mawOpen, type SimEvent, type World } from "@neon-spore/sim";
import { cueFor, panForCol } from "./bind.js";
import { sound } from "./catalogue.js";
import { Engine } from "./engine.js";
import { blankMemory } from "./memory.js";

/** The hull is in trouble below a quarter of it, in thousandths. */
const QUARTER = 25_000;

export interface MixerOptions {
  volume?: number;
  /** Off by default: the click track is the one sound that never stops. */
  clickTrack?: boolean;
}

export class Mixer {
  readonly engine: Engine;
  private mem = blankMemory();
  private clickTrack: boolean;
  /** Identical cues inside one frame, so twenty deaths on a beat are not twenty voices. */
  private thisFrame = new Map<string, number>();
  /**
   * Which seat this device is, or null while nobody has said. Only `Cue.seat`
   * reads it, and only THE LURE's alarm sets that — see `bind.ts`. Null means
   * *silent* rather than *both*: a device that has not been told which seat it
   * is must not be the one that gives the disguise away.
   */
  private seat: 1 | 2 | null = null;

  constructor(opts: MixerOptions = {}) {
    this.engine = new Engine({ volume: opts.volume });
    this.clickTrack = opts.clickTrack ?? true;
  }

  /** A finger has landed; audio may start. Safe to call on every touch. */
  unlock(): void {
    this.engine.unlock();
  }

  setMuted(muted: boolean): void {
    this.engine.setMuted(muted);
  }

  get muted(): boolean {
    return this.engine.isMuted;
  }

  setVolume(v: number): void {
    this.engine.setVolume(v);
  }

  setClickTrack(on: boolean): void {
    this.clickTrack = on;
  }

  /**
   * Which seat this device is playing. Not part of `reset()`: it is a fact
   * about the phone rather than about the run, and a restart does not move
   * anybody to the other chair.
   */
  setSeat(seat: 1 | 2 | null): void {
    this.seat = seat;
  }

  /** Everything remembered about the previous frame, dropped. */
  reset(): void {
    this.mem = blankMemory();
  }

  /**
   * The whole frame, in one call: what happened, and what merely changed.
   * Events are the host's collected `world.events`, since a frame covers
   * several ticks and the world clears them every tick.
   */
  frame(world: World, events: readonly SimEvent[]): void {
    if (world.tick < this.mem.tick) this.reset();
    this.thisFrame.clear();
    const cols = world.cfg.cols;
    const rows = hullRow(world.cfg);

    for (const e of events) {
      const cue = cueFor(e, cols, rows);
      if (!cue) continue;
      // A cue that belongs to one seat, on the other seat's device or on one
      // that has not said which it is. Silence rather than sound: see `seat`.
      if (cue.seat !== undefined && cue.seat !== this.seat) continue;
      if (!this.clickTrack && (cue.id === "beat.tick" || cue.id === "beat.accent")) continue;
      this.play(cue.id, cue.pan, cue.pitch, cue.gain);
    }

    this.sounddifferences(world, cols);
    this.mem.tick = world.tick;
  }

  /** Everything the sim does not report because it is state and not an event. */
  private sounddifferences(world: World, cols: number): void {
    const m = this.mem;
    const first = m.tick < 0;

    if (!first && world.cannonCol !== m.cannonCol) {
      this.play("ship.cannonStep", panForCol(world.cannonCol, cols));
    }
    if (!first && world.shieldCol !== m.shieldCol) {
      this.play("ship.shieldStep", panForCol(world.shieldCol, cols));
    }
    m.cannonCol = world.cannonCol;
    m.shieldCol = world.shieldCol;

    // The guard and the maw are windows, and both ends of a window are worth
    // hearing: one player opened it, and the other has to know it shut. The
    // sim owns where those ends are — a second copy here sounded the shut one
    // tick early and never heard a ward arm the shield at all.
    const armed = guardArmed(world);
    if (armed && !m.guardArmed) this.play("ship.guard", panForCol(world.shieldCol, cols));
    if (!armed && m.guardArmed && !first) this.play("ship.guardLapse");
    m.guardArmed = armed;

    const open = mawOpen(world);
    if (open && !m.intakeOpen) this.play("ship.intake", panForCol(world.shieldCol, cols));
    if (!open && m.intakeOpen && !first) this.play("ship.intakeShut");
    m.intakeOpen = open;

    // A grip landing is an event; a grip *ending* is not, and the player whose
    // hand it was is the one who needs to hear it go.
    if (!first && m.gripP1 > 0 && world.gripP1 !== m.gripP1) this.play("ship.gripSlip", -0.4);
    if (!first && m.gripP2 > 0 && world.gripP2 !== m.gripP2) this.play("ship.gripSlip", 0.4);
    m.gripP1 = world.gripP1;
    m.gripP2 = world.gripP2;

    const gripping = world.gripP1 > 0 || world.gripP2 > 0;
    if (gripping && world.beat !== m.strainBeat) {
      this.play("ship.gripStrain");
      m.strainBeat = world.beat;
    }

    // The hull's own two sounds: a mend nobody asked for an event about, and
    // an alarm that repeats on the beat until it is dealt with.
    if (!first && world.hullMilli > m.hullMilli + 500) this.play("hull.mend");
    m.hullMilli = world.hullMilli;
    if (
      world.hullMilli > 0 &&
      world.hullMilli < QUARTER &&
      world.beat !== m.alarmBeat &&
      world.beat % 4 === 0
    ) {
      this.play("hull.alarm");
      m.alarmBeat = world.beat;
    }

    if (world.over && !m.over) this.play("hull.dead");
    m.over = world.over;

    this.soundBoss(world, cols, first);
    this.soundWave(world, first);
  }

  /** Whichever boss is installed, and the two things each of them does on a clock. */
  private soundBoss(world: World, cols: number, first: boolean): void {
    const m = this.mem;
    const boss = world.boss;
    const kind = boss?.kind ?? "";
    if (kind !== m.bossKind) {
      if (kind === "queen") this.play("boss.arrive");
      if (kind === "mirror") this.play("mirror.arrive");
      m.bossKind = kind;
      m.bossCol = -1;
      m.queenOpen = false;
      m.mirrorPhase = "";
    }

    if (boss?.kind === "queen") {
      const queen = world.creatures.find((c) => c.id === boss.creatureId);
      if (queen && queen.col !== m.bossCol) {
        if (!first && m.bossCol >= 0) this.play("boss.queenStep", panForCol(queen.col, cols));
        m.bossCol = queen.col;
      }
      // Her armour is the whole fight: the two beats it is open are the only
      // two the pair can spend, and both edges of them are worth hearing.
      const open = boss.openBeat >= 0 && world.beat >= boss.openBeat && world.beat < boss.closeBeat;
      if (open && !m.queenOpen) this.play("boss.queenOpen", panForCol(queen?.col ?? 0, cols));
      if (!open && m.queenOpen) this.play("boss.queenShut", panForCol(queen?.col ?? 0, cols));
      m.queenOpen = open;
    }

    if (boss?.kind === "mirror" && boss.phase !== m.mirrorPhase) {
      // `lead` is the count-in: the beats it spends before performing.
      if (boss.phase === "lead") this.play("mirror.countIn");
      m.mirrorPhase = boss.phase;
    }

    // A torch is the one arrival too fast to be talked about, so it announces
    // itself twice: the alarm, and the weight of the thing falling.
    const torches = world.creatures.filter((c) => c.kind === "torch").length;
    if (!first && torches > m.torches) {
      const torch = world.creatures.find((c) => c.kind === "torch");
      this.play("boss.torchWarn");
      this.play("boss.torchDrop", panForCol(torch?.col ?? 0, cols));
    }
    m.torches = torches;
  }

  /** The wave running out, which the simulation reports by asking for the next one. */
  private soundWave(world: World, first: boolean): void {
    const m = this.mem;
    const left = world.creatures.length;
    const spawnedAll = world.spawned >= world.queue.length;
    if (!first && spawnedAll && left === 0 && m.creatures > 0 && !world.over) {
      this.play("ui.waveClear");
    }
    m.creatures = left;
  }

  /** One sound, with the duplicate guard applied. */
  play(id: string, pan?: number, pitch?: number, gain = 1): void {
    const seen = this.thisFrame.get(id) ?? 0;
    // The fourth identical sound in one frame adds nothing but headroom loss.
    if (seen >= 3) return;
    this.thisFrame.set(id, seen + 1);
    this.engine.play(sound(id), { pan, pitch, gain: gain * 0.7 ** seen });
  }

  dispose(): void {
    this.engine.dispose();
  }
}
