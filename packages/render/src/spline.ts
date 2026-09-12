import { catmullRomSegments, type Point } from "@neon-spore/content";

/**
 * A contour, written into a `Path2D` as numbers.
 *
 * Every organic shape in this game is a Catmull-Rom spline through a ring or a
 * run of points, and until now every one of them reached the canvas as text:
 * `blobPath` and `openSmoothPath` formatted each coordinate with `toFixed(2)`,
 * joined them into an SVG `d`, and the caller handed that to `new Path2D(...)`
 * to be parsed back into the numbers it was made from. The hull alone is 141
 * points — 840 `toFixed` calls and a five-thousand-character string — and it is
 * on screen in every frame of every wave.
 *
 * So the string is skipped where nobody wanted one. `catmullRomSegments` in
 * content is still the only place the control points are worked out, and this
 * walks the numbers it returns straight into `moveTo` and `bezierCurveTo`. The
 * SVG form stays for the things that really do take text — `tools/shape-sheet`
 * and the menu's `<path>` wordmark.
 *
 * **The picture is the same to within the rounding that was dropped.** Two
 * decimals of a CSS pixel is at most 0.005px of movement, and the numbers now
 * arrive unrounded; `.claude/skills/render-perf` calls a value that moves by
 * less than a pixel *imperceptible*, and it is the only difference here.
 */
export function splineInto(path: Path2D, pts: readonly Point[], closed: boolean): void {
  if (pts.length < 2) return;
  const seg = catmullRomSegments(pts as Point[], closed);
  path.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 0; i < seg.length; i += 6) {
    path.bezierCurveTo(seg[i]!, seg[i + 1]!, seg[i + 2]!, seg[i + 3]!, seg[i + 4]!, seg[i + 5]!);
  }
  if (closed) path.closePath();
}

/**
 * An open run sealed with one straight line back to where it began — a tube's
 * two banks, a drip's two sides. It is **not** a closed spline: closing the
 * Catmull-Rom would bend the run's two ends toward each other, and a tube's
 * mouth is meant to be cut square. This is what `openSmoothPath(...) + " Z"`
 * spelled out as text.
 */
export function splineSealedInto(path: Path2D, pts: readonly Point[]): void {
  if (pts.length < 2) return;
  splineInto(path, pts, false);
  path.closePath();
}

/** The same contour as a path of its own — what most callers want. */
export function splinePath(pts: readonly Point[], closed: boolean): Path2D {
  const path = new Path2D();
  splineInto(path, pts, closed);
  return path;
}

/**
 * An open contour carried on to two more corners and closed — the hull's
 * filled body, which is its skin taken down to the bottom of the field. It is
 * a second path rather than the first one continued, because the contour is
 * also stroked on its own and a `Path2D` cannot be un-closed.
 */
export function splineSkirt(
  pts: readonly Point[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): Path2D {
  const path = splinePath(pts, false);
  path.lineTo(x1, y1);
  path.lineTo(x2, y2);
  path.closePath();
  return path;
}
