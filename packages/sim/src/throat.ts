import { hullRow, midCol, type SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * THE THROAT: the one boss you answer by **giving it something**.
 *
 * **The question no other boss asks** — *what you put in on purpose.*
 * Everything else in this game is answered by taking something away from it,
 * and the pair's habit is the one they were taught in wave one: clear the
 * field, shoot the hazard, ward the rock. Here that habit is the boss's
 * dinner. A creature it swallows **re-tightens a slack ring**, so a pair who
 * lets the field run is fighting a thing that heals out of their own arrivals,
 * and the only thing that hurts it is a gum thrown into its mouth.
 *
 * **Health is the five rings** (`throatRings`). A choked ring goes slack for
 * good and stops joining the contraction wave, so the wave visibly gets
 * shorter as the fight goes on: the health, the clock and the picture are one
 * drawing, which is THE QUEEN's bargain and the reason there is no bar.
 *
 * **It is a fixture and not a body** (`bossFillsWave` is false for it): the
 * gullet hangs from the top of the field down to `throatMouthRow` and nothing
 * of it is among `world.creatures`, so it falls nothing, reaches nothing, and
 * cannot be warded or taken hold of — THE VANE's family. **Shots pass through
 * the tube**, and that is not an oversight: player 2's answer to a creature
 * about to be swallowed is to shoot it *in the mouth's own column*, and a tube
 * that stopped bolts would be a boss with no answer at all.
 *
 * ## Two clocks, and both of them are said out loud
 *
 * *Its* clock is the inhale (`throatInhales`): every `throatInhaleBeats` it
 * swallows whatever is standing in its mouth and hauls everything else in its
 * column one row closer. *Its* other clock is the mouth's travel
 * (`throatMouthCol`), a column a beat along its own row, turning at the walls.
 *
 * Player 2 is shown both and neither is on player 1's screen. Player 1 owns
 * the fling, because the row a gum is on when the thumb lifts is the line it
 * flies along (`gum.ts`). So the fight is an arithmetic sentence: *a gum falls
 * a row a beat, the mouth steps a column a beat, a fling crosses
 * `gumFlingCols` a beat — which beat do I let go?*
 *
 * The clock and the two hit tests are `throat-step.ts`, the pull is
 * `throat-pull.ts`, the fingerprint is `throat-hash.ts`, the numbers are
 * `config-throat.ts`, and `docs/spec/bosses-choreographed.md` §1 is the
 * design. This file is the shape, the geometry and the questions asked of both.
 */

/**
 * The phases, in the order `throat-hash.ts` numbers them by.
 *
 * A list rather than a bare union for `DIASTOLE_PHASES`' reason: a phase goes
 * into `hashWorld` as its index, so the order is a wire value and a name
 * inserted in the middle would renumber the ones after it.
 *
 * - `still` — the mouth hangs over the middle column and does not move.
 * - `slide` — it steps a column a beat and turns at the walls.
 * - `quick` — the inhale tightens and the mouth steps two.
 * - `open` — four rings slack: it inhales every beat and stops sliding.
 * - `everts` — beaten. It pulls itself through its own mouth.
 */
export const THROAT_PHASES = ["still", "slide", "quick", "open", "everts"] as const;

/** Where the fight is. */
export type ThroatPhase = (typeof THROAT_PHASES)[number];

/** Everything THE THROAT remembers between beats. */
export interface ThroatState {
  kind: "throat";
  phase: ThroatPhase;
  /** `world.beat` the current phase began on — the origin of both clocks. */
  phaseBeat: number;
  /**
   * Rings gone slack, 0 to `throatRings`. **It goes down as well as up**,
   * which is the whole boss: a swallowed creature re-tightens one.
   */
  slack: number;
  /**
   * The column the mouth stands in at `phaseBeat`, and the travel's only
   * anchor — `throatMouthCol` is a pure function of this and the beat.
   *
   * An anchor rather than a position, and the difference is the boss. A stored
   * column would have to be stepped by something, and whatever stepped it
   * would sit on one side of `onBeat` while the pull and the hit tests sat on
   * the other (`step.ts`, where a beam on a boundary tick burns while the
   * counter still reads the beat that has just ended). Worse, player 2's readout is *which
   * column the mouth will be in* — a question about a beat that has not
   * happened — and a stepper cannot answer it at all.
   */
  mouthFrom: number;
  /** The beat a ring last choked, -1 before the first. render/'s, so the tube
   * darkens off the world rather than off a clock a restart could carry. */
  chokedBeat: number;
  /** The beat it last swallowed something, -1 before the first. render/'s for
   * the same reason, and the pair's receipt for a body they left alone. */
  fedBeat: number;
  /**
   * **The beat player 2's thumb landed on a slack ring**, -1 when no thumb is
   * on one — the cinch, and the fight's second gesture (`throat-hand.ts`).
   *
   * A beat and not a flag for `vane-hand.ts`'s reason turned around: the hold
   * is heard on the tick and spent on the beat, and the number is what the
   * picture darkens the pinched ring from. It is the one handle in this fight
   * that **the pair made themselves** — there is nothing to pinch until a gum
   * has choked a ring, so the boss hands out its own second control as it
   * loses.
   */
  cinchBeat: number;
  /**
   * **Inhales the cinch has stolen and not yet given back**, 0 to
   * `throatCinchBeats`.
   *
   * The whole cost of the gesture, and the reason it is a bargain rather than
   * a pause button: a held ring does not stop the gullet breathing, it makes
   * it breathe *later and faster*. Every inhale her thumb takes off the grid
   * is owed back one a beat the moment she lifts (`throatBreathes`), so the
   * pilot's window is real time and the bill arrives at the worst rate in the
   * fight.
   */
  breath: number;
  /**
   * **The column player 1's carry has asked the mouth to move on the next
   * beat**: -1, 0 or 1 (`throat-hand.ts`).
   *
   * Pending rather than applied, because this file's own promise is that every
   * change in this fight lands on a beat somebody can name. A haul heard on
   * the tick that moved the mouth on the tick would move it between two counts
   * player 2 had already said out loud, and her column would be wrong through
   * no fault of hers.
   */
  haulStep: number;
}

/** Rings still tight, which is the health left. */
export function throatRingsLeft(cfg: SimConfig, b: ThroatState): number {
  return Math.max(0, cfg.throatRings - b.slack);
}

/** Whether every ring is slack, which is the whole of being beaten. */
export function throatSpent(cfg: SimConfig, b: ThroatState): boolean {
  return b.slack >= cfg.throatRings;
}

/**
 * The row the mouth hangs on, clamped to a row a body can actually stand in.
 *
 * Never the hull row, for `rockCrossRowFor`'s reason said about a mouth: a
 * body on `hullRow` is one `resolveHull` answers at the end of the beat, so a
 * mouth authored onto it would be competing with the ship for the same
 * arrival and the pair could not tell which of the two had taken it.
 */
export function throatMouthRow(cfg: SimConfig): number {
  return Math.max(1, Math.min(hullRow(cfg) - 1, cfg.throatMouthRow));
}

/** Columns the mouth steps a beat, in this phase. 0 is a mouth standing
 * still, which is two of the five and both deliberately. */
export function throatStride(cfg: SimConfig, b: ThroatState): number {
  if (b.phase === "slide") return cfg.throatSlideCols;
  if (b.phase === "quick") return cfg.throatQuickCols;
  return 0;
}

/**
 * **Where the mouth is on this beat**, derived rather than stored.
 *
 * A ping-pong from `mouthFrom` at `phaseBeat`, `throatStride` columns a beat,
 * reflecting inside the field — `cross.ts`'s rule said as an oracle instead of
 * as a stepper, and the reflection is why it is not that function: `crossField`
 * truncates a stride at the wall and turns there, which is the right answer
 * when something is walking beat by beat and cannot be asked about beat
 * forty. This can, and has to be — player 2's whole readout is a column the
 * mouth has not reached yet.
 *
 * The travel is reflected over `span`, which is the last whole stride inside
 * the field rather than the wall itself. That keeps `cross.ts`'s own promise —
 * *there is never a beat spent standing still against a wall* — for a stride
 * that does not divide the field: the mouth turns a column short instead of
 * arriving twice.
 *
 * Negative beats fold, so it answers before `phaseBeat` as well as after: a
 * phase re-anchors on a beat and the frame drawn on that boundary is allowed
 * to ask about the beat that has just gone.
 */
export function throatMouthCol(cfg: SimConfig, b: ThroatState, beat: number): number {
  const stride = throatStride(cfg, b);
  if (stride <= 0) return b.mouthFrom;
  const wall = cfg.cols - 1;
  const span = wall - (wall % stride);
  if (span <= 0) return b.mouthFrom;
  const period = 2 * span;
  const raw = b.mouthFrom + stride * (beat - b.phaseBeat);
  const p = ((raw % period) + period) % period;
  return p <= span ? p : period - p;
}

/**
 * The column the mouth stands in at the start of a phase, snapped to a stop
 * the new stride can actually reach.
 *
 * Called on every phase change rather than derived at read time, because the
 * anchor is what makes the travel a pure function: a mouth that entered
 * `quick` on an odd column would reflect between two columns and never stand
 * on a wall, and `throatMouthCol`'s no-repeat promise would quietly stop
 * holding.
 */
export function throatSnap(cfg: SimConfig, col: number, stride: number): number {
  if (stride <= 1) return Math.max(0, Math.min(cfg.cols - 1, col));
  const wall = cfg.cols - 1;
  const span = wall - (wall % stride);
  const inside = Math.max(0, Math.min(span, col));
  return inside - (inside % stride);
}

/** Where the mouth hangs on the first beat of the fight: the middle column,
 * for THE DIASTOLE's reason — a fixture placed off centre would have a long
 * side and a short one, and the pair is already doing arithmetic. */
export function throatHomeCol(cfg: SimConfig): number {
  return midCol(cfg);
}

/**
 * The boss, if it is the one installed. Narrowing in one place rather than
 * four (`diastoleBoss`), and it is **here** rather than beside the clock in
 * `throat-step.ts` so that `throat-pull.ts` can ask without the two files
 * importing each other at runtime. `World` comes back as a type only, which is
 * erased — the cycle `bullet-types.ts` already stands in.
 */
export function throatBoss(world: World): ThroatState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "throat" ? boss : null;
}
