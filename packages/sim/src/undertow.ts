import type { SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * THE UNDERTOW: where you are being hit from.
 *
 * **The question no other boss asks** — *what the pair does when the attack
 * comes up through the floor.* Every threat in this game comes down the field
 * and is answered upward; this one is underneath the hull. A lobe bows the
 * plating, stands up out of it like a second cannon, and is answered by the
 * one control its colour names: a **yellow** lobe by the maw opened over it,
 * a **shield-coloured** one by the shield raised on it
 * (`docs/spec/bosses-choreographed.md` §13).
 *
 * **Three levels, each a clock.** The pair does not have to take every lobe:
 * they have to be standing when a level's `undertowLevelBeats` run out, and
 * then every lobe still up shrinks back into the floor and the next level
 * begins with one more at a time. The owner's rework, 1 October 2026 —
 * *survive the timer, don't need to kill all* — replaced the fixed count of
 * pushes, the widening, the unseat and player 2's two rings.
 *
 * **A lobe left standing grows.** Past `undertowStandBeats` it doubles in
 * height and nothing answers it any more but a thumb: either seat tapping it
 * (`undertowTap`) shrinks it back to standing, with its clock started again.
 * Left tall for `undertowTallBeats` it bursts — a hole through the hull, the
 * plating beside it gone, and the wave lost (`undertow-step.ts`).
 *
 * **It is a fixture and not a body** (`bossFillsWave`): nothing of it falls,
 * and the arrivals over it are the ones the wave's own author wrote.
 *
 * The clock is `undertow-step.ts`, the answers and the tap `undertow-press.ts`,
 * the fingerprint `undertow-hash.ts`, the numbers `config-undertow.ts`. This
 * file is the shape and the questions asked of it.
 */

/**
 * The levels, in the order `undertow-hash.ts` numbers them by. A list rather
 * than a bare union for `BATON_STAGES`' reason: the index is a wire value.
 * Each allows one more lobe up at once than the last (`undertowLobesIn`).
 */
export const UNDERTOW_PHASES = ["one", "two", "three"] as const;

export type UndertowPhase = (typeof UNDERTOW_PHASES)[number];

/**
 * What a lobe is doing. Numbered for the hash, like a phase.
 *
 * - `bowing` — the plate is lifting; nothing answers it yet.
 * - `standing` — up out of the hull, and its answer takes it.
 * - `tall` — grown, and only a tap brings it back to `standing`.
 */
export const UNDERTOW_LOBE_STAGES = ["bowing", "standing", "tall"] as const;

export type UndertowLobeStage = (typeof UNDERTOW_LOBE_STAGES)[number];

/**
 * Which control takes a lobe, and so which colour it is drawn: `maw` is
 * yellow, the maw's own, and `shield` is the shield's. Numbered for the hash.
 */
export const UNDERTOW_ANSWERS = ["maw", "shield"] as const;

export type UndertowAnswer = (typeof UNDERTOW_ANSWERS)[number];

/** One lobe of the boss, standing in one column of the hull. */
export interface UndertowLobe {
  col: number;
  stage: UndertowLobeStage;
  /** `world.beat` the stage began on — and the beat a tap started it again. */
  stageBeat: number;
  answer: UndertowAnswer;
  /** Set when a tap shrank it back from tall, so its stand is drawn falling, not rising. */
  tapped?: true;
}

/** Everything THE UNDERTOW remembers between beats. */
export interface UndertowState {
  kind: "undertow";
  phase: UndertowPhase;
  /** `world.beat` the current level began on: its clock. */
  phaseBeat: number;
  /** `world.beat` the field went quiet on; the first bow waits a rest after it. */
  restBeat: number;
  /** `world.beat` the level's clock ran out and the lobes began to shrink, or -1. */
  ebbBeat: number;
  /** Lobes taken — by the maw or the shield — across the whole fight. */
  taken: number;
  /** Every lobe up right now, in the order they bowed. */
  lobes: UndertowLobe[];
}

/** The boss, if it is the one installed. Narrowing in one place rather than six. */
export function undertowBoss(world: World): UndertowState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "undertow" ? boss : null;
}

/** How many lobes may be up at once in a level. */
export function undertowLobesIn(cfg: SimConfig, phase: UndertowPhase): number {
  if (phase === "one") return cfg.undertowOneLobes;
  if (phase === "two") return cfg.undertowTwoLobes;
  return cfg.undertowThreeLobes;
}

/**
 * Beats left on the level's clock, never below zero. Exported for the
 * picture: the timer the pair reads is this count, and a render-side copy of
 * where the level started would be the rule re-derived (`purity.test.ts`).
 */
export function undertowLevelLeft(cfg: SimConfig, u: UndertowState, beat: number): number {
  return Math.max(0, cfg.undertowLevelBeats - (beat - u.phaseBeat));
}

/** Whether the level is over and every lobe is shrinking back into the floor. */
export function undertowEbbing(u: UndertowState): boolean {
  return u.ebbBeat >= 0;
}

/**
 * The second column a lobe that bursts takes the plate of: the one to its
 * right, or to its left at the hull's edge.
 */
export function undertowPlateBeside(cfg: SimConfig, col: number): number {
  return col + 1 < cfg.cols ? col + 1 : col - 1;
}

/** The lobe in that column, at whatever stage, if there is one. */
export function undertowLobeAt(u: UndertowState, col: number): UndertowLobe | null {
  for (const l of u.lobes) if (l.col === col) return l;
  return null;
}
