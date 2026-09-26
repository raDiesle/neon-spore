import { midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE VISE's geometry**: where the seed-case stands, and the paths it is
 * made of.
 *
 * **The case is two drafts combined** (`tools/shape-sheet/src/drafts/`): its
 * outline is BULB · PEAR — one body taller than it is wide and heavier at the
 * bottom, *a fruit hanging* — split down its long axis into the two lobes; and
 * its edge is BULB · BURR's twelve small lobes, *a burr, a seed head, a thing
 * covered in something*, six to a side, so the husk reads dry and bristled
 * rather than as a smooth sac. PEAR's own objection, that tall is the slick's
 * business, does not reach a boss drawn three tiles high over the middle
 * column; BURR's, that the rim shimmers at 26 px, does not reach one drawn at
 * the size of the field.
 *
 * **A lobe is a real half-shell**: it hangs from the hinge at the top of the
 * spine and swings about it, so cracking opens it at the bottom and the kernel
 * is seen between the two — nothing fades (§28, *Animation*).
 *
 * Every path is laid round the case's own middle at the origin, and every
 * lobe path in that lobe's own frame; the draw moves the canvas, so the drop,
 * the hinge, the pinch and the split are transforms and never a second copy of
 * the geometry.
 */

export interface Point {
  x: number;
  y: number;
}

/** The row the case stands at, in tiles below the grid's top. */
const ROW = 2.7;
/** The case's half-height, and its half-width at the widest, in tiles. */
const RY = 1.45;
const RX = 1.1;
/** How much narrower PEAR's top is than its bottom, as a share of the width. */
const TAPER = 0.26;
/** BURR's edge: twelve lobes round the whole case, this deep. */
const BURR = 12;
const BURR_DEPTH = 0.035;
/** Samples down one lobe's outer edge. */
const N = 48;
/** The hollow the kernel sits in, and the kernel at its fullest, as shares of the width. */
const HOLLOW = 0.62;
const KERNEL = 0.36;
/** Where the kernel sits, as a share of the half-height below the middle — in the heavy end. */
const KERNEL_Y = 0.22;

/** The middle of the case: over the middle column, near the top of the field. */
export function viseCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/** How far above its place the case still is, `arrived` of the way in. */
export function viseLift(l: Layout, arrived: number): number {
  return (1 - arrived) * 3 * l.tile;
}

/** The case's half-height and half-width, in pixels. */
export function viseRadius(l: Layout): { ry: number; rx: number } {
  return { ry: RY * l.tile, rx: RX * l.tile };
}

/** The hinge both lobes swing about: the top of the spine. */
export function viseHinge(l: Layout): Point {
  return { x: 0, y: -viseRadius(l).ry };
}

/** The kernel's middle, and its radius at its fullest, in pixels. */
export function viseKernel(l: Layout): Point & { r: number } {
  const { ry, rx } = viseRadius(l);
  return { x: 0, y: ry * KERNEL_Y, r: rx * KERNEL };
}

/**
 * A point on the case's outline at angle `a` (top at `-π/2`): PEAR's
 * proportion, narrowed toward the top, with BURR's bristle on it. Symmetric
 * about the spine, so the two lobes are one another's mirror.
 */
function edge(l: Layout, a: number): Point {
  const { ry, rx } = viseRadius(l);
  const down = (Math.sin(a) + 1) / 2;
  const widen = 1 - TAPER * (1 - down);
  const burr = 1 + BURR_DEPTH * Math.cos(BURR * (a + Math.PI / 2));
  return { x: Math.cos(a) * rx * widen * burr, y: Math.sin(a) * ry * burr };
}

/**
 * One lobe's outer edge, top to bottom: the navigator's (`side` 1) on the
 * right, the pilot's (`side` 0) its mirror on the left.
 */
function lobeEdge(l: Layout, side: 0 | 1): Point[] {
  const flip = side === 0 ? -1 : 1;
  const pts: Point[] = [];
  for (let i = 0; i <= N; i++) {
    const p = edge(l, -Math.PI / 2 + (i * Math.PI) / N);
    pts.push({ x: p.x * flip, y: p.y });
  }
  return pts;
}

/** Lobe `side`'s shell: its bristled outer edge, closed along the spine. */
export function viseLobePath(l: Layout, side: 0 | 1): Path2D {
  const pts = lobeEdge(l, side);
  const p = splinePath(pts, false);
  const { ry } = viseRadius(l);
  p.lineTo(0, ry);
  p.lineTo(0, -ry);
  return p;
}

/** The spine: the hairline down the middle the two lobes part along. */
export function viseSpinePath(l: Layout): Path2D {
  const { ry } = viseRadius(l);
  const p = new Path2D();
  p.moveTo(0, -ry * 0.96);
  p.lineTo(0, ry * 0.96);
  return p;
}

/**
 * Seam `k` of lobe `side`, as a jagged run down the shell: the first well out
 * on the lobe, the second — §28's *tighter* seam — close in by the spine.
 * `along` of it is drawn, from the top, so a crack is read spreading.
 */
export function viseSeamPath(l: Layout, side: 0 | 1, k: number, along = 1): Path2D {
  const { ry, rx } = viseRadius(l);
  const flip = side === 0 ? -1 : 1;
  const out = k === 0 ? 0.58 : 0.3;
  const steps = 7;
  const p = new Path2D();
  const upto = Math.max(0, Math.min(1, along));
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * upto;
    const y = -ry * 0.78 + t * ry * 1.6;
    const bow = Math.sin(t * Math.PI) * 0.12;
    const jag = (i % 2 === 0 ? 1 : -1) * 0.035 * (1 - Math.abs(0.5 - t));
    const x = flip * rx * (out + bow + jag) * (0.8 + 0.2 * t);
    if (i === 0) p.moveTo(x, y);
    else p.lineTo(x, y);
  }
  return p;
}

/** The hollow between the lobes the kernel lies in. */
export function viseHollowPath(l: Layout): Path2D {
  const { ry, rx } = viseRadius(l);
  const k = viseKernel(l);
  const p = new Path2D();
  p.ellipse(0, k.y * 0.6, rx * HOLLOW, ry * 0.72, 0, 0, Math.PI * 2);
  return p;
}

/** The kernel, `size` of its fullest: a dull oval, pointed a little at the top like a seed. */
export function viseKernelPath(l: Layout, size: number): Path2D {
  const k = viseKernel(l);
  const r = Math.max(0.5, k.r * size);
  const pts: Point[] = [];
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 16;
    const tip = 1 + 0.22 * Math.max(0, -Math.sin(a)) ** 3;
    pts.push({ x: k.x + Math.cos(a) * r * 0.82, y: k.y + Math.sin(a) * r * tip });
  }
  return splinePath(pts, true);
}
