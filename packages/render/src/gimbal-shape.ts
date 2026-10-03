import {
  BEARING_TURN,
  type GimbalRing,
  type GimbalState,
  gimbalMarkMilli,
  gimbalShownMilli,
  midCol,
  NO_BEARING,
  type SimConfig,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **Where THE GIMBAL is**, in field pixels: the yoke it hangs from, and the
 * two nested rings with their latch-teeth. What the drum between them is
 * doing, and how far through a pose the scene is, is `gimbal-drum.ts`.
 *
 * Its own file for THE FILAMENT's reason (`filament-shape.ts`): the drawer
 * stands the picture on these (`gimbal-draw.ts`), and the thumb that turns a
 * ring will be answered at the rim the picture drew, not at a second one.
 *
 * **A ring is a circle here, never an ellipse.** Nothing is ever fired at
 * these, so nothing asks for a near side to pass through, and a bearing read off
 * a squashed circle races through quadrants across the top — which is exactly
 * the sense this boss is asking the pair to agree about. So the ring each
 * seat grips is drawn face-on to them, and what says the two are set at right
 * angles is **where they are pinned**: the outer ring at the top and the
 * bottom, the inner at its sides. Geometry, not colour (§18, *Colour*).
 *
 * **Each seat's own face, and the fold on top of it.** `gimbalFaceMilli` is
 * the one place a true bearing becomes a drawn one, so the ring and the mark
 * cannot be mirrored apart — and both go through it, which is why a flipped
 * screen still reads true exactly when the simulation says true.
 */

export interface Point {
  x: number;
  y: number;
}

/** The row the cradle's centre hangs in. The wave has no entries, so the rings may have the field. */
const ROW = 3.6;
/** Each ring's radius in tiles, the outer first — the order everything on this boss keeps them in. */
const RING_R = [3.4, 2.3] as const;
/** The sealed drum's radius, in tiles. */
const DRUM_R = 1.3;
/** How far a latch-tooth stands out of its rim, and how deep a sheared one is sunk, in tiles. */
const TOOTH = 0.3;
const SOCKET = 0.14;
/** How wide a tooth is, in thousandths of a turn. */
const TOOTH_MILLI = 40;

/** The middle of the cradle: the middle column, a few rows down from the top of the field. */
export function gimbalCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/** A ring's radius in pixels. */
export function gimbalRingR(l: Layout, ring: GimbalRing): number {
  return l.tile * RING_R[ring];
}

/** The drum's radius in pixels. What the drum then *does* is `gimbal-drum.ts` next door. */
export function gimbalDrumR(l: Layout): number {
  return l.tile * DRUM_R;
}

/**
 * **A true bearing as the screen in front of this ring's seat draws it.**
 *
 * Two mirrors, and they are different things. The first is the boss itself:
 * the inner ring is gripped from the far face, so every bearing on it is
 * reflected, and that reflection is `gimbalShownMilli` in `sim/` because the
 * hand going in reads it backwards through the same function
 * (`gimbal-hand.ts`). The second is THE FLIP: a turned seat's whole field is
 * drawn about its middle, so a body on it turns with the picture
 * (`field-flip.ts`). Both land here, once, and everything the ring is drawn
 * with comes through this — so true on the screen is true in the simulation
 * whichever mirrors are up.
 */
export function gimbalFaceMilli(l: Layout, trueMilli: number, ring: GimbalRing): number {
  const shown = gimbalShownMilli(trueMilli, ring);
  return l.flip ? (BEARING_TURN - shown) % BEARING_TURN : shown;
}

/** Where a ring stands on its own face, and where its mark is — `NO_BEARING` once every alignment is spent. */
export function gimbalRingFace(l: Layout, s: GimbalState, ring: GimbalRing): number {
  return gimbalFaceMilli(l, s.atMilli[ring], ring);
}

export function gimbalMarkFace(l: Layout, s: GimbalState, beat: number, ring: GimbalRing): number {
  const mark = gimbalMarkMilli(s, beat, ring);
  return mark === NO_BEARING ? NO_BEARING : gimbalFaceMilli(l, mark, ring);
}

/** The canvas angle of a bearing: nought is the top, and it runs clockwise (`sim/bearing.ts`). */
function ang(milli: number): number {
  return (milli / BEARING_TURN) * Math.PI * 2 - Math.PI / 2;
}

/** A point at `milli` round a circle of radius `r` about `at`. */
export function gimbalPoint(at: Point, r: number, milli: number): Point {
  const t = ang(milli);
  return { x: at.x + r * Math.cos(t), y: at.y + r * Math.sin(t) };
}

/** A ring's rim: the plain circle its teeth stand on. */
export function gimbalRimPath(at: Point, r: number): Path2D {
  const p = new Path2D();
  p.ellipse(at.x, at.y, r, r, 0, 0, Math.PI * 2);
  return p;
}

/**
 * One block on the rim — a tooth standing out of it, or the socket a sheared
 * one left sunk into it.
 *
 * **The `moveTo` is not decoration.** `closePath` returns to the subpath's
 * start but leaves a current point, so a second arc added after it is joined
 * to the first by a straight line. Without this the three teeth of a rim came
 * out strung together by chords across the middle of the ring, which is how
 * the first frame of this boss was drawn.
 */
function block(p: Path2D, at: Point, r: number, milli: number, out: number): void {
  const from = ang(milli - TOOTH_MILLI / 2);
  const to = ang(milli + TOOTH_MILLI / 2);
  const far = Math.max(0, r + out);
  p.moveTo(at.x + r * Math.cos(from), at.y + r * Math.sin(from));
  p.ellipse(at.x, at.y, r, r, 0, from, to);
  p.ellipse(at.x, at.y, far, far, 0, to, from, true);
  p.closePath();
}

/**
 * **The rim is the health.** `of` blocks evenly round it, turned with the
 * ring: the first `of - left` have sheared and are drawn as sockets sunk into
 * the rim, the rest as teeth standing out of it. Both paths are drawn, which
 * is the design's *each gap is drawn, never counted* — a rim with one tooth
 * left is a different silhouette from a rim with three, and nothing anywhere
 * prints the number.
 */
export function gimbalTeethPath(
  l: Layout,
  at: Point,
  r: number,
  faceMilli: number,
  left: number,
  of: number,
  sheared: boolean,
): Path2D {
  const p = new Path2D();
  const out = l.tile * (sheared ? -SOCKET : TOOTH);
  for (const milli of gimbalBlocks(faceMilli, left, of, sheared)) block(p, at, r, milli, out);
  return p;
}

/** Where on the rim each block stands, in thousandths: the sockets if `sheared`, else the teeth. */
function gimbalBlocks(faceMilli: number, left: number, of: number, sheared: boolean): number[] {
  const gone = Math.max(0, of - left);
  const out: number[] = [];
  for (let i = 0; i < Math.max(1, of); i++)
    if (i < gone === sheared) out.push(faceMilli + (i * BEARING_TURN) / Math.max(1, of));
  return out;
}

/**
 * The teeth still standing, each as the corners of its block and a point on
 * either arc between them — the outline a bolt meets (`gimbal-stop.ts`), off
 * the same bearings `gimbalTeethPath` draws them at.
 */
export function gimbalTeethPoints(
  l: Layout,
  at: Point,
  r: number,
  faceMilli: number,
  left: number,
  of: number,
): Point[][] {
  const far = r + l.tile * TOOTH;
  const half = TOOTH_MILLI / 2;
  return gimbalBlocks(faceMilli, left, of, false).map((m) => [
    gimbalPoint(at, r, m - half),
    gimbalPoint(at, r, m),
    gimbalPoint(at, r, m + half),
    gimbalPoint(at, far, m + half),
    gimbalPoint(at, far, m),
    gimbalPoint(at, far, m - half),
  ]);
}
