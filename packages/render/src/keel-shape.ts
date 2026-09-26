import { keelSegCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **Where THE KEEL is**, in field pixels: six segments arched along the top of
 * the field, the ribs hung under them, the socket between the middle two and
 * the rock the tail throws. How far through a pose the spine is lives next
 * door (`keel-pose.ts`).
 *
 * Its own file for THE GIMBAL's reason (`gimbal-shape.ts`): the thumb that
 * taps a joint will be answered at the segment this file puts on the screen,
 * never at a second copy of it.
 *
 * **The silhouette is two drafts combined** (`tools/shape-sheet`): THE
 * CANOPY's faceted arc — straight facets on an arch over the whole field, so
 * how much of it is left is a shape a pair can point at — with each facet
 * made one of THE BRISTLE's squared-off lozenges, its fringe kept only on the
 * underside and thinned to the ribs. THE CANOPY alone is a barrier, and THE
 * BRISTLE alone a hairy creature; the arch of fringed plates is a ribcage,
 * which is the one picture §24 asks for.
 *
 * **Each segment sits over its own column** (`keelSegCol`), so the joint a
 * thumb taps is over the column the simulation judges it in, and the arch is
 * the height alone. Everything on a segment is placed through one function,
 * `put`, which is where a segment sags, sways, hinges apart at the midpoint
 * and whips at the tail — so a plate, its seam, its ribs and the tendon to its
 * neighbour can never come apart from one another.
 */

export interface Point {
  x: number;
  y: number;
}

/** What one segment is doing, in tiles and radians: the pose `keel-pose.ts` reads off the world. */
export interface SegPose {
  /** Turned about its own middle: the loose sway, the split's hinge and the tail's whip together. */
  turn: number;
  /** Hung below its place on the arch, in tiles — a loose segment sags. */
  sag: number;
  /** Pushed along the arch, in tiles, outward from the middle while the midpoint is split. */
  shift: number;
}

/** One segment as it is drawn this frame: where its middle is, the arch's slope there, and its pose. */
export interface Seg {
  centre: Point;
  slope: number;
  pose: SegPose;
}

/** The row the arch's two ends hang in, and how high its middle stands over them at full tension, in tiles. */
const ENDS_ROW = 2.3;
export const RISE = 1.25;
/**
 * Half a segment's length along the arch and half its depth, in tiles. Half a
 * tile of length keeps each plate inside its own column, so the two at the
 * ends stop at the field's edge rather than past it.
 */
const HW = 0.5;
const HH = 0.3;
/** THE BRISTLE's squareness: the superellipse exponent, and the samples round one plate. */
const BOXY = 3.4;
const ROUND = 16;
/** Ribs under each segment, how long they hang in tiles, and where along the plate they are tied. */
export const RIB_U = [-0.55, 0, 0.55] as const;
export const RIB = 0.6;

/**
 * The unposed middle of segment `k` of `n`: over its column, and up by the
 * arch's rise at its share of the way across. `rise` is in tiles and `lift`
 * in pixels, the drop into frame.
 */
export function keelSegCentre(
  l: Layout,
  cfg: SimConfig,
  k: number,
  n: number,
  rise: number,
  lift: number,
): Point {
  const f = (k + 0.5) / n;
  const y = l.gridTop + (ENDS_ROW - rise * Math.sin(Math.PI * f)) * l.tile - lift;
  return { x: fieldX(l, keelSegCol(k, n, cfg.cols)), y };
}

/** The arch's own slope at segment `k`, from its neighbours on the screen — a turned screen turns it too. */
export function keelSegSlope(
  l: Layout,
  cfg: SimConfig,
  k: number,
  n: number,
  rise: number,
): number {
  const a = keelSegCentre(l, cfg, Math.max(0, k - 0.5), n, rise, 0);
  const b = keelSegCentre(l, cfg, Math.min(n - 1, k + 0.5), n, rise, 0);
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * The one place a point on a segment becomes a pixel. `u` runs -1 to 1 along
 * it, left to right as the screen has it, and `v` -1 on its back to 1 on its
 * belly, where the ribs hang. The slope is the arch's; the pose's turn, sag
 * and shift are added on top about the segment's own middle.
 */
export function put(
  l: Layout,
  centre: Point,
  slope: number,
  pose: SegPose,
  u: number,
  v: number,
): Point {
  const t = l.tile;
  const a = slope + pose.turn;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const x = u * HW * t;
  const y = v * HH * t;
  const ox = centre.x + pose.shift * t * Math.cos(slope);
  const oy = centre.y + pose.sag * t + pose.shift * t * Math.sin(slope);
  return { x: ox + x * c - y * s, y: oy + x * s + y * c };
}

/** One segment's plate: THE BRISTLE's squared-off lozenge, placed through `put`. */
export function keelPlatePath(l: Layout, centre: Point, slope: number, pose: SegPose): Path2D {
  const p = new Path2D();
  for (let i = 0; i < ROUND; i++) {
    const a = (i / ROUND) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const u = Math.sign(c) * Math.abs(c) ** (2 / BOXY);
    const v = Math.sign(s) * Math.abs(s) ** (2 / BOXY);
    const q = put(l, centre, slope, pose, u, v);
    if (i === 0) p.moveTo(q.x, q.y);
    else p.lineTo(q.x, q.y);
  }
  p.closePath();
  return p;
}

/** The white seam a locked segment carries, end to end along its middle. */
export function keelSeamPath(l: Layout, centre: Point, slope: number, pose: SegPose): Path2D {
  const a = put(l, centre, slope, pose, -0.72, 0);
  const b = put(l, centre, slope, pose, 0.72, 0);
  const p = new Path2D();
  p.moveTo(a.x, a.y);
  p.lineTo(b.x, b.y);
  return p;
}

/**
 * The ribs hung under a segment: THE BRISTLE's fringe, three to a plate and
 * curled toward the arch's middle. `lag` is how far a loose one trails its
 * plate's sway, in share of its length; a locked one hangs straight.
 */
export function keelRibsPath(
  l: Layout,
  centre: Point,
  slope: number,
  pose: SegPose,
  inward: number,
  lag: number,
): Path2D {
  const p = new Path2D();
  const drop = RIB / HH;
  for (const u of RIB_U) {
    const from = put(l, centre, slope, pose, u, 0.9);
    const bend = put(l, centre, slope, pose, u + 0.18 * inward + 0.4 * lag, 0.9 + drop * 0.55);
    const to = put(l, centre, slope, pose, u + 0.36 * inward + lag, 0.9 + drop);
    p.moveTo(from.x, from.y);
    p.quadraticCurveTo(bend.x, bend.y, to.x, to.y);
  }
  return p;
}

/** A segment's end, `end` -1 its left and 1 its right: where a tendon ties and where the split shows its face. */
export function keelSegEnd(
  l: Layout,
  centre: Point,
  slope: number,
  pose: SegPose,
  end: -1 | 1,
): Point {
  return put(l, centre, slope, pose, end, 0);
}

/**
 * A segment's cut end-face, seen when the midpoint hinges apart — the one
 * change of perspective: the plate turned far enough to show the socket of
 * bone it was seated in. `open` 0 is edge-on and nothing, 1 the full face.
 */
export function keelFacePath(
  l: Layout,
  centre: Point,
  slope: number,
  pose: SegPose,
  end: -1 | 1,
  open: number,
): Path2D {
  const at = keelSegEnd(l, centre, slope, pose, end);
  const p = new Path2D();
  p.ellipse(
    at.x,
    at.y,
    Math.max(0.5, HH * 0.75 * open * l.tile),
    HH * 0.95 * l.tile,
    slope + pose.turn,
    0,
    Math.PI * 2,
  );
  return p;
}

/** The radius of the ring round a lit joint, in pixels: wide enough to circle the whole plate, corners and all. */
export function keelRingRadius(l: Layout): number {
  return Math.hypot(HW, HH) * 1.12 * l.tile;
}

/** Where the ring round the joint at `at` is centred: on it, moved in only as far as keeps a ring of radius `r` inside the field. */
export function keelRingCentre(l: Layout, at: Point, r: number): Point {
  const x = Math.min(Math.max(at.x, l.gridLeft + r), l.gridLeft + l.gridWidth - r);
  return { x, y: at.y };
}

/**
 * Where the tail's rock is, `along` 0 at the tail to 1 on the hull, in the
 * column it was thrown down: drawn there, and the cannon's column is the same
 * one (`sim/keel-step.ts` `throwRock`).
 */
export function keelRockPoint(l: Layout, tail: Point, col: number, along: number): Point {
  const x = fieldX(l, col);
  return {
    x: tail.x + (x - tail.x) * Math.min(1, along * 4),
    y: tail.y + (l.hullY - tail.y) * along,
  };
}
