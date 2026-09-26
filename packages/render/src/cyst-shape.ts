import { blobRadiusMul } from "@neon-spore/content";
import { midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE CYST's geometry**: where the sac stands, and the paths it is made of.
 *
 * **The sac is BULB · CLOVER** (`tools/shape-sheet/src/drafts/offered.ts`):
 * four deep lobes round a middle, *the largest count read without counting*.
 * Its seed is turned so the lobes point right, down, left and up: the left and
 * the right are the two flanks the pair still and pinch, the bottom one is the
 * lobe that spits, and the core sits in the middle under the skin. CLOVER's own
 * objection — four even arms read as a cross — is answered by the sac never
 * holding still: the flanks shudder, pinch in and crack, so it is never even.
 *
 * **Every part of the pose is a change to one radius function** (`cystRadius`),
 * so a pinched flank, a shaking one, the swell and the spitting lobe are all
 * the same outline bent, never a second copy of it. Paths are laid round the
 * sac's middle at the origin; the draw moves the canvas.
 */

export interface Point {
  x: number;
  y: number;
}

/** The row the sac stands at, in tiles below the grid's top. */
const ROW = 2.7;
/** The sac's radius at rest, before its lobes, in tiles. */
const R = 1.3;
/** CLOVER: four lobes this deep, this much wobble. Seed 0 puts a lobe at each compass point. */
const LOBES = 4;
const DEPTH = 0.34;
const WOBBLE = 0.045;
/** Samples round the whole outline. */
const N = 72;
/** The core at its fullest, as a share of the radius. */
const CORE = 0.36;
/** How far in a shut pinch draws its flank, and how far out the spit lobe bulges, as shares. */
const PINCH_IN = 0.3;
const BULGE_OUT = 0.32;
/** How far beside the sac each freeze mark stands, and its radius, in tiles. */
const MARK_X = 2.9;
const MARK_R = 0.42;

/** Which way each lobe points: the pilot's flank left, the navigator's right, the spitting one down. */
export const FLANK_ANGLE = [Math.PI, 0] as const;
const DOWN = Math.PI / 2;

/** How the outline is bent this frame: each flank's pinch and shake, the swell, the spit lobe's bulge. */
export interface CystPose {
  pinch: [number, number];
  shake: [number, number];
  swell: number;
  bulge: number;
  time: number;
}

export const RESTING: CystPose = { pinch: [0, 0], shake: [0, 0], swell: 0, bulge: 0, time: 0 };

/** The middle of the sac: over the middle column, near the top of the field. */
export function cystCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/** How far above its place the sac still is, `arrived` of the way in. */
export function cystLift(l: Layout, arrived: number): number {
  return (1 - arrived) * 3 * l.tile;
}

/** The sac's radius at rest, in pixels. */
export function cystR(l: Layout): number {
  return R * l.tile;
}

/** How much of lobe `at` angle `a` is: one on its tip, nought a quarter-turn away. */
function lobeWeight(a: number, at: number): number {
  return Math.max(0, Math.cos(a - at)) ** 4;
}

/** The outline's radius at angle `a` (0 to the right, `π/2` down), bent by `pose`. */
export function cystRadius(l: Layout, a: number, pose: CystPose): number {
  let m = blobRadiusMul(a, LOBES, DEPTH, WOBBLE, pose.time, 0) * (1 + 0.22 * pose.swell);
  for (const side of [0, 1] as const) {
    const w = lobeWeight(a, FLANK_ANGLE[side]);
    m *= 1 - PINCH_IN * pose.pinch[side] * w + pose.shake[side] * w;
  }
  m *= 1 + BULGE_OUT * pose.bulge * lobeWeight(a, DOWN);
  return cystR(l) * m;
}

/** The whole sac's outline, bent by `pose`. */
export function cystSacPath(l: Layout, pose: CystPose): Path2D {
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i * Math.PI * 2) / N;
    const r = cystRadius(l, a, pose);
    pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  return splinePath(pts, true);
}

/** The tip of the lobe at angle `a`, bent by `pose`. */
export function cystTip(l: Layout, a: number, pose: CystPose): Point {
  const r = cystRadius(l, a, pose);
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
}

/** The core's radius at its fullest, in pixels. */
export function cystCoreR(l: Layout): number {
  return cystR(l) * CORE;
}

/** The core, `size` of its fullest: a round a little flattened, like a pip. */
export function cystCorePath(l: Layout, size: number): Path2D {
  const r = Math.max(0.5, cystCoreR(l) * size);
  const p = new Path2D();
  p.ellipse(0, 0, r, r * 0.88, 0, 0, Math.PI * 2);
  return p;
}

/**
 * The crack across flank `side`'s lobe, a jagged run from the core's edge out
 * toward its tip; `along` of it is drawn, so a crack is read spreading.
 */
export function cystCrackPath(l: Layout, side: 0 | 1, pose: CystPose, along = 1): Path2D {
  const a = FLANK_ANGLE[side];
  const from = cystCoreR(l) * 1.15;
  const to = cystRadius(l, a, pose) * 0.9;
  const steps = 6;
  const p = new Path2D();
  const upto = Math.max(0, Math.min(1, along));
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * upto;
    const r = from + (to - from) * t;
    const jag = (i % 2 === 0 ? 1 : -1) * 0.16 * Math.sin(t * Math.PI + 0.4);
    const x = Math.cos(a + jag) * r;
    const y = Math.sin(a + jag) * r;
    if (i === 0) p.moveTo(x, y);
    else p.lineTo(x, y);
  }
  return p;
}

/** Freeze mark `side`'s middle and radius: beside its flank, off the sac. */
export function cystMarkAt(l: Layout, side: 0 | 1): Point & { r: number } {
  return { x: (side === 0 ? -1 : 1) * MARK_X * l.tile, y: 0, r: MARK_R * l.tile };
}
