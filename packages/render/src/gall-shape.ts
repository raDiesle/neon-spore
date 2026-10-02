import { blobRadiusMul, type Point } from "@neon-spore/content";
import { GALL_POINTS, gallPointCol, midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE GALL's geometry**: where the seam runs, where its four points sit,
 * and what the nodule on it is made of.
 *
 * **The body is two drafts combined** (`tools/shape-sheet/src/drafts/`):
 * THE NEEDLE's straight corridor, barely bending (`systems.ts`, an arm 130
 * long at a bend of 0.16), laid across the whole field as the raised seam —
 * the one draft that crosses columns — and NOTCH 2's heeled mass
 * (`creatures.ts`, 33 by 31, heel 0.42) for the nodule riding it, fat on the
 * side it leans and lean behind. The lean is the seat's: the nodule heels
 * toward the end of the seam whose seat is nearer it, so *whose* is read off
 * the whole body and not off a mark.
 *
 * Every nodule path is laid round the point's own middle at the origin; the
 * draw moves the canvas there, so the jump to another point is a translate
 * and nothing in between — the single frame §38 asks for.
 */

/** The row the seam runs along, in tiles below the grid's top. */
const ROW = 3.4;
/** THE NEEDLE's bend, and how far it reaches, in tiles, at a bend of one. */
const NEEDLE_BEND = 0.16;
const REACH = 1.2;
/** The seam's half-thickness at its middle and at its ends, in tiles. */
const RIDGE = 0.26;
const RIDGE_END = 0.07;
/** NOTCH 2 at its own numbers, its half-width scaled to `HALF_W` tiles. */
const NOTCH = { rx: 33, ry: 31, heel: 0.42 };
const HALF_W = 0.82;
/** The root's radius at its fullest, in tiles. */
const ROOT = 0.36;
/** Samples along the seam, and round the nodule. */
const ALONG = 28;
const N = 48;

/** The pixel row the seam runs along. */
export function gallSeamY(l: Layout): number {
  return l.gridTop + ROW * l.tile;
}

/** Point `point`'s middle on the seam, before the ripple. */
export function gallPointAt(l: Layout, cfg: SimConfig, point: number): Point {
  return { x: fieldX(l, gallPointCol(cfg, point)), y: gallSeamY(l) };
}

/** Every point on the seam, left to right. */
export function gallPoints(l: Layout, cfg: SimConfig): Point[] {
  return Array.from({ length: GALL_POINTS }, (_, p) => gallPointAt(l, cfg, p));
}

/** The root's middle: the seam over the middle column. */
export function gallRootAt(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: gallSeamY(l) };
}

/**
 * How far the seam is lifted at `x` this instant, in pixels: THE NEEDLE's
 * bend, run along it so it lags toward the ends, `ripple` times as big — one
 * standing, more between closes.
 */
export function gallRipple(l: Layout, x: number, time: number, ripple: number): number {
  const f = (x - l.gridLeft) / Math.max(1, l.cols * l.tile);
  const bend = Math.sin(time * 0.9 - f * 1.4 * Math.PI) * NEEDLE_BEND;
  return bend * REACH * l.tile * ripple;
}

/**
 * The raised seam, across the whole field: a ridge thickest in the middle
 * and thin at the ends, lifted by the ripple, and `part` of the way split
 * open over the root — nought one unbroken ridge, one its two lips peeled
 * back to show it.
 */
export function gallSeamPath(l: Layout, time: number, ripple: number, part: number): Path2D {
  const x0 = l.gridLeft;
  const w = l.cols * l.tile;
  const mid = x0 + w / 2;
  const p = new Path2D();
  if (part <= 0.01) {
    p.addPath(ridge(l, x0, x0 + w, time, ripple));
    return p;
  }
  const gap = gallSeamGap(l, part);
  p.addPath(ridge(l, x0, mid - gap, time, ripple));
  p.addPath(ridge(l, mid + gap, x0 + w, time, ripple));
  return p;
}

/** How far either lip stands back from the middle column with the seam `part` of the way peeled, in pixels. */
export function gallSeamGap(l: Layout, part: number): number {
  return part * ROOT * 1.6 * l.tile;
}

/** One stretch of the ridge from `a` to `b`, closed round its own two edges. */
function ridge(l: Layout, a: number, b: number, time: number, ripple: number): Path2D {
  const half = (l.cols * l.tile) / 2;
  const mid = l.gridLeft + half;
  const y0 = gallSeamY(l);
  const top: Point[] = [];
  const bottom: Point[] = [];
  for (let i = 0; i <= ALONG; i++) {
    const x = a + (i / ALONG) * (b - a);
    const u = Math.abs(x - mid) / half;
    const t = (RIDGE - (RIDGE - RIDGE_END) * u * u) * l.tile;
    const y = y0 + gallRipple(l, x, time, ripple);
    top.push({ x, y: y - t });
    bottom.push({ x, y: y + t * 0.7 });
  }
  return splinePath([...top, ...bottom.reverse()], true);
}

/**
 * The seam's underside over screen `x`, as `ridge` lays it, or `null` past
 * its ends or in the gap it parts at over the root.
 */
export function gallSeamFoot(
  l: Layout,
  x: number,
  time: number,
  ripple: number,
  part: number,
): number | null {
  const half = (l.cols * l.tile) / 2;
  const mid = l.gridLeft + half;
  const u = Math.abs(x - mid) / half;
  if (u > 1) return null;
  if (part > 0.01 && Math.abs(x - mid) < gallSeamGap(l, part)) return null;
  const t = (RIDGE - (RIDGE - RIDGE_END) * u * u) * l.tile;
  return gallSeamY(l) + gallRipple(l, x, time, ripple) + t * 0.7;
}

/** The nodule's half-width and half-height at its fullest, in pixels. */
export function gallSize(l: Layout): { rx: number; ry: number } {
  const k = (HALF_W * l.tile) / NOTCH.rx;
  return { rx: NOTCH.rx * k, ry: NOTCH.ry * k };
}

/**
 * NOTCH 2's heeled mass, round its own middle: `lobes` lobes breathing on
 * `time`, heeled toward `bearing` (nought the right, π the left) by `heel` of
 * the draft's own, `size` of its fullest, and pinched `pinch` of the way —
 * squeezed across the way two fingers close on it and pushed up out of the
 * seam — then `sunk` of the way down into it.
 */
export function gallNodulePath(
  l: Layout,
  opts: {
    lobes: number;
    time: number;
    bearing: number;
    heel: number;
    size: number;
    pinch: number;
    sunk: number;
  },
): Path2D {
  const { rx, ry } = gallSize(l);
  const across = opts.size * (1 - 0.45 * opts.pinch);
  const up = opts.size * (1 + 0.3 * opts.pinch) * (1 - 0.7 * opts.sunk);
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const lean = 1 + NOTCH.heel * opts.heel * Math.cos(a - opts.bearing);
    const m = blobRadiusMul(a, opts.lobes, 0.16, 0.05, opts.time, 5.2) * lean;
    const y = Math.sin(a) * ry * m * up;
    // The underside is flattened onto the seam: it grows out of it, not on it.
    pts.push({ x: Math.cos(a) * rx * m * across, y: y > 0 ? y * 0.35 : y });
  }
  return splinePath(pts, true);
}

/** The root's radius at its fullest, in pixels. */
export function gallRootR(l: Layout): number {
  return ROOT * l.tile;
}
