import { midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **Where THE MANTLE is**, in field pixels: the two valves of its shell, the
 * plates they are laid in, and the two handles hung off their tails. How far
 * through a pose the scene is lives next door (`mantle-pose.ts`).
 *
 * Its own file for THE GIMBAL's reason (`gimbal-shape.ts`): the thumb that
 * pulls a handle will be answered at the knob this file puts on the screen,
 * never at a second copy of it.
 *
 * **The silhouette is two drafts combined** (`tools/shape-sheet`): THE CASE's
 * valve — a beetle's wing case, a shoulder a third of the way down and one
 * long flank to a blunt tail, hinged at the nose — laid in THE SLATER's lapped
 * hard plates, four to a valve, each lapping the one below it. THE CASE alone
 * is THE HASP's clasp, and THE SLATER alone is nothing in the game; the valve
 * made of plates is the only one of the three that can lose its health a band
 * at a time and still be the same shell.
 *
 * Everything below is placed through one function, `put`, which is where a
 * valve bows under the pull, drops at the tail, swings on its hinge and turns
 * edge-on as it goes — so a plate, the rim round it and the handle off its
 * tail can never come apart from one another.
 */

export interface Point {
  x: number;
  y: number;
}

/** A valve: -1 the left (Player 1's handle), 1 the right (Player 2's). Geometry, not a seat. */
export type Side = -1 | 1;

/** What a valve is doing, all in tiles or shares: the pose `mantle-pose.ts` reads off the world. */
export interface ValvePose {
  /** How far the flank bows outward at its middle, in tiles. */
  bow: number;
  /** How far the tail is dragged down by its own handle, in tiles. */
  drop: number;
  /** 0 shut on the seam, 1 swung wide on the hinge. */
  open: number;
}

/** The row the shell's middle hangs in. */
const ROW = 3.1;
/** Half the shut shell's width, and half its length nose to tail, in tiles. */
const RX = 2.0;
const RY = 2.3;
/** How far each valve's seam edge stands off the middle while shut, in tiles. */
const GAP = 0.05;
/** Where one plate ends and the next begins, nose to tail. Four plates a valve. */
export const PLATE_BOUNDS = [0, 0.3, 0.53, 0.77, 1] as const;
/** How far a plate's lower edge laps down over the one beneath, in tiles. */
const LAP = 0.16;
/** How far a valve swings at full gape, in radians. */
const SWING = 0.62;
/** How far a handle's knob hangs below its tail at rest, in tiles, and how far it may be drawn down. */
const HANG = 0.45;
export const TRAVEL = 1.6;
/** Where down the outer flank a handle's strap is tied, nose 0 to tail 1, and how far outboard its knob hangs, in tiles. */
const HANDLE_F = 0.88;
const OUTBOARD = 0.55;
/** Samples down one plate's flank. */
const STEPS = 5;

/** The middle of the shell: the middle column, a few rows down from the top of the field. */
export function mantleCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/**
 * How far above its hanging place the shell is while it drops into frame, in
 * pixels: three rows at `arrived` 0, none once it hangs. The drawing and the
 * grip both place through it, so a knob is answered where the falling shell
 * has it rather than where it will be.
 */
export function mantleLift(l: Layout, arrived: number): number {
  return (1 - arrived) * 3 * l.tile;
}

/** The shell's half-length in pixels, which the core and the leak are sized against. */
export function mantleReach(l: Layout): { rx: number; ry: number } {
  return { rx: RX * l.tile, ry: RY * l.tile };
}

/**
 * The finish's ring round the bared core, a little below the shell's middle
 * where the core itself sits: drawn there (`drawMantleRing`) and tapped
 * there (`mantle-grip.ts`), one circle.
 */
export function mantleRing(l: Layout, at: Point): Point & { r: number } {
  const { rx, ry } = mantleReach(l);
  return { x: at.x, y: at.y + ry * 0.12, r: rx * 0.95 };
}

/**
 * Where the leaking spark's bead is, `along` 0 at the gap under the shell to 1
 * on the hull: drawn there (`mantle-draw.ts`) and put out there
 * (`mantle-fx.ts`), one place.
 */
export function mantleSparkPoint(l: Layout, at: Point, col: number, along: number): Point {
  const from = at.y + RY * l.tile;
  return { x: fieldX(l, col), y: from + (l.hullY - from) * along };
}

/**
 * THE CASE's flank as a share of the half-width, `f` of the way nose to tail:
 * round up to full width over the first third, then one long fall to a blunt
 * tail (`tools/shape-sheet/src/forms/hinged.ts`, unchanged).
 */
function flank(f: number): number {
  if (f < 0.3) return 0.16 + 0.84 * Math.sin((f / 0.3) * (Math.PI / 2));
  return 1 - 0.62 * ((f - 0.3) / 0.7) ** 1.35;
}

/**
 * The one place a point on a valve becomes a pixel. `f` runs nose to tail and
 * `u` seam to outer edge. The bow is widest at mid-flank and nought at the
 * nose and the tail, so the shell swells rather than slides; the drop grows
 * toward the tail, which is where the handle hangs; and the swing turns the
 * whole valve about the hinge at the nose while flattening it toward edge-on
 * — the perspective change, one number, so a plate cannot tip apart from its
 * rim.
 */
export function put(
  l: Layout,
  at: Point,
  side: Side,
  pose: ValvePose,
  f: number,
  u: number,
): Point {
  const t = l.tile;
  const width = RX * flank(f) + pose.bow * Math.sin(Math.PI * f);
  const x = side * (GAP + u * width) * t * (1 - 0.45 * pose.open);
  const y = (2 * RY * f + pose.drop * f * f) * t;
  const turn = -side * SWING * pose.open;
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  return { x: at.x + x * c - y * s, y: at.y - RY * t + x * s + y * c };
}

/** A plate's lower edge, outer corner to seam, lapped down over the one beneath. */
function lapEdge(p: Path2D, l: Layout, at: Point, side: Side, pose: ValvePose, f: number): void {
  for (let i = 0; i <= STEPS; i++) {
    const u = 1 - i / STEPS;
    const q = put(l, at, side, pose, f, u);
    p.lineTo(q.x, q.y + LAP * l.tile * Math.sin(Math.PI * u));
  }
}

/** Plate `k` of a valve, 0 at the nose and 3 at the tail. */
export function mantlePlatePath(
  l: Layout,
  at: Point,
  side: Side,
  pose: ValvePose,
  k: number,
): Path2D {
  const f0 = PLATE_BOUNDS[k] ?? 0;
  const f1 = PLATE_BOUNDS[k + 1] ?? 1;
  const p = new Path2D();
  const start = put(l, at, side, pose, f0, 0);
  p.moveTo(start.x, start.y);
  for (let i = 0; i <= STEPS; i++) {
    const q = put(l, at, side, pose, f0 + ((f1 - f0) * i) / STEPS, 1);
    p.lineTo(q.x, q.y);
  }
  lapEdge(p, l, at, side, pose, f1);
  p.closePath();
  return p;
}

/**
 * The valve's rim: the frame the plates are laid in, which stays when every
 * plate has gone. A shell with its plates off is still a shell — the outline
 * alone says so — and that is what splits down the seam at the end.
 */
export function mantleRimPath(l: Layout, at: Point, side: Side, pose: ValvePose): Path2D {
  const p = new Path2D();
  const nose = put(l, at, side, pose, 0, 0);
  p.moveTo(nose.x, nose.y);
  for (let i = 0; i <= STEPS * 4; i++) {
    const q = put(l, at, side, pose, i / (STEPS * 4), 1);
    p.lineTo(q.x, q.y);
  }
  const tail = put(l, at, side, pose, 1, 0);
  p.lineTo(tail.x, tail.y);
  p.closePath();
  return p;
}

/**
 * Where a valve's handle hangs with nobody on it: low on the outer flank and
 * out past it, so the left one is under the left thumb and the right under
 * the right on both phones — geometry saying whose it is, never a seat.
 */
export function mantleHandleRest(l: Layout, at: Point, side: Side, pose: ValvePose): Point {
  const tie = mantleTie(l, at, side, pose);
  return { x: tie.x + side * OUTBOARD * l.tile, y: tie.y + HANG * l.tile };
}

/** Where the strap is tied to the valve. */
function mantleTie(l: Layout, at: Point, side: Side, pose: ValvePose): Point {
  return put(l, at, side, pose, HANDLE_F, 1);
}

/** How far down a knob is drawn for a depth in thousandths of a tile, in pixels — capped at its travel. */
export function mantleKnobDrop(l: Layout, depthMilli: number): number {
  return Math.min(TRAVEL, Math.max(0, depthMilli / 1000)) * l.tile;
}

/** The strap from one handle's tail to its knob: the cord the thumb pulls on. */
export function mantleStrapPath(
  l: Layout,
  at: Point,
  side: Side,
  pose: ValvePose,
  knob: Point,
): Path2D {
  const tie = mantleTie(l, at, side, pose);
  const p = new Path2D();
  p.moveTo(tie.x, tie.y);
  p.lineTo(knob.x, knob.y);
  return p;
}
