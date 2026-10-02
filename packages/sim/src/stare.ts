import type { SimConfig } from "./config.js";
import { reachesShip } from "./ship-verbs.js";
import type { Command } from "./types.js";

/**
 * THE STARE: an eye in the sky that opens on the beat, and whatever it catches
 * moving the hull pays for.
 *
 * Rebuilt 29 September 2026 on the owner's word: *every level should have a
 * predefined beats kind of music which players need to learn, and for a brief
 * moment of beat it quickly opens the eye and closes again.* So the fight is
 * a number of **levels**, each one a short pattern of beats authored on the
 * wave (`StareEntry.levels`), and each level is played the same way:
 *
 * 1. **teach** — the eye glows blue and plays its pattern once. It opens on
 *    the pattern's beats and nothing it sees costs anything: this pass is the
 *    pair learning the rhythm, by ear and by the lashes (render/).
 * 2. **live** — the same pattern, for real. On an open beat **both** seats sit
 *    still: any press that reaches the ship is caught, and the laser strikes
 *    the column the cannon was sent to (`stare-step.ts`).
 * 3. **charge** — after every live pass the shut eye swells with a beam, and
 *    the pair pulls its lashes up: `stareLashesFirst` on the first level and
 *    twice as many on every level after (`stareLashesOwed`). All of them up in
 *    time and the energy vents out to the sides (`stare-hand.ts`); not, and
 *    the beam comes straight down the middle column onto the hull.
 *
 * A live pass and its charge is one **turn**, and `stareTurns` of them
 * survived is the level won: the eye rises to the next, angrier. **The eye
 * cannot be hurt.** The owner, 2 October 2026: *the eye cannot be shot or
 * destroyed, just the sequence will take until it reaches next level and
 * succeed it.* So a bolt up the middle meets it and does nothing
 * (`stare-shot.ts`), and the last level survived is the wave won. There is
 * nothing else on the field: the owner, 29 September — *rocks falling is
 * stupid because it doesn't relate to the boss*. So the wave is the boss
 * (`bossFillsWave`).
 *
 * The clock is `stare-step.ts` and what goes into the fingerprint is
 * `stare-hash.ts`. This file is the shape and the questions asked of it.
 */

/**
 * The phases, in the order `stare-hash.ts` numbers them by. A list rather than
 * a bare union for `SNAKE_PHASES`' reason: the order is a wire value.
 */
export const STARE_PHASES = ["rest", "teach", "live", "charge", "rise", "calm"] as const;

/** Where the eye is in its fight. */
export type StarePhase = (typeof STARE_PHASES)[number];

/** Everything THE STARE remembers between beats. */
export interface StareState {
  kind: "stare";
  phase: StarePhase;
  /** `world.beat` the current phase began on. */
  phaseBeat: number;
  /**
   * The patterns, one a level, as authored: `x` an open beat, `.` a shut one.
   * A string because that is how a rhythm is read aloud and written down.
   */
  levels: readonly string[];
  /** The level being played; `levels.length` once the last is survived. */
  level: number;
  /** Which turn of this level, from 0 to `stareTurns - 1`. */
  turn: number;
  /** Whether the eye is open *this beat*. Set on the beat, read on the tick. */
  open: boolean;
  /** `world.tick` a seat was caught moving on an open beat, or -1. */
  caughtTick: number;
  /** Which seat was caught, or 0. */
  caughtPlayer: 0 | 1 | 2;
  /** The column the laser struck, where the cannon was sent; -1 before a catch. */
  caughtCol: number;
  /** Lashes pulled up this charge, to `stareLashesOwed`. */
  lashesUp: number;
  /** Whether each seat, `[pilot, navigator]`, has a thumb on the lashes. */
  lashHeld: [boolean, boolean];
  /**
   * Each seat's lowest `fromYMilli` since its last lash came up: the pull is
   * measured from here, so a thumb that comes back down and goes up again
   * pulls the next lash.
   */
  lashBaseMilli: [number, number];
  /** How far up each seat has the lash it holds, in thousandths of a tile, to `stareLashPullMilli`. */
  lashMilli: [number, number];
}

/** The pattern of the level being played, or `""` once the last is done. */
export function stareLevelPattern(s: StareState): string {
  return s.levels[s.level] ?? "";
}

/** Beats into the pattern the eye is on, during `teach` and `live`; -1 otherwise. */
export function stareStepAt(s: StareState, beat: number): number {
  if (s.phase !== "teach" && s.phase !== "live") return -1;
  return beat - s.phaseBeat;
}

/** Whether the eye is open this beat and a press would be caught. */
export function stareOpenLive(s: StareState): boolean {
  return s.phase === "live" && s.open;
}

/** Whether the eye is in its blue pass, where nothing costs anything. */
export function stareTeaching(s: StareState): boolean {
  return s.phase === "teach";
}

/**
 * Whether the pass the eye is on, or is resting before, is the blue one: the
 * teach itself, and the lead-in to it. A turn is 0 at rest only at the top of
 * a level, which is where the blue pass is (`stare-step.ts` asks this to
 * choose).
 */
export function stareBlue(s: StareState): boolean {
  return s.phase === "teach" || (s.phase === "rest" && s.turn === 0);
}

/** Whether the eye is charging its beam and the lashes are the pair's to pull. */
export function stareCharging(s: StareState): boolean {
  return s.phase === "charge";
}

/**
 * **How many lashes this level's charge asks for**: `stareLashesFirst` on the
 * first level and twice as many on each after. The owner, 2 October 2026:
 * *first level 4 and every level more doubling it.*
 */
export function stareLashesOwed(s: StareState, cfg: SimConfig): number {
  return cfg.stareLashesFirst * 2 ** Math.min(s.level, 10);
}

/**
 * **How long this level's charge runs**, in beats: `stareChargeBeats`, and
 * `stareLashBeatsMilli` more for every lash it asks for, so a level with
 * twice the lashes gives the pair the time to pull them.
 */
export function stareChargeLength(s: StareState, cfg: SimConfig): number {
  const lashes = stareLashesOwed(s, cfg);
  return cfg.stareChargeBeats + Math.ceil((lashes * cfg.stareLashBeatsMilli) / 1000);
}

/**
 * **Turns left before the next level**, counting the one being played: what
 * the eye shows the pair (render/). `stareTurns` at the top of a level, 1 on
 * its last turn.
 */
export function stareTurnsLeft(s: StareState, cfg: SimConfig): number {
  return Math.max(0, cfg.stareTurns - s.turn);
}

/**
 * **What an open eye forbids**, and it is every verb that reaches the ship —
 * the owner's rule when this boss was first built: *you are not allowed to
 * shoot or move or use shield*. The list is `reachesShip` (`ship-verbs.ts`),
 * shared with THE BATON so the two cannot drift. The lashes are a hand on the
 * eye, not on the ship, and are never a catch.
 */
export function stareForbids(c: Command): boolean {
  if (c.kind === "drag" && c.target === "stareLash") return false;
  return reachesShip(c);
}
