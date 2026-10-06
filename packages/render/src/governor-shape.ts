import { coreRowMilli, midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **THE GOVERNOR's geometry**: where the dial lies, how it is seen, and where
 * the spindle, the flyweights, the drum and the yoke stand over it.
 *
 * **THE VANE and INTERFERENCE, combined** (`tools/shape-sheet/src/drafts/`):
 * THE VANE's arm on the bearing it turns on is the needle and the hub — the
 * card's own point, that the bearing is the one part that can be hit — laid
 * on a flywheel's face; INTERFERENCE's two equal bodies that lean and never
 * merge are the flyweights, always opposite one another on the spindle.
 *
 * **Everything is placed, not drawn flat.** The dial is a disc seen from
 * above it, `tilt` being the sine of how high the eye stands, so a point on
 * its face at a lap's thousandths lands on an ellipse and the graduations,
 * the lit mark and the needle foreshorten with it. The spindle stands upright
 * just behind the far rim, so it never covers the face a mark is read off;
 * its heights shrink by the cosine of the same angle, and a flyweight orbits
 * it in the horizontal plane, lower on the screen and larger while it is
 * nearer the pair. Paths are laid in field pixels.
 */

export interface Point {
  x: number;
  y: number;
}

/** The dial as this frame sees it: its middle and radius in pixels, and the eye's height as a sine. */
export interface Dial {
  cx: number;
  cy: number;
  r: number;
  tilt: number;
}

/** The dial's middle, in tiles below the grid's top, and its radius in tiles. */
const ROW = coreRowMilli("governor") / 1000 + 0.5;
const RADIUS = 4.9;
/** The graduated track, as fractions of the radius, and the needle's reach. */
export const TRACK_IN = 0.74;
export const TRACK_OUT = 0.94;
export const NEEDLE_REACH = 0.9;
/** How thick the flywheel is under its face, in tiles. */
const RIM_DEPTH = 0.4;
/** The hub's radius at its fullest, in tiles. */
const HUB = 0.68;
/** How far behind the dial's middle the spindle stands, in radii: just past the far rim. */
const BEHIND = 1.08;
/** The spindle's head, the drum's middle and its half-height, over the dial's plane, in tiles. */
const HEAD = 4.4;
const DRUM_AT = 0.7;
const DRUM_HALF = 0.38;
/** The drum's radius, a flyweight's arm and its radius, in tiles. */
const DRUM_R = 0.5;
const ARM = 1.9;
const BALL = 0.6;

/** The dial for this frame, tipped between the two heights the eye stands at. */
export function governorDial(l: Layout, cfg: SimConfig, tilt: number): Dial {
  return { cx: fieldX(l, midCol(cfg)), cy: l.gridTop + ROW * l.tile, r: RADIUS * l.tile, tilt };
}

/** A point on the dial's face, `milli` thousandths of a lap clockwise from the top, `reach` radii out. */
export function dialAt(d: Dial, milli: number, reach: number): Point {
  const a = (milli / 1000) * Math.PI * 2;
  return { x: d.cx + d.r * reach * Math.sin(a), y: d.cy - d.r * reach * d.tilt * Math.cos(a) };
}

/** The face's outline at `reach` radii, or the flywheel's underside `drop` pixels below it. */
export function dialRing(d: Dial, reach: number, drop = 0): Path2D {
  const p = new Path2D();
  p.ellipse(d.cx, d.cy + drop, d.r * reach, d.r * reach * d.tilt, 0, 0, Math.PI * 2);
  return p;
}

/** How far the flywheel's edge shows under its face, in pixels: thinner as the eye rises. */
export function rimDepth(l: Layout, d: Dial): number {
  return RIM_DEPTH * l.tile * Math.sqrt(1 - d.tilt * d.tilt);
}

/**
 * A band of the track from `from` to `to` thousandths, between two reaches:
 * one closed path along the face, so a lit mark is a piece of the track and
 * not a shape laid over it.
 */
export function trackBand(d: Dial, from: number, to: number, inner: number, outer: number): Path2D {
  const p = new Path2D();
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const at = dialAt(d, from + ((to - from) * i) / n, outer);
    if (i === 0) p.moveTo(at.x, at.y);
    else p.lineTo(at.x, at.y);
  }
  for (let i = n; i >= 0; i--) {
    const at = dialAt(d, from + ((to - from) * i) / n, inner);
    p.lineTo(at.x, at.y);
  }
  p.closePath();
  return p;
}

/** The hub's radius at its fullest, in pixels. */
export function hubR(l: Layout): number {
  return HUB * l.tile;
}

/** A point `h` tiles up the spindle, pushed `rho` tiles off it at orbit angle `phi` (`sin phi > 0` toward the pair). */
export function spindleAt(l: Layout, d: Dial, h: number, rho = 0, phi = 0): Point {
  const up = Math.sqrt(1 - d.tilt * d.tilt);
  const foot = d.cy - d.r * BEHIND * d.tilt;
  return {
    x: d.cx + rho * l.tile * Math.cos(phi),
    y: foot - h * l.tile * up + rho * l.tile * Math.sin(phi) * d.tilt,
  };
}

/** The spindle's head, where the flyweights' arms hang from. */
export function headAt(l: Layout, d: Dial): Point {
  return spindleAt(l, d, HEAD);
}

/**
 * Where a flyweight hangs for `swing`, the arm's angle off the spindle, and
 * `phi` its place round it — and the collar the lower links pull up the
 * spindle, which rises as the weights fly out: the speed, drawn.
 */
export function flyweightAt(l: Layout, d: Dial, swing: number, phi: number): Point {
  return spindleAt(l, d, HEAD - ARM * Math.cos(swing), ARM * Math.sin(swing), phi);
}

/** The collar's height up the spindle for `swing`, in tiles: the links' rhombus, never down on the drum. */
export function collarAt(l: Layout, d: Dial, swing: number): Point {
  return spindleAt(l, d, Math.max(DRUM_AT + DRUM_HALF * 2, HEAD - 2 * ARM * Math.cos(swing)));
}

/** A flyweight's radius in pixels, a little larger while it is nearer the pair. */
export function ballR(l: Layout, phi: number): number {
  return BALL * l.tile * (1 + 0.12 * Math.sin(phi));
}

/** The brake drum: its middle, radius and half-height in pixels. */
export function drumAt(l: Layout, d: Dial): { at: Point; r: number; half: number } {
  const up = Math.sqrt(1 - d.tilt * d.tilt);
  return { at: spindleAt(l, d, DRUM_AT), r: DRUM_R * l.tile, half: DRUM_HALF * l.tile * up };
}
