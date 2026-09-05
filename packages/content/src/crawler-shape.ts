import { catmullRomToBezierPath, type Point } from "./shapes.js";

/**
 * THE CRAWLER's contour: one segment of a maggot, and the fifth family of
 * contour in this package.
 *
 * `shapes.ts` holds the two that were here first — the lobed blob and the
 * faceted crystal — and `ghost-shape.ts` and `lid-shape.ts` the third and
 * fourth. The seam is the one both of those already argued: the originals are
 * **radial**, one radius sampled all the way round a centre, and a segment of a
 * maggot is not. It is an egg lying on its side, fat and domed at the leading
 * end and tucked at the trailing one, and a radial contour that grew a belly at
 * the front would grow the same at the back.
 *
 * **It is wider than a tile, and that is the whole shape.** Links stand one
 * column apart, so a segment narrower than a tile leaves field showing between
 * one and the next and the run reads as a row of beads on a string — which is
 * THE STRAND's picture and the one thing this creature must not be mistaken
 * for. At `OVERLAP` the leading dome of each segment lies *over* the tucked
 * tail of the one behind it, the way a real maggot's rings do: no gap, no
 * connector, and a crease where the two meet, which the outline draws for free.
 *
 * **The figures live here too**, beside the only geometry that can draw them,
 * for `lid-shape.ts`' reason: they are an entry `silhouettes.ts` has no
 * function able to read — no `lobes`, no `depth`, nothing `blobRadiusMul`
 * takes.
 */

/** What one segment is shaped like, in a box `2rx` by `2ry` centred on the
 * origin, with the leading end at `+x`. */
export interface CrawlerSilhouette {
  /** Half its length along the direction of travel. */
  rx: number;
  /** Half its height at the leading dome, which is the tallest it gets. */
  ry: number;
  /**
   * How much taller the leading end is than the trailing one, 0..1. This is
   * what makes an egg out of an ellipse, and it is what says which way the
   * animal is facing before the pair has looked at the head.
   */
  taper: number;
  /**
   * How far the contraction squeezes it at the tightest part of the wave, as a
   * share of each axis. A maggot moves by squeezing and nothing here travels,
   * so this is the whole of the life in the shape — and the two axes pull
   * against each other, shorter being fatter, so a segment keeps its area and
   * the wave reads as a squeeze rather than as a throb.
   */
  pulse: number;
  seed: number;
}

/**
 * The shipped figures, in the units a tile is 100 of. `rx` past 50 is the
 * overlap: a segment reaches a third of a tile past its own column at each
 * end, so consecutive links share that much of themselves and the body has no
 * gap in it anywhere.
 */
export const CRAWLER: CrawlerSilhouette = {
  rx: 95,
  ry: 42,
  taper: 0.22,
  pulse: 0.14,
  seed: 41,
};

/** How far past its own column a segment reaches, as a share of a tile —
 * `rx` said the way the field says it, so a reader of `render/crawler.ts` can
 * see the overlap without dividing anything. */
export const OVERLAP = 0.16;

/**
 * One segment's outline, as points, walked from the leading tip clockwise.
 *
 * `squeeze` is where the segment stands in the wave, −1 to 1, and is applied to
 * the whole body rather than per point — `lidOutline`'s reason: a rim that
 * rippled along its own length would read as a slick, and a slick is the one
 * word this shape must never be called by mistake.
 *
 * `lean` is the taper, and it is what turns the ellipse into an egg: the
 * half-height is scaled by `1 + lean·cos a`, so the leading end stands full and
 * the trailing one tucks. Nothing here is a `Math.sin` the simulation has to
 * agree about — this file draws, and only draws.
 */
export function crawlerOutline(
  rx: number,
  ry: number,
  taper: number,
  pulse: number,
  squeeze: number,
  steps = 30,
): Point[] {
  const ax = rx * (1 - pulse * squeeze);
  const ay = ry * (1 + pulse * squeeze);
  const pts: Point[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const c = Math.cos(a);
    pts.push({ x: c * ax, y: Math.sin(a) * ay * (1 + taper * c) });
  }
  return pts;
}

/**
 * Where the segment stands in the wave of contraction, −1 to 1, from the shared
 * clock and its place along the body.
 *
 * The offset per link is what makes the wave run **from the head backwards**,
 * which is the direction a maggot actually moves — and it is the one thing on
 * screen that says which end is the front before the pair has looked at the
 * mouth. Here rather than in render/ because the shape sheet has to draw the
 * same shape the field does, which is the whole reason this file exists.
 */
export function crawlerSqueeze(beats: number, order: number, perLink = 0.22): number {
  return Math.sin((beats / 2 - order * perLink) * Math.PI * 2);
}

/**
 * The same outline as an SVG path string, centred on `cx`,`cy` and facing
 * `dir` — what a canvas and a sheet both stroke. `catmullRomToBezierPath`
 * rather than an `ellipse` call, so the shape the game draws and the shape the
 * sheet measures are one list of points and not two descriptions of one idea.
 */
export function crawlerPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  taper: number,
  pulse: number,
  squeeze: number,
  dir: 1 | -1 = 1,
): string {
  const pts = crawlerOutline(rx, ry, taper, pulse, squeeze).map((p) => ({
    x: cx + p.x * dir,
    y: cy + p.y,
  }));
  return catmullRomToBezierPath(pts);
}
