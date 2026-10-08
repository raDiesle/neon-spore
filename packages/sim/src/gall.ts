import type { SimConfig } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE GALL: a small alien that leaps from one seat's half of the hull to the
 * other's, charged by taps and thrown by a pull (`docs/spec/bosses-
 * choreographed.md` §38, the owner's rework of 8 October 2026).
 *
 * **The rule is one sentence**: tap it until it is charged, pull it up to
 * throw it to your partner's side, and shoot it when it is lit.
 *
 * The field has **four points** it can sit on. The two nearer the left end
 * are the pilot's and the two nearer the right the navigator's — geometry
 * says whose, THE VISE's rule — and both screens show it where it is.
 *
 * **A leap step** asks the seat whose half it sits on to tap it `taps` times,
 * each tap winding it tighter, and then to **pull** — a press on it dragged
 * up toward the middle of the field. A pull before it is charged is refused
 * aloud. A pull charged throws it: it flies for `gallLeapBeats` under THE
 * SLOW, and lands on a point of the other half drawn off the seeded `Rng`.
 *
 * **Every landing starts the clock again**: a step's `beats` count from the
 * beat it lit, which is the beat the alien landed, and a step run out is the
 * hull — one miss loses the wave, so the clock is short (the owner, 8
 * October 2026: *it should have much less time available*).
 *
 * **A fire step** lights the alien where it landed: the cannon is slid under
 * it and the bolt is its colour. Its health is the fire steps in the script,
 * one limb a shot.
 */

/** Points the alien can sit on — two to each seat's half. */
export const GALL_POINTS = 4;

/**
 * Where the scene is: the alien dropping in before anything is asked, a step
 * lit and waiting, the alien in the air between two halves, a rest after a
 * shot, and the alien shot down for good.
 */
export const GALL_PHASES = ["slack", "lit", "leap", "rest", "flat"] as const;
export type GallPhase = (typeof GALL_PHASES)[number];

/** What a step asks: the alien tapped and thrown, or shot where it sits. */
export const GALL_ASKS = ["leap", "fire"] as const;
export type GallAsk = (typeof GALL_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface GallStep {
  ask: GallAsk;
  /** Taps that charge it before a pull throws it. Only a leap step reads it. */
  taps: number;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /** Beats the step stays lit from the landing: the whole of the pair's time. */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface GallEntry {
  kind: "gall";
  steps: readonly GallStep[];
}

export interface GallState {
  kind: "gall";
  /** Copied at install and never written again. */
  steps: GallStep[];
  phase: GallPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** The point the alien sits on — or, in the air, is landing on — nought at the left end. */
  point: number;
  /** The point it left on its last leap; its own point before it has leapt. */
  from: number;
  /** Taps the lit leap step has had. */
  taps: number;
  /** Leaps landed. */
  leaps: number;
  /** Shots the alien has taken. */
  hits: number;
  /** The point each seat's finger is down on, nought for the pilot, or -1 with none. */
  down: [number, number];
}

export function gallBoss(world: World): GallState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "gall" ? boss : null;
}

/** The step lit, or null between steps. */
export function gallLitStep(s: GallState): GallStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** Whether the lit step is a leap. */
export function gallLeaping(s: GallState): boolean {
  return gallLitStep(s)?.ask === "leap";
}

/** Whether the lit leap has had its taps and wants the pull. */
export function gallCharged(s: GallState): boolean {
  const step = gallLitStep(s);
  return step?.ask === "leap" && s.taps >= step.taps;
}

/**
 * The column a point stands over: the four spread evenly across the hull,
 * mirrored about its middle, so the pilot's two and the navigator's two are
 * as far from their own ends.
 */
export function gallPointCol(cfg: Pick<SimConfig, "cols">, point: number): number {
  return Math.floor(((2 * point + 1) * cfg.cols) / (2 * GALL_POINTS));
}

/** The seat nearer a point: the pilot's the left half, the navigator's the right. */
export function gallSeatAt(point: number): 1 | 2 {
  return point < GALL_POINTS / 2 ? 1 : 2;
}

/** The seat whose half the alien sits on: the one whose taps and pull it answers. */
export function gallPresser(s: GallState): 1 | 2 {
  return gallSeatAt(s.point);
}

/** Whether the alien asks a seat's hand, nought for the pilot: a leap lit, and it on that seat's half. */
export function gallPointAsks(s: GallState, side: 0 | 1): boolean {
  return gallLeaping(s) && gallPresser(s) === side + 1;
}

/** Whether the alien asks for a shot: a fire step lit. */
export function gallShotAsks(s: GallState): boolean {
  return gallLitStep(s)?.ask === "fire";
}

/** A fresh alien: dropping in on the first point, untapped, no finger on it. */
export function freshGall(beat: number, steps: readonly GallStep[]): GallState {
  return {
    kind: "gall",
    steps: steps.map((step) => ({ ...step })),
    phase: "slack",
    phaseBeat: beat,
    cursor: 0,
    point: 0,
    from: 0,
    taps: 0,
    leaps: 0,
    hits: 0,
    down: [-1, -1],
  };
}
