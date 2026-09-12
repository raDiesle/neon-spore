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
  gripP1: number;
  gripP2: number;
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
  /** The beat `ship.gripStrain` last sounded on. */
  strainBeat: number;
  /** THE PULSE's own five, and every one of them is a cursor into a chart:
   * the last step of the grid that has been played, how far the lane voices
   * and the veil warnings have got, and the tick each seat's last judgement
   * happened on (`mixer-pulse.ts`). */
  pulseStep: number;
  pulseSung: number;
  pulseWarned: number;
  pulseLast1: number;
  pulseLast2: number;
  /** Which part of the round is running, so the two verdicts sound once. */
  pulsePhase: string;
  guardArmed: boolean;
  intakeOpen: boolean;
  over: boolean;
}

export function blankMemory(): Memory {
  return {
    tick: -1,
    cannonCol: -1,
    shieldCol: -1,
    gripP1: -1,
    gripP2: -1,
    bossCol: -1,
    bossKind: "",
    mirrorPhase: "",
    queenOpen: false,
    torches: 0,
    creatures: 0,
    strainBeat: -1,
    pulseStep: -1,
    pulseSung: 0,
    pulseWarned: 0,
    pulseLast1: -1,
    pulseLast2: -1,
    pulsePhase: "",
    guardArmed: false,
    intakeOpen: false,
    over: false,
  };
}
