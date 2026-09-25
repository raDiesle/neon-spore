import type { Point } from "@neon-spore/content";
import { hullBottom } from "./band-seam.js";
import { type HullFrame, surface } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { splinePath, splineSkirt } from "./spline.js";

/**
 * The hull's outline as paths, for `drawHull` and for anything that has to
 * lay something over exactly the ship it drew — THE MIRROR's blow, which
 * reddens the copy's body (`mirror.ts`). Cut out of `hull.ts` at 249 lines so
 * the second caller reads the same contour rather than tracing another.
 *
 * The contour is sampled past both edges of the stage, so it never ends in
 * view, and the fill runs down to `hullBottom`, the ship's own membrane.
 */

/** How far past the stage's edges to sample, so the contour never ends in view. */
const MARGIN = 0.12;
/** High resolution: the swelling has to read as one unbroken transition, not
 * as a bump glued to a line. */
const STEPS = 140;

export interface HullOutline {
  /** The surface, sampled left to right. */
  readonly pts: Point[];
  /** The open contour — the rim is stroked along it. */
  readonly body: Path2D;
  /** The contour closed down to the ship's bottom — the body is filled in it. */
  readonly filled: Path2D;
}

export function hullOutline(l: Layout, f: HullFrame): HullOutline {
  const from = -MARGIN * l.gridWidth;
  const to = l.width + MARGIN * l.gridWidth;
  const pts: Point[] = [];
  for (let i = 0; i <= STEPS; i++) pts.push(surface(f, from + (to - from) * (i / STEPS)));
  const bottom = hullBottom(l);
  return {
    pts,
    body: splinePath(pts, false),
    filled: splineSkirt(pts, l.width, bottom, 0, bottom),
  };
}
