import { midCol, type SimConfig } from "./config.js";
import type { Color } from "./types.js";

/**
 * THE DIASTOLE: two hearts on two cadences, one each, and the fight is the
 * beat they coincide.
 *
 * **The question no other boss asks** — *whether the two of you can hold two
 * different times at once.* The beat is this pair's shared ground and every
 * mechanic in the game hangs off it, which is why THE CONDUCTOR was deferred:
 * a boss that bent the tempo would bend the one thing two people two seconds
 * apart have to agree about (`docs/spec/latency.md`). This is the safe version
 * of that ask. The tempo never moves. What moves is that there are **two
 * counts on it and neither player can see both** — player 1 the left chamber
 * at three beats, player 2 the right at five, and the far chamber drawn as a
 * still grey mass on the other screen. **Geometry says whose**, the way THE
 * BALLOON's two handles do; a colour saying it would collide with the one
 * colour statement this game is built on.
 *
 * **It is a fixture and not a body** (`bossFillsWave`): the twin lobe hangs
 * above the grid in the top three columns, it falls nothing, reaches nothing,
 * and cannot be warded or taken hold of — so the arrivals underneath it are
 * the ones the wave's own author wrote. THE VANE's shape exactly, and for THE
 * VANE's reason: a mechanism that spawned its own wave would be a mechanism
 * whose difficulty nobody could author against.
 *
 * **Health is two chambers**, collapsed permanently and drawn as hollows. The
 * second is much harder than the first, and not because a number went up:
 * there is no longer a second rhythm to count the first against.
 *
 * **The rule, in one sentence.** While the left chamber beats alone an
 * ordinary shot of its own colour, in its own column, on one of its own
 * contractions, takes a hit off it; from the moment the right wakes, the only
 * thing that lands at all is **the lance beam standing in the bridge column on
 * a beat when every chamber still standing is contracting**. That is one
 * sentence rather than two because it has to be: with two chambers up it means
 * the coincidence every fifteen beats, and with one up it means that one's own
 * beat, and a pair who learned the first has already learned the second.
 *
 * The clock and the strike are `diastole-step.ts`, the fingerprint is
 * `diastole-hash.ts`, the numbers are `config-diastole.ts`, and
 * `docs/spec/bosses-choreographed.md` §7 is the design. This file is the
 * shape, the geometry and the questions asked of both.
 */

/**
 * The phases, in the order `diastole-hash.ts` numbers them by.
 *
 * A list rather than a bare union for `STARE_PHASES`' reason: a phase goes
 * into `hashWorld` as its index, so the order is a wire value and a name
 * inserted in the middle would renumber the ones after it.
 *
 * - `one` — the left beats alone and ordinary shots land on it.
 * - `two` — the right wakes, single-chamber hits stop landing, and only the
 *   bridge takes anything.
 * - `alone` — the left is a collapsed hollow and the right's cadence has moved
 *   to a number the pair never counted.
 * - `burst` — beaten. The bridge fills from both ends and splits.
 */
export const DIASTOLE_PHASES = ["one", "two", "alone", "burst"] as const;

/** Where the fight is. */
export type DiastolePhase = (typeof DIASTOLE_PHASES)[number];

/**
 * Which chamber: `-1` the left, `1` the right.
 *
 * A side and not a name, because a side is what the picture already has to
 * carry: the seat a chamber belongs to is *which way it is*, and the two
 * functions below turn the same integer into a column and into a colour with
 * no table in between.
 */
export type DiastoleSide = -1 | 1;

/** Both of them, in the order every loop over them wants. */
export const DIASTOLE_SIDES: readonly DiastoleSide[] = [-1, 1];

/** Everything THE DIASTOLE remembers between beats. */
export interface DiastoleState {
  kind: "diastole";
  phase: DiastolePhase;
  /** `world.beat` the current phase began on — and the origin of both counts. */
  phaseBeat: number;
  /** Hits left in the left chamber. 0 is collapsed, and collapsed is forever. */
  leftHits: number;
  /** And the right's. The silhouette is the health bar. */
  rightHits: number;
  /**
   * Beats between contractions, per chamber, as they stand *now*.
   *
   * Stored rather than read off the configuration on every call because the
   * cadence **moves once per phase** — that is the design's own answer to a
   * count being memorised instead of held — and a phase table consulted at
   * every call site would be a second copy of when it moves.
   */
  leftEvery: number;
  rightEvery: number;
  /**
   * The beat a chamber last took a hit on, -1 before the first. render/'s, so
   * the collapse animates off the world rather than off a clock of its own
   * that a restart could carry over.
   */
  struckBeat: number;
  /** Which side that was: -1 left, 1 right, 0 both on one beat, and 0 before any. */
  struckSide: -1 | 0 | 1;
}

/**
 * **The bridge column**, which is the middle of the field.
 *
 * Dead centre for THE VANE's and THE WARDEN's reason: a twin lobe placed off
 * centre would have a long side and a short one, so the cannon would be a
 * different distance from the bridge depending on which way it came — and the
 * one thing this fight must not add to the arithmetic is a distance.
 */
export function diastoleBridgeCol(cfg: SimConfig): number {
  return midCol(cfg);
}

/** A chamber's own column: one either side of the bridge. */
export function diastoleChamberCol(cfg: SimConfig, side: DiastoleSide): number {
  return diastoleBridgeCol(cfg) + side;
}

/**
 * The ammunition colour a chamber carries, and **the two are not the same
 * one**, which is what makes the bridge the only answer once both are up:
 * neither colour takes both chambers, and the beam takes everything in the
 * column it is standing in rather than everything of its colour on the field.
 * The pair has to work that out, and the working-out is the boss.
 *
 * The bridge itself carries neither — violet vessels, the ship's own colour —
 * so a beam in it is accepted whichever trigger loaded it.
 */
export function diastoleColor(side: DiastoleSide): Color {
  return side === -1 ? "red" : "cyan";
}

/** Whose pulse is drawn true. Player 1 has the left, player 2 the right. */
export function diastoleSeat(side: DiastoleSide): 1 | 2 {
  return side === -1 ? 1 : 2;
}

/** Hits left in that chamber. */
export function diastoleHits(b: DiastoleState, side: DiastoleSide): number {
  return side === -1 ? b.leftHits : b.rightHits;
}

/** Whether that chamber is still there at all. */
export function diastoleStanding(b: DiastoleState, side: DiastoleSide): boolean {
  return diastoleHits(b, side) > 0;
}

/** Beats between that chamber's contractions, as they stand now. */
export function diastoleEvery(b: DiastoleState, side: DiastoleSide): number {
  return side === -1 ? b.leftEvery : b.rightEvery;
}

/**
 * Whether that chamber is keeping a cadence at all this phase.
 *
 * The right chamber is *standing* from the first beat of the fight and does
 * not *beat* until the left is nearly gone, which is not a detail: the whole
 * of phase `one` is one count, so that the pair arrives at two counts having
 * already learned that a count is a thing you say out loud.
 */
export function diastoleBeating(b: DiastoleState, side: DiastoleSide): boolean {
  if (b.phase === "burst" || !diastoleStanding(b, side)) return false;
  return b.phase !== "one" || side === -1;
}

/**
 * Whether that chamber is contracting on this beat — which is the only beat it
 * can be hurt on.
 *
 * Counted from `phaseBeat` rather than from the wave's start, so a cadence
 * that moves starts its new count where the phase did. A pair who had to
 * subtract an old origin from a new number would be doing the boss's
 * bookkeeping instead of its arithmetic.
 */
export function diastoleContracts(b: DiastoleState, beat: number, side: DiastoleSide): boolean {
  if (!diastoleBeating(b, side)) return false;
  return (beat - b.phaseBeat) % diastoleEvery(b, side) === 0;
}

/**
 * **The coincidence**: every chamber still beating contracts on this beat.
 *
 * With two up it falls every fifteen beats and on no beat between, because
 * three and five do not divide each other (`config-diastole.ts` says why that
 * is a comment and not a coincidence). With one up it is that one's own beat.
 * With none it is never, which is what keeps a beam fired into a dead boss
 * from finding anything.
 */
export function diastoleCoincides(b: DiastoleState, beat: number): boolean {
  let beating = 0;
  for (const side of DIASTOLE_SIDES) {
    if (!diastoleBeating(b, side)) continue;
    beating += 1;
    if (!diastoleContracts(b, beat, side)) return false;
  }
  return beating > 0;
}
