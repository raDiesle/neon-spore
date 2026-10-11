import type { Point } from "@neon-spore/content";
import { drop, type GooBody } from "./goo-body.js";
import { clamp01, mix } from "./goo-noise.js";
import {
  type ArrowAt,
  paintSoftArrows,
  SOFT_HELD,
  SOFT_REACH,
  SOFT_SLIDE,
} from "./goo-soft-arrow.js";
import { CAP_HEIGHT } from "./goo-soft-cap.js";
import type { GooStyle } from "./goo-style.js";
import { PALETTE } from "./palette.js";

/**
 * **The way to pull, inside a GOO drop** — the loudest thing on it: dark
 * under, neon round, near-white on top.
 *
 * The owner, 11 October 2026: *the arrow must be visible from the very
 * beginning growing and also when disappearing it must be visible to the end
 * shrinking*. So it is sized a little ahead of the drop (`arrowSize`): a
 * speck of a drop already carries an arrow that can be seen, and a drop
 * boiling away carries one to its last frame.
 *
 * And, on UP OR DOWN: *make arrows when they show two positions shorter so
 * they can disconnect before pulling, and when pulling in one direction the
 * arrow grows in the regular single arrow size*. So a pull that may go either
 * way shows two short arrows, each sliding out towards its own end with a gap
 * between them (`split` 1); pulled, the one it goes towards grows into the
 * single arrow and the other shrinks away (`split` towards 0).
 *
 * The arrow is moulded into the drop's own lumps (`goo-soft-arrow.ts`), laid on
 * `body` — the drop it is in, when the caller has it. While the drop's cap
 * stands up untouched (`goo-soft-cap.ts`) it is smaller and sits half way up,
 * in the middle of the whole tall cap rather than on its face — the owner,
 * 11 October 2026: *reduce arrow size so it does not overlap with top border
 * and shape — move it more down … so it should look centered of tall area*.
 */

/** How long one of the two short arrows is, as a share of the single one, how far out
 * from the middle it sits, and how far it breathes out and back. Bigger and stiller than
 * they were (0.4, 0.44, 0.07) — the owner, 11 October 2026: *if showing two arrows, try
 * to make the arrows bigger, maybe with less movement inside for more space*. */
const SHORT = 0.62;
const OUT = 0.54;
const BREATHE = 0.02;

/** Radians a second the arrow slides along itself, and two arrows breathe apart — the
 * owner, 11 October 2026: *arrow movement should be slowed down*; it was 5. */
const PACE = 2.2;

/** On a cap standing all the way up: how big the arrow is, as a share of its size on the
 * drop, and how far up it rides, as a share of the cap's height — half, the middle of
 * the face and the wall under it together. */
const ON_CAP = 0.8;
const MIDWAY = 0.5;

/** Where the arrow sits on `laid`, as tall as its cap stands: how big, as a share of
 * its size on a level drop, and how many pixels up. */
export function capSeat(laid: GooBody): { size: number; up: number } {
  const lift = laid.lift ?? 0;
  const stood = clamp01(lift / (laid.r * CAP_HEIGHT));
  return { size: 1 - (1 - ON_CAP) * stood, up: lift * MIDWAY };
}

/** The arrow's radius for a drop grown to `g` of its size: ahead of it while small. */
export function arrowSize(r: number, g: number): number {
  return r * clamp01(g) ** 0.6;
}

/** How far the drop has to go from its start, as a share of the way to an end, before
 * the two arrows of a two-way pull are one. */
const JOINED = 0.16;

/** How much a two-way pull's arrow is still two: 1 at its start, 0 once pulled a way. */
export function splitOf(twoWay: boolean, apart: number): number {
  return twoWay ? 1 - clamp01(Math.abs(apart) / JOINED) : 0;
}

/**
 * The arrow at `at` in a drop of radius `r`, pointing `dx, dy` — the way the
 * pull is going, or for a two-way pull still at rest either of its ways —
 * split into two by `split`.
 */
export function paintArrow(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  style: GooStyle,
  a: {
    dx: number;
    dy: number;
    split: number;
    held: boolean;
    time: number;
    alpha?: number;
    /** How far its neon has turned the green of a count, 0..1. */
    green?: number;
    /** The drop it is in, its cap's lift with it; a round drop of `r` when not given. */
    body?: GooBody;
  },
): void {
  if (r <= 0.05) return;
  const laid = a.body ?? drop(at, r);
  const seat = capSeat(laid);
  const reach = r * (a.held ? SOFT_HELD : SOFT_REACH) * seat.size;
  const s = clamp01(a.split);
  const arrows: ArrowAt[] = [];
  const main = reach * (1 - (1 - SHORT) * s);
  // Apart, they breathe out towards their ends and back, so the gap between them opens.
  const shift = reach * s * (OUT + BREATHE * Math.sin(a.time * PACE));
  arrows.push({ x: at.x + a.dx * shift, y: at.y + a.dy * shift, r: main, dx: a.dx, dy: a.dy });
  if (s > 0.02)
    arrows.push({
      x: at.x - a.dx * shift,
      y: at.y - a.dy * shift,
      r: reach * SHORT * s,
      dx: -a.dx,
      dy: -a.dy,
    });
  const alpha = a.alpha ?? 1;
  const neon = mix(style.neon, PALETTE.good, a.green ?? 0);
  const slide = reach * SOFT_SLIDE * Math.sin(a.time * PACE) * (1 - s);
  const { up } = seat;
  const body = up > 0 ? { ...laid, at: { x: laid.at.x, y: laid.at.y - up } } : laid;
  const slid = arrows.map((w) => ({
    ...w,
    x: w.x + w.dx * slide,
    y: w.y + w.dy * slide - up,
  }));
  paintSoftArrows(ctx, slid, { body, style, time: a.time, neon, alpha });
}
