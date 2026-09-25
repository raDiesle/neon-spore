import { HEART_POINT, HEART_TOP, heartPoints } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **Where THE FILAMENT's heart is**, in field pixels — the owner, 25
 * September 2026: *its the inner of its body … the hearth inside*. The body
 * over the top of the field is the alien's heart, its lobes above the grid
 * and its point hanging into the top rows, which no filament reaches (the
 * scripts' roots are rows 4 to 6). Every filament is a vein that feeds it,
 * and a vessel on its face stands for each one still to be traced, so it
 * shrinks by one as each is pulled — the health the bundle used to show.
 *
 * The contour is content's (`filament-look.ts`); this places it, sizes it
 * and beats it. It is its own file for the reason `filament-shape.ts` is:
 * the drawer, the bursts and the lead all stand on it.
 */

export interface Point {
  x: number;
  y: number;
}

/** The heart as it hangs this frame: its centre, and the contour's two radii. */
export interface Heart {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

/** How far above the grid the lobes reach, in tiles. */
const TOP_RISE = 1.3;
/** The heart's radius with no filament left in it, and what each one adds, in tiles. */
const EMPTY_R = 1.3;
const VEIN_R = 0.17;
/** Taller than wide by this much. */
const ASPECT = 0.95;
/** How far the heart swells on the beat, and on the second, softer half of it. */
const LUB = 0.05;
const DUB = 0.025;

/** The swell of a heartbeat at `beatPhase` of the beat: a strong lub, a soft dub a quarter later. */
export function heartBeat(beatPhase: number): number {
  const dub = beatPhase - 0.25;
  return LUB * Math.exp(-beatPhase * 9) + (dub > 0 ? DUB * Math.exp(-dub * 9) : 0);
}

/** The heart with `strands` filaments left in it, the lobes held at the same height as it shrinks. */
export function filamentHeart(l: Layout, cfg: SimConfig, strands: number, beatPhase = 0): Heart {
  const x = (tileCX(l, 0) + tileCX(l, cfg.cols - 1)) * 0.5;
  const rx = l.tile * (EMPTY_R + VEIN_R * strands);
  const ry = rx * ASPECT;
  const y = l.gridTop - l.tile * TOP_RISE + HEART_TOP * ry;
  const swell = 1 + heartBeat(beatPhase);
  return { x, y, rx: rx * swell, ry: ry * swell };
}

/** The heart's contour at `time`, a closed spline. */
export function filamentHeartPath(h: Heart, time: number): Path2D {
  const pts = heartPoints(time, h.rx, h.ry).map((p) => ({ x: h.x + p.x, y: h.y + p.y }));
  return splinePath(pts, true);
}

/** The heart's point, where every vein goes in. */
export function filamentHeartPoint(h: Heart): Point {
  return { x: h.x, y: h.y + HEART_POINT * h.ry * 0.9 };
}

/** The middle of the heart once it is empty, where the receipts with no tile burst. */
export function filamentBodyPoint(l: Layout, cfg: SimConfig): Point {
  const h = filamentHeart(l, cfg, 0);
  return { x: h.x, y: h.y };
}

/**
 * Vessel `i` of `n` on the heart's face: from near the point, where the
 * veins go in, up over the lobes, fanned from one side to the other.
 */
export function filamentHeartVessel(h: Heart, i: number, n: number, time: number): Point[] {
  const across = n <= 1 ? 0 : (i / (n - 1)) * 2 - 1;
  const sway = 0.05 * Math.sin(time * 1.7 + i);
  const at = (x: number, y: number): Point => ({ x: h.x + x * h.rx, y: h.y + y * h.ry });
  return [
    at(across * 0.2, 0.45),
    at(across * 0.5 + sway, -0.15),
    at(across * 0.66, -0.75 + 0.3 * Math.abs(across)),
  ];
}
