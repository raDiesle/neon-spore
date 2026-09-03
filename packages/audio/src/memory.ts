/**
 * The single frame of world the mixer remembers.
 *
 * It is one struct in one file so that the dangerous thing about it is visible
 * in one place: `world.tick` and `world.beat` are **not monotonic** (CLAUDE.md),
 * so every field here is read by the next run as its own unless it is cleared.
 * `blankMemory()` is that clearing, and adding a field without a line in it is
 * how a crack comes to show before the rock that made it.
 */

export interface Memory {
  tick: number;
  cannonCol: number;
  shieldCol: number;
  guardTick: number;
  intakeTick: number;
  gripP1: number;
  gripP2: number;
  hullMilli: number;
  bossCol: number;
  /** "" while no boss is installed — the two are told apart by kind. */
  bossKind: string;
  /** THE MIRROR's phase, so entering one can be sounded. */
  mirrorPhase: string;
  /** Whether the queen was open on the previous frame. */
  queenOpen: boolean;
  /** How many torches were on the field. A new one is an alarm. */
  torches: number;
  /** Creatures on the field, so a wave running out can be heard. */
  creatures: number;
  /** The beat `hull.alarm` last sounded on, so it repeats without stacking. */
  alarmBeat: number;
  /** The beat `ship.gripStrain` last sounded on. */
  strainBeat: number;
  guardArmed: boolean;
  intakeOpen: boolean;
  over: boolean;
}

export function blankMemory(): Memory {
  return {
    tick: -1,
    cannonCol: -1,
    shieldCol: -1,
    guardTick: -1_000_000,
    intakeTick: -1_000_000,
    gripP1: -1,
    gripP2: -1,
    hullMilli: -1,
    bossCol: -1,
    bossKind: "",
    mirrorPhase: "",
    queenOpen: false,
    torches: 0,
    creatures: 0,
    alarmBeat: -1,
    strainBeat: -1,
    guardArmed: false,
    intakeOpen: false,
    over: false,
  };
}
