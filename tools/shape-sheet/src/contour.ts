import type { Point } from "@neon-spore/content";

export interface Subject {
  name: string;
  note: string;
  /** An open contour must not be filled — SVG would close it across the ends. */
  open: boolean;
  pointsAt(t: number): Point[];
  /**
   * A second closed loop cut out of the first, for the one shape with a hole
   * through it — `ring.ts`, which explains why nothing has to reverse it.
   */
  hole?(t: number): Point[];
  path(pts: Point[]): string;
  /**
   * Separate closed loops, for a subject that can come apart. `pointsAt` is
   * their concatenation; only something *drawing* one needs it — `contourAt`.
   */
  loopsAt?(t: number): Point[][];
}

/**
 * A subject's whole outline at one moment, as a path string.
 *
 * Anything that draws goes through this rather than `path(pointsAt(t))`,
 * because a contour is not always one ring and the two ways it is not arrived
 * separately. A cluster that has parted is several loops, and joining them back
 * up with a stroke across the gap hides the one thing the separation exists to
 * show. A ring is one loop with a second cut out of it, drawn as two subpaths
 * in the same `d` and cut with `evenodd` where the shape is filled.
 *
 * Both are subpaths appended to the same string, so the assembly is one rule
 * here rather than the same conditional written at every place that draws.
 */
export function contourAt(s: Subject, t: number): string {
  const loops = s.loopsAt?.(t);
  if (loops) return loops.map((loop) => s.path(loop)).join(" ");
  const hole = s.hole?.(t);
  return s.path(s.pointsAt(t)) + (hole ? s.path(hole) : "");
}
