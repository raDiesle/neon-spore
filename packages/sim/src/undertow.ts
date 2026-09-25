import { midCol, type SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * THE UNDERTOW: where you are being hit from.
 *
 * **The question no other boss asks** — *what the pair does when the attack
 * comes up through the floor.* Every threat in this game comes down the field
 * and is answered upward; this one is underneath the hull. The cannon fires
 * up its column and cannot reach a thing standing in the column's floor, so
 * the answers are **the maw**, opened over the breach (`undertowIntake`), and
 * for the tall ones **the beam**, which burns its whole column standing and so
 * reaches the floor of it (`undertowBurned`). The shield faces down for the
 * first time: a plate standing on a breach stops it widening
 * (`docs/spec/bosses-choreographed.md` §13).
 *
 * **It is a fixture and not a body** (`bossFillsWave`): nothing of it falls,
 * and the arrivals over it are the ones the wave's own author wrote. What it
 * puts on the field it puts *in the hull* — a lobe withdrawn untaken leaves a
 * scar in `world.scars`, the pair's own record of their losses — and that is
 * the one exception a fixture is allowed: the column is the one the boss
 * pushed at, the beat is the one the pair failed to answer on, and neither is
 * writable by an author in advance.
 *
 * **Health is inverted, and it is the same drawing as the damage.** There is
 * no count of hits to land: the fight is a fixed number of pushes, every lobe
 * the pair takes is a plate that closes clean, every one they miss is a scar
 * they keep, and the last lobe is not a hit at all but a **hold** — the maw
 * kept open under it until the whole body follows it in. A boss taken *into*
 * the ship is the finish nothing else in the game has.
 *
 * **A miss is a scar, not a lost wave.** The owner's rule is that a hit costs
 * the wave, and a lobe withdrawing is not a hit — nothing reached the ship;
 * something left it, and took a piece of plating with it. The one miss that
 * *is* a hit is the last: a body the pair did not take comes through, and
 * that is `breachHull` like any other (`undertow-step.ts`).
 *
 * The clock and the pushes are `undertow-step.ts`, the presses
 * `undertow-press.ts`, the fingerprint `undertow-hash.ts`, the numbers
 * `config-undertow.ts`. This file is the shape and the questions asked of it.
 */

/**
 * The phases, in the order `undertow-hash.ts` numbers them by. A list rather
 * than a bare union for `BATON_STAGES`' reason: the index is a wire value.
 *
 * - `one` — one lobe at a time; the maw alone answers.
 * - `two` — two at once, four columns apart; the maw reaches one, and the
 *   plate has to stand on the other or it widens.
 * - `hard` — a lobe too tall for the maw; only the beam takes it.
 * - `seat` — the floor bows under the cannon itself, and it has to be slid off.
 * - `last` — every seam lit, one lobe in the middle that does not withdraw.
 * - `taken` — the body is passing through the breach. The boss is beaten.
 */
export const UNDERTOW_PHASES = ["one", "two", "hard", "seat", "last", "taken"] as const;

export type UndertowPhase = (typeof UNDERTOW_PHASES)[number];

/** What a breach is doing. Numbered for the hash, like a phase. */
export const UNDERTOW_BREACH_STAGES = ["bowing", "standing"] as const;

export type UndertowBreachStage = (typeof UNDERTOW_BREACH_STAGES)[number];

/**
 * **A breach is a place**, not a scar: a column of the hull that is open,
 * widening and answerable. One of these stands for as long as the boss is
 * pushing at that column; a lobe taken removes it clean, a lobe withdrawn
 * turns it into an entry in `world.scars` and removes it.
 */
export interface UndertowBreach {
  col: number;
  stage: UndertowBreachStage;
  /** `world.beat` the stage began on. */
  stageBeat: number;
  /** Too tall for the maw; the beam alone takes it. */
  tall: boolean;
  /** How far past its column the breach has spread, in thousandths of a tile. */
  widthMilli: number;
  /** Whether this breach has already let a second lobe through next door. */
  widened: boolean;
}

/** Everything THE UNDERTOW remembers between beats. */
export interface UndertowState {
  kind: "undertow";
  phase: UndertowPhase;
  /** `world.beat` the current phase began on. */
  phaseBeat: number;
  /** Pushes begun in the current phase. */
  push: number;
  /** `world.beat` the field went quiet on, or -1 while a push is up. */
  restBeat: number;
  /** Every column the boss is pushing at right now. */
  breaches: UndertowBreach[];
  /** Lobes taken in — by the maw or the beam. */
  taken: number;
  /** Lobes that withdrew untaken: the pair's losses, and the hull's scars. */
  scars: number;
  /** The last `world.beat` player 1's seat is unseated through, inclusive; -1 is never. */
  unseatedUntil: number;
  /** Beats the maw has been open under the last lobe, counted on the beat. */
  hold: number;
  /** Slides off the floor bowing under the cannon it has followed, of `undertowUnseatSlides`. */
  slid: number;
  /** The column player 2's thumb is pinning, or -1: her second plate (`undertow-hand.ts`). */
  pinCol: number;
  /** Whether her thumb is on the unseated pilot's column right now. */
  freeHeld: boolean;
  /** Beats she has held it there, counted on the beat, as the maw's hold is. */
  freed: number;
}

/** The boss, if it is the one installed. Narrowing in one place rather than six. */
export function undertowBoss(world: World): UndertowState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "undertow" ? boss : null;
}

/**
 * Beats the floor bows in this phase before the lobe is through. Exported for
 * the picture: how far a plate has risen is this count read against the beat,
 * and a render-side copy of which phase takes which count would be the rule
 * re-derived (`purity.test.ts`).
 */
export function undertowBowBeats(cfg: SimConfig, phase: UndertowPhase): number {
  if (phase === "seat") return cfg.undertowUnseatBeats;
  if (phase === "last") return cfg.undertowRiseBeats;
  return cfg.undertowBowBeats;
}

/** Where the last lobe comes up, and the body after it: dead centre. */
export function undertowLastCol(cfg: SimConfig): number {
  return midCol(cfg);
}

/**
 * The second column a tall lobe takes the plate of when it withdraws: the
 * one to its right, or to its left at the hull's edge. The same rule the
 * widening uses for where a second lobe comes through (`undertow-step.ts`),
 * so the two never disagree about which neighbour a column has.
 */
export function undertowPlateBeside(cfg: SimConfig, col: number): number {
  return col + 1 < cfg.cols ? col + 1 : col - 1;
}

/** The breach in that column, if the boss is pushing at it. */
export function undertowBreachAt(u: UndertowState, col: number): UndertowBreach | null {
  for (const b of u.breaches) if (b.col === col) return b;
  return null;
}

/**
 * Whether her thumb is holding that column shut. The same question the shield
 * answers with `world.shieldCol`, asked of the hand instead — and asked in the
 * two places the plate is asked about, so the pin and the plate can never
 * disagree about what covering a breach means (`undertow-step.ts`,
 * `undertow-press.ts`).
 */
export function undertowPinned(u: UndertowState, col: number): boolean {
  return u.pinCol === col;
}

/** Whether player 1's seat is unseated on this beat: the floor came up under the cannon and he did not move. */
export function undertowUnseated(u: UndertowState, beat: number): boolean {
  return beat <= u.unseatedUntil;
}

/** Whether a lobe stands in that column — the thing the maw, the beam and the plate answer. */
export function undertowLobeAt(u: UndertowState, col: number): UndertowBreach | null {
  const b = undertowBreachAt(u, col);
  return b !== null && b.stage === "standing" ? b : null;
}
