import { type Point, studdedContour } from "@neon-spore/content";
import { coreRowMilli, midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE GRINDSTONE's geometry**: where the wheel is, and the paths it is made of.
 *
 * **The wheel is THE SMART and the caliper THE HOOD**
 * (`tools/shape-sheet/src/drafts/tower-defence.ts`). THE SMART, *a lumpy round
 * body studded all over*, at its own numbers, is a quarried stone with its
 * knobs of grit; two faces of it are cut flat, the pilot's on the left and the
 * navigator's on the right, deeper for every pass taken, so how far each seat
 * has ground is read off the outline. THE HOOD, *a body under an arc that is
 * not attached to it*, at its own numbers, is the caliper standing over the
 * wheel — split at its crown into two jaws on one bolt, one to a seat, each
 * swinging in until its tip bears on the stone. Its broken card, the arc gone
 * and the body bare, is the wheel spinning free.
 *
 * Every path is laid round the axle at the origin; the draw moves the canvas,
 * so the drop and the fall are transforms. The caliper's paths are next door,
 * in `grindstone-caliper.ts`.
 */

/** The row the axle stands at, in tiles below the grid's top: the simulation's, where a bolt meets it. */
const ROW = coreRowMilli("grindstone") / 1000 + 0.5;
/** THE SMART at its own numbers; its 46-wide body is scaled to `WHEEL` tiles. */
const SMART = studdedContour({
  rx: 46,
  ry: 44,
  studs: 7,
  reach: 0.12,
  width: 0.62,
  blunt: 0.4,
  lobes: 2,
  depth: 0.07,
  seed: 4.4,
})(0);
const SMART_RX = 46;
const SMART_RY = 44;
const WHEEL = 1.3;
/** Where a flat is cut, as a share of the half-width: before a pass, and ground to the last. */
const CUT_FRESH = 0.86;
const CUT_DEEP = 0.7;
/** The axle, as a share of the wheel's radius. */
const AXLE = 0.3;

/** The axle: over the middle column, near the top of the field. */
export function grindstoneCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/** How far the wheel falls spinning free, and drops in from arriving, in tiles. */
const FALL = 2.4;
const DROP = 2;

/** The axle where the wheel stands this frame: dropped in `arrived` of the way, fallen `free` of it. */
export function grindstoneAxleAt(l: Layout, cfg: SimConfig, arrived: number, free: number): Point {
  const home = grindstoneCentre(l, cfg);
  return { x: home.x, y: home.y + (-(1 - arrived) * DROP + FALL * free * free) * l.tile };
}

/** The wheel's radius, in pixels. */
export function grindstoneR(l: Layout): number {
  return WHEEL * l.tile;
}

/** The axle's radius at its fullest, in pixels. */
export function grindstoneAxleR(l: Layout): number {
  return grindstoneR(l) * AXLE;
}

/** How far out flat `side` is cut, in pixels, `depth` of the way ground (0 fresh, 1 both passes). */
export function grindstoneCut(l: Layout, depth: number): number {
  const d = Math.max(0, Math.min(1, depth));
  return grindstoneR(l) * (CUT_FRESH + (CUT_DEEP - CUT_FRESH) * d);
}

/**
 * THE SMART's outline turned `spin` radians, its left face cut to `cuts[0]`
 * pixels from the axle and its right to `cuts[1]`: the studs pass under the
 * flats, which stay facing their seats.
 */
export function grindstoneWheelPath(l: Layout, spin: number, cuts: [number, number]): Path2D {
  return splinePath(grindstoneWheelPoints(l, spin, cuts), true);
}

/** The points `grindstoneWheelPath` runs through, about the axle. */
export function grindstoneWheelPoints(l: Layout, spin: number, cuts: [number, number]): Point[] {
  const k = grindstoneR(l) / SMART_RX;
  const c = Math.cos(spin);
  const n = Math.sin(spin);
  const pts = SMART.map((p) => {
    const x = (p.x * c - p.y * n) * k;
    const y = (p.x * n + p.y * c) * k;
    return { x: Math.max(-cuts[0], Math.min(cuts[1], x)), y };
  });
  return pts;
}

/** Half the height of a flat cut `cut` pixels out, in pixels: the chord of the wheel there. */
export function grindstoneFlatHalf(l: Layout, cut: number): number {
  const r = grindstoneR(l);
  const ry = r * (SMART_RY / SMART_RX);
  return ry * Math.sqrt(Math.max(0, 1 - (cut / r) ** 2)) * 0.92;
}

/** Flat `side`'s face, a line `cut` pixels out: what glows when that flat is asked for. */
export function grindstoneFacePath(l: Layout, side: 0 | 1, cut: number): Path2D {
  const x = side === 0 ? -cut : cut;
  const h = grindstoneFlatHalf(l, cut);
  const p = new Path2D();
  p.moveTo(x, -h);
  p.lineTo(x, h);
  return p;
}

/**
 * The clean patch ground into flat `side`: a ragged round opening in the grit
 * against the face, `clear` of the way open — THE RIME's patch, its figure
 * turned to stand on a face rather than in a half.
 */
export function grindstonePatchPath(l: Layout, side: 0 | 1, cut: number, clear: number): Path2D {
  const h = grindstoneFlatHalf(l, cut);
  const at = { x: (side === 0 ? -1 : 1) * cut, y: 0 };
  const r = h * 1.15 * Math.max(0, Math.min(1, clear));
  const pts: Point[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    const rag = 1 + 0.09 * Math.sin(5 * a + side * 2.1) * (i % 2 === 0 ? 1 : 0.6);
    pts.push({ x: at.x + Math.cos(a) * r * rag * 0.55, y: at.y + Math.sin(a) * r * rag });
  }
  return splinePath(pts, true);
}
