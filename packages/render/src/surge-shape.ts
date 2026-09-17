import { blobPoints } from "@neon-spore/content";
import {
  midCol,
  type SimConfig,
  type SurgeState,
  surgeBulbRow,
  surgeBulbSpan,
  surgeEverting,
} from "@neon-spore/sim";
import { type Circle, type Layout, tileCX, tileCY } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **Where THE SURGE is**, in field pixels: the bulb's centre, its two radii,
 * its outline, and the seam across its equator that the gauge is read along.
 *
 * Its own file for THE SINEW's reason (`sinew-shape.ts`): the thumbs land
 * on the bulb (`surge-grip.ts`), the seam and its marks are drawn across it
 * (`surge-gauge.ts`), the body is drawn round it (`surge-draw.ts`), and a
 * bulb placed in two files would be a handle drawn on one and answered on
 * another.
 *
 * Nothing here reads the wall clock except the blob's own wobble. The
 * **rest** a thumb is tested against is the row the simulation says
 * (`surgeBulbRow`) and nothing else; the sink a vent leaves the bulb easing
 * down through is `surge-fx.ts`'s and is handed in as tiles, and the swell
 * the pressure puts in the body is the drawer's and never the hit test's —
 * a bulb that grew under the finger would be a control you could only take
 * hold of at one pressure.
 */

export interface Point {
  x: number;
  y: number;
}

/** The bulb's half-width as a share of the columns it spans, and its half-height in tiles. */
const BULB_RX = 0.9;
const BULB_RY = 0.78;
/** How much of the half-width the seam runs across, either side of centre. */
const SEAM_REACH = 0.86;

export function surgeBulbRx(l: Layout, cfg: SimConfig): number {
  return (surgeBulbSpan(cfg) / 2) * l.tile * BULB_RX;
}

export function surgeBulbRy(l: Layout): number {
  return l.tile * BULB_RY;
}

/** The pressure as a share of the gauge, 0 empty to 1 at the burst. */
export function surgePressure01(s: SurgeState, cfg: SimConfig): number {
  return Math.min(1, Math.max(0, s.pressureMilli / Math.max(1, cfg.surgeBurstMilli)));
}

/** How far the eversion has turned, 0 whole to 1 inside out; 0 while the bulb holds. */
export function surgeEvert01(
  s: SurgeState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (!surgeEverting(s)) return 0;
  if (s.outBeat >= 0) return 1;
  const beats = Math.max(1, cfg.surgeEvertBeats);
  return Math.min(1, Math.max(0, (beat - s.evertBeat + beatPhase) / beats));
}

/**
 * The bulb's centre: dead centre over the field, on the row the simulation
 * hangs it at, still `sinkTiles` above it while the vent's drop is easing
 * (`surge-fx.ts`).
 */
export function surgeBulbCentre(l: Layout, cfg: SimConfig, s: SurgeState, sinkTiles = 0): Point {
  return {
    x: tileCX(l, midCol(cfg)),
    y: tileCY(l, surgeBulbRow(s, cfg)) - sinkTiles * l.tile,
  };
}

/** The one circle a thumb is answered in: the bulb at rest, the wider of its radii. */
export function surgeBulbCircle(l: Layout, cfg: SimConfig, s: SurgeState): Circle {
  const c = surgeBulbCentre(l, cfg, s);
  return { x: c.x, y: c.y, r: Math.max(surgeBulbRx(l, cfg), surgeBulbRy(l)) };
}

/** The bulb itself: a seven-lobed blob — the ribs — wobbling on the wall
 * clock like every body on the field, at the radii the drawer hands it. */
export function surgeBulbPath(c: Point, rx: number, ry: number, time: number): Path2D {
  return splinePath(blobPoints(c.x, c.y, rx, ry, 7, 0.12, 0.04, time * 0.35, 31), true);
}

/**
 * Where a reading on the gauge falls along the seam: the gauge runs left to
 * right across the equator, nought at the seam's left end and the burst at
 * its right. One function for the notches, the band and the pressure mark,
 * so a notch drawn on one screen and a pressure drawn on the other are on
 * the same line.
 */
export function surgeSeamX(c: Point, rx: number, cfg: SimConfig, milli: number): number {
  const share = Math.min(1, Math.max(0, milli / Math.max(1, cfg.surgeBurstMilli)));
  return c.x - rx * SEAM_REACH + share * rx * 2 * SEAM_REACH;
}

/** The seam's two ends. */
export function surgeSeamEnds(c: Point, rx: number): { left: number; right: number } {
  return { left: c.x - rx * SEAM_REACH, right: c.x + rx * SEAM_REACH };
}
