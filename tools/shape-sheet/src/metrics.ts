import type { Point } from "@neon-spore/content";
import type { Subject } from "./contour.js";

/**
 * Numbers about a silhouette, so that judging one does not always cost a look.
 *
 * Most shape work is nudging a parameter and asking "is that more or less than
 * before?" — a question a measurement answers better than a picture, and one
 * you can put in a diff. The sheets stay for the questions that genuinely need
 * an eye; these are for the ones that do not.
 */

/** The fastest of the three wobble layers: `sin(t * 0.9)`. One visible cycle. */
export const WOBBLE_PERIOD = (Math.PI * 2) / 0.9;

/**
 * The slowest layer is `sin(t * 0.31)`, so a window this long contains every
 * layer's extremes. The layers are not commensurate — there is no exact common
 * period — so the extremes are found by scanning rather than by solving.
 */
const WINDOW = 64;
const STEP = 0.05;

export interface Metrics {
  /** Bounding box at t = 0, the frame the shape sheet draws. */
  w: number;
  h: number;
  /** Enclosed area at t = 0. Zero for an open contour. */
  area: number;
  /** Contour length at t = 0. */
  length: number;
  /** Furthest any contour point strays from its t = 0 position. Pixels. */
  travel: number;
  /** Peak-to-peak variation in length across the window, as a percentage. */
  breath: number;
}

function bbox(pts: Point[]): { w: number; h: number } {
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const p of pts) {
    if (p.x < x0) x0 = p.x;
    if (p.x > x1) x1 = p.x;
    if (p.y < y0) y0 = p.y;
    if (p.y > y1) y1 = p.y;
  }
  return { w: x1 - x0, h: y1 - y0 };
}

/** Shoelace. Meaningless for an open contour, so callers pass `open`. */
function area(pts: Point[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!;
    const q = pts[(i + 1) % pts.length]!;
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2;
}

function length(pts: Point[], closed: boolean): number {
  let l = 0;
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const p = pts[i]!;
    const q = pts[(i + 1) % pts.length]!;
    l += Math.hypot(q.x - p.x, q.y - p.y);
  }
  return l;
}

function strayed(base: Point[], pts: Point[]): number {
  let worst = 0;
  for (let i = 0; i < pts.length; i++) {
    const d = Math.hypot(pts[i]!.x - base[i]!.x, pts[i]!.y - base[i]!.y);
    if (d > worst) worst = d;
  }
  return worst;
}

/**
 * Furthest any contour point strays from where it sits at t = 0 — the pupil's
 * points included, because on a ring the inner edge is the one that moves
 * most, and a travel figure blind to it would call the liveliest shape on the
 * sheet the stillest.
 */
export function travel(s: Subject): number {
  const base = s.pointsAt(0);
  const holeBase = s.hole?.(0);
  let worst = 0;
  for (let t = 0; t <= WINDOW; t += STEP) {
    worst = Math.max(worst, strayed(base, s.pointsAt(t)));
    if (holeBase) worst = Math.max(worst, strayed(holeBase, s.hole!(t)));
  }
  return worst;
}

/**
 * Contour length at one moment, both loops of a ring counted. A hole is edge
 * the eye reads exactly like the outer edge, so leaving it out would under-
 * report the shape and, worse, hide the pupil's own breathing inside a figure
 * dominated by a body that barely moves.
 */
function totalLength(s: Subject, t: number, closed: boolean): number {
  const outer = length(s.pointsAt(t), closed);
  return s.hole ? outer + length(s.hole(t), true) : outer;
}

export function measure(s: Subject): Metrics {
  const base = s.pointsAt(0);
  const closed = !s.open;
  const box = bbox(base);
  let lo = Infinity;
  let hi = -Infinity;
  for (let t = 0; t <= WINDOW; t += STEP) {
    const l = totalLength(s, t, closed);
    if (l < lo) lo = l;
    if (l > hi) hi = l;
  }
  const mean = (lo + hi) / 2;
  // Enclosed area is the body less the hole — a ring encloses the material,
  // not the opening, and a figure that counted the pupil would say a shape you
  // can see straight through is as solid as the queen.
  const filled = closed ? area(base) - (s.hole ? area(s.hole(0)) : 0) : 0;
  return {
    w: box.w,
    h: box.h,
    area: filled,
    length: totalLength(s, 0, closed),
    travel: travel(s),
    breath: mean === 0 ? 0 : ((hi - lo) / mean) * 100,
  };
}

/**
 * The narrowest the body ever gets between its two loops, scanned across the
 * wobble window. Only a ring has two loops, so this is `Infinity` for
 * everything else.
 *
 * It is the one measurement a ring needs and no other shape does. A pupil that
 * grows or slides too far crosses the outer edge, and at that moment the shape
 * silently stops being a ring and becomes a crescent — a failure that is
 * invisible at `t = 0` and appears three seconds later at the top of a wobble,
 * which is exactly the kind of thing a still cannot catch and a number can.
 */
export function ringClearance(s: Subject): number {
  if (!s.hole) return Infinity;
  let worst = Infinity;
  for (let t = 0; t <= WINDOW; t += STEP) {
    const outer = s.pointsAt(t);
    for (const h of s.hole(t)) {
      let near = Infinity;
      for (const o of outer) near = Math.min(near, Math.hypot(o.x - h.x, o.y - h.y));
      worst = Math.min(worst, near);
    }
  }
  return worst;
}

export interface Bounds {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/**
 * The box a subject occupies across every given moment. The motion sheet draws
 * several frames at once, so fitting to t = 0 alone would clip the wobble.
 */
export function boundsOver(s: Subject, times: number[]): Bounds {
  const b: Bounds = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
  for (const t of times) {
    for (const p of s.pointsAt(t)) {
      if (p.x < b.x0) b.x0 = p.x;
      if (p.x > b.x1) b.x1 = p.x;
      if (p.y < b.y0) b.y0 = p.y;
      if (p.y > b.y1) b.y1 = p.y;
    }
  }
  return b;
}
