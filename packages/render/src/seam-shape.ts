import { midCol, SEAM_POINTS, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE SEAM's geometry**: where the ridge stands, and the paths it is made of.
 *
 * **The ridge is THE RIND** (`tools/shape-sheet/src/drafts/tower-defence.ts`,
 * the `shed` form in `forms/spanning.ts`): three sizes stepped down by a
 * fifth, the rim toothed while a layer is armoured and smooth once it is
 * shed. Here the three sizes are stood on end down the middle column, one
 * lobe to a point on the crack, and what sheds a lobe's teeth is its point
 * sealing — so the health is read off the outline as well as off the crack.
 *
 * Every path is laid round the ridge's own middle at the origin; the draw
 * moves the canvas there, so the settle and the split are one translation
 * and never a second copy of the geometry.
 */

export interface Point {
  x: number;
  y: number;
}

/** The rows the ridge spans, top and bottom, and so its middle. */
const TOP = 0.6;
const BOTTOM = 5.4;
/** Half the widest lobe's width, in tiles. */
const WIDTH = 1.05;
/** THE RIND's step: each lobe a fifth smaller than the one above. */
const STEP = 0.19;
/** THE RIND's teeth round a whole layer, and how deep each is cut. */
const TEETH = 9;
const CUT = 0.1;
/** The narrowest the ridge gets between lobes, as a share of the widest. */
const NECK = 0.4;
/** Samples down each side. */
const N = 40;
/** The crack's half-width along its spine, at a sealed point, and at an open one, in tiles. */
const HAIR = 0.035;
const SEALED = 0.06;
const OPEN = 0.2;
/** How much further the whole crack opens while it throws grit, in tiles. */
const GAPE = 0.09;

/** The middle of the ridge: the middle column, halfway down its rows. */
export function seamCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ((TOP + BOTTOM) / 2) * l.tile };
}

/** How far above its place the ridge still is, `arrived` of the way in. */
export function seamLift(l: Layout, arrived: number): number {
  return (1 - arrived) * 3 * l.tile;
}

/** The ridge's half-height, in pixels. */
export function seamHalfHeight(l: Layout): number {
  return ((BOTTOM - TOP) / 2) * l.tile;
}

/** Lobe `k`'s size: THE RIND's layers, the widest on top. */
function size(k: number): number {
  return 1 - STEP * k;
}

/** Where lobe `k`'s middle is along the ridge, and its half-height — the lobes share the span by size. */
export function seamLobe(l: Layout, k: number): { y: number; h: number } {
  let total = 0;
  for (let i = 0; i < SEAM_POINTS; i++) total += size(i);
  const span = (BOTTOM - TOP) * l.tile;
  let top = -span / 2;
  for (let i = 0; i < k; i++) top += (span * size(i)) / total;
  const h = (span * size(k)) / total / 2;
  return { y: top + h, h };
}

/** The ridge's half-width at `y` before its teeth, and which lobe `y` is in. */
function profile(l: Layout, y: number): { w: number; k: number; along: number } {
  let best = { w: 0, k: 0, along: 0 };
  for (let k = 0; k < SEAM_POINTS; k++) {
    const { y: c, h } = seamLobe(l, k);
    const u = (y - c) / (h * 1.02);
    const w = WIDTH * l.tile * size(k) * Math.sqrt(Math.max(0, 1 - u * u));
    if (w > best.w) best = { w, k, along: (u + 1) / 2 };
  }
  return { ...best, w: Math.max(best.w, NECK * WIDTH * l.tile) };
}

/**
 * The ridge's outline: down its right side and back up its left, each lobe's
 * rim cut in THE RIND's teeth by `armour[k]` — 1 while its point is open,
 * easing to 0 as it seals. `t` breathes the outline a hundredth of its width.
 */
export function seamRidgePath(l: Layout, armour: readonly number[], t: number): Path2D {
  const half = seamHalfHeight(l);
  const right: Point[] = [];
  const left: Point[] = [];
  for (let i = 1; i < N; i++) {
    const y = -half + (2 * half * i) / N;
    const { w, k, along } = profile(l, y);
    const breath = 1 + 0.01 * Math.sin(t + i * 0.4);
    for (const side of [1, -1] as const) {
      const notch = Math.tanh(Math.sin(TEETH * along * Math.PI + 1.7 + side) * 2.4);
      const m = breath * (1 + CUT * (armour[k] ?? 0) * notch);
      (side > 0 ? right : left).push({ x: side * w * m, y });
    }
  }
  return splinePath([{ x: 0, y: -half }, ...right, { x: 0, y: half }, ...left.reverse()], true);
}

/**
 * The crack down the spine: a hairline that widens at each point — wide while
 * the point is open (`open[k]` 1), a thin closed seam once sealed (0) — and
 * further along its whole length by `gape`, the grit coming. Jagged by a
 * fixed zigzag, so the crack is the same crack every frame.
 */
export function seamCrackPath(l: Layout, open: readonly number[], gape: number): Path2D {
  const half = seamHalfHeight(l) * 0.9;
  const right: Point[] = [];
  const left: Point[] = [];
  for (let i = 0; i <= N; i++) {
    const y = -half + (2 * half * i) / N;
    const x = 0.07 * l.tile * Math.sin(i * 2.7) * (i % 2 === 0 ? 1 : -0.6);
    let w = HAIR + GAPE * gape;
    for (let k = 0; k < SEAM_POINTS; k++) {
      const { y: c, h } = seamLobe(l, k);
      const u = (y - c) / (h * 0.45);
      const bump = Math.max(0, 1 - u * u);
      w += bump * (SEALED + (OPEN - SEALED) * (open[k] ?? 0));
    }
    const taper = Math.min(1, (half - Math.abs(y)) / (0.3 * l.tile));
    right.push({ x: x + w * l.tile * taper, y });
    left.push({ x: x - w * l.tile * taper, y });
  }
  const p = new Path2D();
  p.moveTo(right[0]!.x, right[0]!.y);
  for (const pt of right) p.lineTo(pt.x, pt.y);
  for (const pt of left.reverse()) p.lineTo(pt.x, pt.y);
  p.closePath();
  return p;
}

/** Point `k`'s opening on the crack, as a lens: what the lit point's colour is laid round. */
export function seamPointPath(l: Layout, k: number, scale = 1): Path2D {
  const { y, h } = seamLobe(l, k);
  const p = new Path2D();
  p.ellipse(0, y, OPEN * l.tile * 1.4 * scale, h * 0.5 * scale, 0, 0, Math.PI * 2);
  return p;
}

/** Where a rock or a grit shard leaves the crack: the lowest lobe's middle. */
export function seamMouth(l: Layout): Point {
  return { x: 0, y: seamLobe(l, SEAM_POINTS - 1).y };
}
