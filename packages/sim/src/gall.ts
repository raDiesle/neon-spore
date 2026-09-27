import type { SimConfig } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE GALL: a soft nodule riding a raised seam the width of the hull, closed
 * by a pinch and moved the instant a close lands (`docs/spec/bosses-
 * choreographed.md` §38).
 *
 * **The rule is one sentence**: pinch the gall shut where it sits, and when
 * it jumps, find it and pinch it there.
 *
 * The seam has **four points**, and the gall sits on one. The two nearer the
 * left end are the pilot's to pinch and the two nearer the right the
 * navigator's — geometry says whose, THE VISE's rule — and both screens show
 * the gall where it is, because finding it is the whole difficulty rather
 * than a secret one seat keeps. What a thumb and finger send is the **gap**
 * between them, `SqueezeGap` read exactly as THE VISE reads it, with the
 * point the pinch went down on as its `id`: a pinch counts only on the point
 * the gall is on, so a pinch left where the gall was never follows it.
 *
 * A close step counts the beats the gap sits at or under `gallShutMilli`; the
 * gap widening back past it starts the count again, and a window run out is
 * tried again with the gall where it was. A close landed **jumps the gall** to
 * one of the other three points, drawn off the seeded `Rng`. Three closes
 * spend it and bare its root.
 *
 * **Its health is three closes and one shot**: the spent gall's root is shot
 * in its colour, and a shot that runs out is a hull hit, which is the wave.
 */

/** Points along the seam the gall can sit on — a figure of the silhouette, `SEAM_POINTS`' reason. */
export const GALL_POINTS = 4;

/** Closes that spend the gall. */
export const GALL_CLOSES = 3;

/**
 * Where the scene is: the gall slack on the seam before anything is asked,
 * a step lit and waiting, the seam resting between steps, and the root shot
 * and the seam smoothed flat.
 */
export const GALL_PHASES = ["slack", "lit", "rest", "flat"] as const;
export type GallPhase = (typeof GALL_PHASES)[number];

/** What a step asks: the gall pinched shut where it sits, or a shot at the bared root. */
export const GALL_ASKS = ["close", "fire"] as const;
export type GallAsk = (typeof GALL_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface GallStep {
  ask: GallAsk;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /** Beats the step stays lit: a close's window, a fire step's wait for its shot. */
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
  /** The point on the seam the gall sits on, nought at the left end up to `GALL_POINTS - 1`. */
  point: number;
  /** Closes landed: nought up to `GALL_CLOSES`. */
  closes: number;
  /** Shots the root has taken. */
  hits: number;
  /** Whether the root lies bare to be shot. */
  bared: boolean;
  /**
   * The pinch on the gall's point, in thousandths of a tile: the distance
   * between the two touches, or `gallOpenMilli` with no pinch on it.
   */
  gapMilli: number;
  /** Beats of the lit close its gap has been kept shut. */
  heldBeats: number;
}

export function gallBoss(world: World): GallState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "gall" ? boss : null;
}

/** The step lit, or null between steps. */
export function gallLitStep(s: GallState): GallStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** Whether the lit step is a close. */
export function gallClosing(s: GallState): boolean {
  return gallLitStep(s)?.ask === "close";
}

/**
 * The column a point on the seam stands over: the four spread evenly across
 * the hull, mirrored about its middle, so the pilot's two and the navigator's
 * two are as far from their own ends.
 */
export function gallPointCol(cfg: Pick<SimConfig, "cols">, point: number): number {
  return Math.floor(((2 * point + 1) * cfg.cols) / (2 * GALL_POINTS));
}

/** The seat nearer a point on the seam: the pilot's the left half, the navigator's the right. */
export function gallSeatAt(point: number): 1 | 2 {
  return point < GALL_POINTS / 2 ? 1 : 2;
}

/** The seat nearer the gall where it sits now: the one whose pinch closes it. */
export function gallPincher(s: GallState): 1 | 2 {
  return gallSeatAt(s.point);
}

/** Whether the gall is pinched shut this instant. */
export function gallShut(world: World, s: GallState): boolean {
  return s.gapMilli <= world.cfg.gallShutMilli;
}

/** The root shot and the seam flat: the fight is over. */
export function gallDone(s: GallState): boolean {
  return s.phase === "flat";
}

/** A fresh gall: slack on the seam's first point, unclosed, no pinch on it. */
export function freshGall(beat: number, steps: readonly GallStep[], openMilli: number): GallState {
  return {
    kind: "gall",
    steps: steps.map((step) => ({ ...step })),
    phase: "slack",
    phaseBeat: beat,
    cursor: 0,
    point: 0,
    closes: 0,
    hits: 0,
    bared: false,
    gapMilli: openMilli,
    heldBeats: 0,
  };
}
