import type { Point } from "@neon-spore/content";
import { midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE HALTER's geometry**: where the seam is, and the plates it is made of.
 *
 * **The body is THE TITHE · EDGE** (`tools/shape-sheet/src/drafts/collected.ts`,
 * the plated slab, *bevelled on top, square below*), at its own proportions
 * and cut along one **spinal seam** — a line straight through the slab from
 * end to end, the plating hugged shut over it from above and below. The seam
 * is three segments, a third of the slab each: the left, the centre and the
 * right. A segment is two plates, one over the seam and one under it, and it
 * cracks by those two parting; the centre, parted, bares what the plating
 * was hugging. THE TITHE's seven hanging plates are six here, two under each
 * segment, so a segment is read as a unit of the body and not as a column.
 *
 * The whole slab is bent over a hunched spine (`halterBend`), highest at the
 * middle, so it reads as a back braced against a touch rather than a shelf.
 *
 * Every path is laid round the seam's middle at the origin; the draw moves
 * the canvas, so the drop in, the parting and the tremor are transforms.
 */

/** The row the seam stands at, in tiles below the grid's top. */
const ROW = 2.6;
/** THE TITHE at its own numbers, its half-width scaled to `HALF_W` tiles. */
const TITHE = { rx: 124, ry: 30, drop: 9 };
const HALF_W = 2.8;
/** How far the spine hunches up at its middle, in tiles: the seam is a back, not a ruler. */
const ARCH = 0.35;
/** Hanging plates under each segment, and the share of a plate's width inset either side. */
const TEETH = 2;
const TOOTH_PAD = 0.19;
/** How far each plate of a segment parts from the seam, fully cracked, in tiles. */
const GAP = 0.32;
/** The core's radius at its fullest, in tiles; a grip's, in tiles. */
const CORE = 0.3;
const GRIP = 0.13;
/** How far in from a segment's ends its grips sit, as a share of the segment. */
const GRIP_IN = 0.16;
/** How far the seam drops in from arriving, in tiles. */
const DROP = 2;

/** The seam's middle: over the middle column, near the top of the field. */
export function halterCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/** The seam's middle where it stands this frame, dropped in `arrived` of the way. */
export function halterAt(l: Layout, cfg: SimConfig, arrived: number): Point {
  const home = halterCentre(l, cfg);
  return { x: home.x, y: home.y - (1 - arrived) * DROP * l.tile };
}

/** The slab's half-width, a plate's height either side of the seam, and a hanging plate's drop, in pixels. */
export function halterSize(l: Layout): { rx: number; ry: number; drop: number } {
  const k = (HALF_W * l.tile) / TITHE.rx;
  return { rx: TITHE.rx * k, ry: TITHE.ry * k, drop: TITHE.drop * k };
}

/** Segment `k`'s ends along the seam: nought the left, one the centre, two the right. */
export function halterSpan(l: Layout, k: 0 | 1 | 2): { x0: number; x1: number } {
  const { rx } = halterSize(l);
  const w = (rx * 2) / 3;
  return { x0: -rx + k * w, x1: -rx + (k + 1) * w };
}

/** How high the hunched spine stands at `x` along the seam, in pixels up (negative y). */
export function halterBend(l: Layout, x: number): number {
  const { rx } = halterSize(l);
  const u = Math.max(-1, Math.min(1, x / rx));
  return -ARCH * l.tile * (1 - u * u);
}

/** Where the core sits in the seam's frame: the middle segment's middle, up on the hunch. */
export function halterCoreAt(l: Layout): Point {
  const x = (halterSpan(l, 1).x0 + halterSpan(l, 1).x1) / 2;
  return { x, y: halterBend(l, x) };
}

/** How far a plate stands off the seam, in pixels, `open` of the way cracked. */
export function halterGap(l: Layout, open: number): number {
  return GAP * l.tile * open;
}

/** The plate over the seam in segment `k`: an outer corner bevelled, as THE TITHE's shoulders are. */
export function halterUpperPath(l: Layout, k: 0 | 1 | 2): Path2D {
  const { ry } = halterSize(l);
  const { x0, x1 } = halterSpan(l, k);
  const ch = ry * 0.9;
  const pts: Point[] = [];
  pts.push(k === 0 ? { x: x0, y: -ry + ch } : { x: x0, y: -ry });
  if (k === 0) pts.push({ x: x0 + ch, y: -ry });
  if (k === 2) pts.push({ x: x1 - ch, y: -ry });
  pts.push(k === 2 ? { x: x1, y: -ry + ch } : { x: x1, y: -ry });
  pts.push({ x: x1, y: 0 }, { x: x0, y: 0 });
  return bentPath(l, pts);
}

/** The plate under the seam in segment `k`, square below, with its two hanging plates. */
export function halterLowerPath(l: Layout, k: 0 | 1 | 2): Path2D {
  return polygon(halterLowerPoints(l, k));
}

/** The points `halterLowerPath` is drawn through, bent as it is, about the slab's middle. */
export function halterLowerPoints(l: Layout, k: 0 | 1 | 2): Point[] {
  const { ry, drop } = halterSize(l);
  const { x0, x1 } = halterSpan(l, k);
  const w = (x1 - x0) / TEETH;
  const pad = w * TOOTH_PAD;
  const pts: Point[] = [
    { x: x0, y: 0 },
    { x: x1, y: 0 },
  ];
  for (let i = TEETH - 1; i >= 0; i--) {
    const xR = x0 + (i + 1) * w;
    const xL = x0 + i * w;
    pts.push({ x: xR, y: ry }, { x: xR - pad, y: ry }, { x: xR - pad, y: ry + drop });
    pts.push({ x: xL + pad, y: ry + drop }, { x: xL + pad, y: ry });
  }
  pts.push({ x: x0, y: ry });
  return bentPoints(l, pts);
}

/** Segment `k`'s stretch of the seam: the line that glows when that segment is asked for. */
export function halterSeamPath(l: Layout, k: 0 | 1 | 2): Path2D {
  const { x0, x1 } = halterSpan(l, k);
  const inset = (x1 - x0) * 0.06;
  const p = new Path2D();
  for (let i = 0; i <= SUB; i++) {
    const x = x0 + inset + ((x1 - x0 - 2 * inset) * i) / SUB;
    if (i === 0) p.moveTo(x, halterBend(l, x));
    else p.lineTo(x, halterBend(l, x));
  }
  return p;
}

/**
 * What a parted segment shows between its plates: the soft body the plating
 * was hugging, `gap` pixels either side of the seam — squared off along the
 * seam and round at its ends, a slot rather than an eye.
 */
export function halterFleshPath(l: Layout, k: 0 | 1 | 2, gap: number): Path2D {
  const { x0, x1 } = halterSpan(l, k);
  const cx = (x0 + x1) / 2;
  const hw = (x1 - x0) * 0.44;
  const hh = Math.max(0.5, gap * 1.05);
  const pts: Point[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    const c = Math.cos(a);
    const x = cx + Math.sign(c) * Math.abs(c) ** 0.45 * hw;
    pts.push({ x, y: halterBend(l, x) + Math.sin(a) * hh });
  }
  return splinePath(pts, true);
}

/** Grip `side` of segment `k`, on the seam near its end: nought the left one, one the right. */
export function halterGripAt(l: Layout, k: 0 | 1 | 2, side: 0 | 1): Point {
  const { x0, x1 } = halterSpan(l, k);
  const inset = (x1 - x0) * GRIP_IN;
  const x = side === 0 ? x0 + inset : x1 - inset;
  return { x, y: halterBend(l, x) };
}

/** A grip's radius, in pixels. */
export function halterGripR(l: Layout): number {
  return GRIP * l.tile;
}

/** The core's radius at its fullest, in pixels. */
export function halterCoreR(l: Layout): number {
  return CORE * l.tile;
}

/** Pieces each long edge is cut into so it follows the hunch. */
const SUB = 6;

/** A closed outline laid flat, every edge cut into pieces and lifted over the hunched spine. */
function bentPath(l: Layout, pts: readonly Point[]): Path2D {
  return polygon(bentPoints(l, pts));
}

function bentPoints(l: Layout, pts: readonly Point[]): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i] as Point;
    const b = pts[(i + 1) % pts.length] as Point;
    const n = Math.abs(b.x - a.x) > l.tile * 0.3 ? SUB : 1;
    for (let j = 0; j < n; j++) {
      const x = a.x + ((b.x - a.x) * j) / n;
      out.push({ x, y: a.y + ((b.y - a.y) * j) / n + halterBend(l, x) });
    }
  }
  return out;
}

function polygon(pts: readonly Point[]): Path2D {
  const p = new Path2D();
  for (let i = 0; i < pts.length; i++) {
    const q = pts[i] as Point;
    if (i === 0) p.moveTo(q.x, q.y);
    else p.lineTo(q.x, q.y);
  }
  p.closePath();
  return p;
}
