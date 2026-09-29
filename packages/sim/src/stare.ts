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
 * 2. **live** — the same pattern, for real, up to `starePasses` times. On an
 *    open beat **both** seats sit still: any press that reaches the ship is
 *    caught, and the laser strikes the column the cannon was sent to
 *    (`stare-step.ts`). On a closed beat a bolt up the middle column hits the
 *    eye, and one hit ends the level.
 * 3. **charge** — after every pass without a hit the shut eye swells with a
 *    beam. Either seat pulls the lid down in time and the energy vents out to
 *    the sides (`stare-hand.ts`); nobody does, and the beam comes straight
 *    down the middle column onto the hull.
 *
 * Three passes with no hit and the level starts again from its blue pass. The
 * last level hit, the eye dies and the wave is won. There is nothing else on
 * the field: the owner, the same day — *rocks falling is stupid because it
 * doesn't relate to the boss*. So the wave is the boss (`bossFillsWave`).
 *
 * The clock is `stare-step.ts` and what goes into the fingerprint is
 * `stare-hash.ts`. This file is the shape and the questions asked of it.
 */

/**
 * The phases, in the order `stare-hash.ts` numbers them by. A list rather than
 * a bare union for `SNAKE_PHASES`' reason: the order is a wire value.
 */
export const STARE_PHASES = ["rest", "teach", "live", "charge", "hurt", "dying"] as const;

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
  /** The level being played; `levels.length` once the last is hit. */
  level: number;
  /** Which live pass of this level, from 0 to `starePasses - 1`. */
  pass: number;
  /** Whether the eye is open *this beat*. Set on the beat, read on the tick. */
  open: boolean;
  /** `world.tick` a seat was caught moving on an open beat, or -1. */
  caughtTick: number;
  /** Which seat was caught, or 0. */
  caughtPlayer: 0 | 1 | 2;
  /** The column the laser struck, where the cannon was sent; -1 before a catch. */
  caughtCol: number;
  /** The seat whose thumb is on the lid, or 0. */
  lidSeat: 0 | 1 | 2;
  /** How far down the lid is, in thousandths of a tile, to `stareLidPullMilli`. */
  lidMilli: number;
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

/** Whether the eye is charging its beam and the lid is the pair's to pull. */
export function stareCharging(s: StareState): boolean {
  return s.phase === "charge";
}

/** Whether a bolt up the middle column would hit the eye now: live and shut. */
export function stareShootable(s: StareState): boolean {
  return s.phase === "live" && !s.open;
}

/**
 * **What an open eye forbids**, and it is every verb that reaches the ship —
 * the owner's rule when this boss was first built: *you are not allowed to
 * shoot or move or use shield*. The list is `reachesShip` (`ship-verbs.ts`),
 * shared with THE BATON so the two cannot drift. The lid is a hand on the
 * eye, not on the ship, and is never a catch.
 */
export function stareForbids(c: Command): boolean {
  if (c.kind === "drag" && c.target === "stareLid") return false;
  return reachesShip(c);
}
