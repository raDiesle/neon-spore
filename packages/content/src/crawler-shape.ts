import { catmullRomToBezierPath, type Point } from "./shapes.js";

/**
 * THE CRAWLER's contour: one link of a worm, and the fifth family of contour
 * in this package.
 *
 * `shapes.ts` holds the two that were here first — the lobed blob and the
 * faceted crystal — and `ghost-shape.ts` and `lid-shape.ts` the third and
 * fourth. The seam is the one both of those already argued: the originals are
 * **radial**, one radius sampled all the way round a centre, and a segment of
 * a worm is not. It is fatter across the body than it is long, and the
 * difference between those two axes *is* the segmenting — a radial contour
 * that gained width at the sides would gain the same fore and aft, so a chain
 * drawn with `blobRadiusMul` is a row of lumpy balls with no joints in it.
 *
 * **The figures live here too**, beside the only geometry that can draw them,
 * for `lid-shape.ts`' reason: they are an entry `silhouettes.ts` has no
 * function able to read — no `lobes`, no `depth`, nothing `blobRadiusMul`
 * takes.
 */

/** What one link is shaped like, in the units every other contour here uses:
 * a box `2rx` by `2ry` centred on the origin. */
export interface CrawlerSilhouette {
  /** Half its length along the direction of travel. */
  rx: number;
  /** Half its width across the body. Larger than `rx` on purpose — see above. */
  ry: number;
  /**
   * How far the contraction squeezes it at the tightest part of the wave, as a
   * share of each axis. A worm moves by squeezing and nothing here travels, so
   * this is the whole of the life in the shape — and the two axes pull against
   * each other, shorter being fatter, so a link keeps its area and the wave
   * reads as a squeeze rather than as a throb.
   */
  pulse: number;
  /** How far the mouth's hooks stand out past the head, as a share of `rx`. */
  jaw: number;
  seed: number;
}

/**
 * The shipped figures. `ry` a good half again over `rx`, which is the widest
 * a link can be drawn before a run of them reads as a stack of coins seen
 * edge-on rather than as an animal.
 */
export const CRAWLER: CrawlerSilhouette = {
  rx: 17,
  ry: 23,
  pulse: 0.16,
  jaw: 0.62,
  seed: 41,
};

/**
 * One link's outline, as points: an ellipse under the contraction, walked from
 * the leading edge clockwise.
 *
 * `squeeze` is where the link stands in the wave, −1 to 1, and is applied to
 * the whole body rather than per point — `lidOutline`'s reason: a rim that
 * rippled along its own length would read as a slick, and a slick is the one
 * word this shape must never be called by mistake.
 */
export function crawlerOutline(
  rx: number,
  ry: number,
  pulse: number,
  squeeze: number,
  steps = 28,
): Point[] {
  const ax = rx * (1 - pulse * squeeze);
  const ay = ry * (1 + pulse * squeeze);
  const pts: Point[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    pts.push({ x: Math.cos(a) * ax, y: Math.sin(a) * ay });
  }
  return pts;
}

/**
 * Where the link stands in the wave of contraction, −1 to 1, from the shared
 * clock and its place along the body.
 *
 * The offset per link is what makes the wave run **from the head backwards**,
 * which is the direction a maggot actually moves — and it is the one thing on
 * screen that says which end is the front before the pair has looked at the
 * mouth. Here rather than in render/ because the sheet has to draw the same
 * shape the game does, which is the whole reason this file exists.
 */
export function crawlerSqueeze(beats: number, order: number, perLink = 0.22): number {
  return Math.sin((beats / 2 - order * perLink) * Math.PI * 2);
}

/**
 * The same outline as an SVG path string, centred on `cx`,`cy` — what a canvas
 * and a sheet both stroke. `catmullRomToBezierPath` rather than an
 * `ellipse` call, so the shape the game draws and the shape the sheet measures
 * are one list of points and not two descriptions of the same idea.
 */
export function crawlerPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  pulse: number,
  squeeze: number,
): string {
  const pts = crawlerOutline(rx, ry, pulse, squeeze).map((p) => ({
    x: cx + p.x,
    y: cy + p.y,
  }));
  return catmullRomToBezierPath(pts);
}
