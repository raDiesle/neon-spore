import {
  BEARING_TURN,
  type GimbalRing,
  type GimbalState,
  gimbalMarkMilli,
  gimbalShownMilli,
  midCol,
  NO_BEARING,
  OUTER,
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
/** How far a pivot pin stands out past its rim, in tiles. */
const PIN = 0.42;

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
  const gone = Math.max(0, of - left);
  const out = l.tile * (sheared ? -SOCKET : TOOTH);
  for (let i = 0; i < Math.max(1, of); i++) {
    if (i < gone !== sheared) continue;
    block(p, at, r, faceMilli + (i * BEARING_TURN) / Math.max(1, of), out);
  }
  return p;
}

/**
 * A ring's two pivot pins, and **the only thing on either screen that says
 * which ring this is**: the outer ring is pinned at the top and the bottom,
 * the inner at its sides, which is the right angle the two are set at. They
 * do not turn with the rim — a pin is what the rim turns in.
 */
export function gimbalPinPath(l: Layout, at: Point, r: number, ring: GimbalRing): Path2D {
  const p = new Path2D();
  const half = ring === OUTER ? 0 : BEARING_TURN / 4;
  const pin = l.tile * PIN;
  for (const side of [0, BEARING_TURN / 2]) {
    const on = gimbalPoint(at, r, half + side);
    const turn = ang(half + side);
    // `block`'s reason: the two pins are one path, and without this they come
    // out joined by a line straight through the drum.
    p.moveTo(on.x + pin * 0.5 * Math.cos(turn), on.y + pin * 0.5 * Math.sin(turn));
    p.ellipse(on.x, on.y, pin * 0.5, pin * 0.34, turn, 0, Math.PI * 2);
  }
  return p;
}

/**
 * What the cradle hangs from: one hanger up the middle from the outer ring's
 * top pin to a shoulder off the top edge of the field, and the stub the
 * bottom pin sits in.
 *
 * It was a three-sided frame around the whole boss for one frame, and that
 * read as a box drawn round a picture rather than as a thing bearing weight
 * — the rule against a filled rectangle with a stroke round it, arrived at
 * from the other side.
 */
export function gimbalYokePath(l: Layout, at: Point, r: number): Path2D {
  const p = new Path2D();
  const pin = l.tile * PIN;
  const top = l.gridTop - l.tile * 0.5;
  const hw = l.tile * 0.7;
  p.moveTo(at.x - hw, top);
  p.lineTo(at.x + hw, top);
  p.moveTo(at.x - pin * 0.34, top);
  p.lineTo(at.x - pin * 0.34, at.y - r);
  p.moveTo(at.x + pin * 0.34, top);
  p.lineTo(at.x + pin * 0.34, at.y - r);
  p.moveTo(at.x - pin * 0.34, at.y + r);
  p.lineTo(at.x - pin * 0.34, at.y + r + l.tile * 0.5);
  p.moveTo(at.x + pin * 0.34, at.y + r);
  p.lineTo(at.x + pin * 0.34, at.y + r + l.tile * 0.5);
  return p;
}
