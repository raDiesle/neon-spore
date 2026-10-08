import { blobRadiusMul } from "@neon-spore/content";
import {
  midCol,
  type SimConfig,
  type TrapezeState,
  type TrapezeStep,
  trapezePeriod,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE TRAPEZE's geometry**: where the swing hangs from, where its seat is
 * at an angle, where the gong of a level hangs, and the alien's two bodies.
 *
 * **The swing is THE CONDUCTOR** (`tools/shape-sheet/src/drafts/bosses.ts`):
 * an arm, not a body, a pendulum with no inside — long ropes from a point
 * above the field to a seat, seen from the side, so the swing goes the way
 * the screen is wide. The owner, 7 October 2026: *the ropes
 * should be much longer*, so it hangs from four rows above the grid's top
 * and its seat rests two thirds of the way down the field.
 *
 * **The alien is HERALD** (`tools/shape-sheet/src/drafts/creatures.ts`): *a
 * body and its earlier self, never quite together* — a torso on the seat
 * and a head that lags the swing, a beat behind where the seat already is.
 *
 * Every place is the simulation's own (`sim/trapeze.ts`'s `trapezeSeat` and
 * `trapezeGongAt`), laid in field pixels, with the angle taken as a float
 * so a frame between ticks is not a step.
 */

export interface Point {
  x: number;
  y: number;
}

/** How much bigger than a creature the alien is drawn: everything below is before it. */
export const TRAPEZE_SIZE = 1.35;
/** The alien's two bodies' radii, in tiles. */
export const TRAPEZE_TORSO = 0.4;
export const TRAPEZE_HEAD = 0.32;
/** How far up the ropes the torso and the head sit off the seat, in tiles. */
export const TRAPEZE_TORSO_UP = 0.48;
export const TRAPEZE_HEAD_UP = 1.16;
/** How far the head lags the swing, in degrees per degree of swing speed's share. */
const HEAD_LAG = 6;
/** How far out past the seat's place a gong hangs, so the foot kicks it, in tiles. */
const GONG_OUT = 1.2;
/** HERALD's two bodies: lobes, depth, wobble, seeds. */
const BODY = { lobes: 3, depth: 0.12, wobble: 0.07 } as const;
/** Samples round each body. */
const N = 28;

const rad = (deg: number) => (deg * Math.PI) / 180;

/** The point the ropes hang from, above the grid over the middle column. */
export function trapezeAnchor(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: tileCY(l, cfg.trapezeAnchorMilli / 1000) };
}

/** The ropes' length, in pixels. */
export function trapezeRope(l: Layout, cfg: SimConfig): number {
  return (cfg.trapezeRopeMilli / 1000) * l.tile;
}

/** The swing's angle this frame, degrees, below nought the left; `frac` is the share of a tick gone. */
export function trapezeDeg(cfg: SimConfig, s: TrapezeState, frac = 0): number {
  const turn = (2 * Math.PI * (s.swingTick + frac)) / trapezePeriod(cfg);
  return (s.ampMilli / 1000) * Math.cos(turn);
}

/** How fast it swings this frame, as a share of the fastest it could at this height: -1..1, below nought leftward. */
export function trapezeSpeed(cfg: SimConfig, s: TrapezeState): number {
  return -Math.sin((2 * Math.PI * s.swingTick) / trapezePeriod(cfg));
}

/** The point on the swing's arc at `deg`, `out` tiles further down the ropes. */
export function trapezeOnArc(l: Layout, cfg: SimConfig, deg: number, out = 0): Point {
  const a = trapezeAnchor(l, cfg);
  const r = trapezeRope(l, cfg) + out * l.tile;
  return { x: a.x + r * Math.sin(rad(deg)), y: a.y + r * Math.cos(rad(deg)) };
}

/** Where a gong hangs: the seat's place at its angle, and out past it the side it is on. */
export function trapezeGongPx(l: Layout, cfg: SimConfig, step: TrapezeStep): Point {
  const at = trapezeOnArc(l, cfg, (step.gongSide * step.gongMilli) / 1000);
  return { x: at.x + step.gongSide * GONG_OUT * l.tile, y: at.y };
}

/** The gong's radius, in pixels. */
export function trapezeGongR(l: Layout): number {
  return 0.55 * l.tile;
}

/** The alien's torso and head at `deg`, the head lagging by `speed`. */
export function trapezeAlienAt(
  l: Layout,
  cfg: SimConfig,
  deg: number,
  speed: number,
): { torso: Point; head: Point; r: number } {
  const torso = trapezeOnArc(l, cfg, deg, -TRAPEZE_TORSO_UP * TRAPEZE_SIZE);
  const lag = deg - HEAD_LAG * speed;
  const head = trapezeOnArc(l, cfg, lag, -TRAPEZE_HEAD_UP * TRAPEZE_SIZE);
  return { torso, head, r: (TRAPEZE_TORSO + 0.5 * TRAPEZE_HEAD) * TRAPEZE_SIZE * l.tile };
}

/** One of HERALD's bodies, `r` round, about `at`. */
export function trapezeBodyPath(at: Point, r: number, time: number, seed: number): Path2D {
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const m = blobRadiusMul(a, BODY.lobes, BODY.depth, BODY.wobble, time, seed);
    pts.push({ x: at.x + Math.cos(a) * r * m, y: at.y + Math.sin(a) * r * m });
  }
  return splinePath(pts, true);
}

/** The torso's radius and the head's, in pixels. */
export function trapezeBodyR(l: Layout): { torso: number; head: number } {
  return {
    torso: TRAPEZE_TORSO * TRAPEZE_SIZE * l.tile,
    head: TRAPEZE_HEAD * TRAPEZE_SIZE * l.tile,
  };
}
