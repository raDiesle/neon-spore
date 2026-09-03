import { catmullRomToBezierPath, type Point } from "./shapes.js";

/**
 * THE LID's contour: an eye, and the fourth family of contour in this package.
 *
 * `shapes.ts` holds the two that were here first — the lobed blob every living
 * body is drawn with and the faceted crystal a rock is — and `ghost-shape.ts`
 * the third. The seam is the one that file already argued: both of the
 * originals are **radial**, one radius sampled all the way round a centre, and
 * an eye is not. A radial contour grows every corner it grows at the sides at
 * the top and the bottom as well, so a lens drawn with `blobRadiusMul` is a
 * lumpy oval with no points in it — and the points are the whole shape. This
 * one has a top and a bottom that are different curves meeting at a corner
 * either side, which is what an eye is.
 *
 * **The figures live here too**, beside the only geometry that can draw them,
 * for the reason `ghost-shape.ts` gives: they are the one entry `silhouettes.ts`
 * has no function able to read — no `lobes`, no `depth`, nothing
 * `blobRadiusMul` takes.
 */

/**
 * THE LID's outline, as points — two arcs from corner to corner, the upper one
 * taller than the lower.
 *
 * **A sine over a straight run, and that is what makes the corners.** Half an
 * ellipse arrives at each end with a vertical tangent, which is a rounded end
 * and reads as a slick; `sin(πs)` over an `x` that walks evenly from one side
 * to the other arrives with a finite, non-zero slope instead, so the two arcs
 * meet at an angle. The corner is the only part of this shape that could not
 * have been drawn with what was already here.
 *
 * The box is `2rx` by `2ry`, centred on the origin like every other contour in
 * this package, and it is walked from the left corner over the top to the
 * right corner and back along the bottom.
 *
 * - `droop` is the lower arc's depth as a share of the upper one's. Under 1,
 *   so the eye has a heavy top lid and a shallow floor — the asymmetry is what
 *   stops it reading as a leaf, and it also says which way up the body is
 *   without a single line drawn inside it.
 * - `lashes` is how many filaments stand off the rim. They are not part of the
 *   outline — `render/lid.ts` strokes them outside it, the way THE GHOST's
 *   shards are drawn clear of its body — but the count is a fact about the
 *   creature and belongs beside the rest of its figures.
 * - `wobble` is the same idle breathing every other contour has, on the same
 *   `t`, so a lid is never quite still and never leaves its tile.
 */
export function lidOutline(
  rx: number,
  ry: number,
  droop: number,
  wobble: number,
  t: number,
  seed: number,
  steps = 22,
): Point[] {
  // Breathing applied to the whole body rather than per-point, for
  // `ghostOutline`'s reason: a rim that rippled along its own length would
  // read as a slick, which is the one shape this body most needs not to be
  // called. The two axes pull against each other — wider is shorter — so it
  // reads as a held breath rather than as a shape being resized.
  const w = rx * (1 + wobble * Math.sin(t * 0.9 + seed * 1.7));
  const h = ry * (1 - wobble * 0.7 * Math.sin(t * 0.53 + seed * 2.3));

  const pts: Point[] = [];
  // The upper arc, left corner to right. Both corners sit at y = 0, which is
  // where the lower arc picks them up again.
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    pts.push({ x: -w + 2 * w * s, y: -h * Math.sin(Math.PI * s) });
  }
  // The lower arc, right corner back to left. The two corners themselves are
  // already in the list, so this walks the inside of them — a repeated point
  // would put a zero-length curve segment in the path for nothing.
  for (let i = 1; i < steps; i++) {
    const s = i / steps;
    pts.push({ x: w - 2 * w * s, y: h * droop * Math.sin(Math.PI * s) });
  }
  return pts;
}

/** THE LID's outline as a path. `lidOutline` is the geometry; this is the one
 * call the canvas makes, the way `blobPath` is for a lobed body. */
export function lidPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  droop: number,
  wobble: number,
  t: number,
  seed: number,
): string {
  const pts = lidOutline(rx, ry, droop, wobble, t, seed).map((p) => ({
    x: cx + p.x,
    y: cy + p.y,
  }));
  return catmullRomToBezierPath(pts);
}

/**
 * THE LID's figures. A separate interface from `CreatureSilhouette` for
 * `GhostSilhouette`'s reason: none of that one's fields mean anything here,
 * because there are no lobes running round a centre and no depth for them to
 * run at.
 */
export interface LidSilhouette {
  /** Half-width and half-height of the box the body is drawn in. */
  rx: number;
  ry: number;
  /** The lower arc's depth as a share of the upper one's. Under 1. */
  droop: number;
  /** Filaments standing off the rim, drawn outside the contour. */
  lashes: number;
  wobble: number;
  seed: number;
}

/**
 * Lid: an eye a good deal wider than it is tall, with a heavy upper arc and a
 * shallow floor.
 *
 * **The corners are what the shape is spent on.** Every living body on this
 * roster is a closed curve with no angle anywhere in it — that is what
 * `blobRadiusMul` produces and it is why the bestiary's shapes are told apart
 * by lobe count and aspect rather than by outline. This one has two corners and
 * nothing else does, so it is the first body a pair can name by pointing at its
 * ends rather than by counting its bumps.
 *
 * **66 × 44, and the aspect is a decision.** `longAxis` calls a body wide past
 * a ratio of 1.25; at 1.5 this is plainly one, which puts it in the slick's
 * bucket and nowhere near the three round bodies. Being in the slick's bucket
 * is deliberate rather than tolerated: what separates the two on the field is
 * not the ellipse, it is that a lid is a dark plated thing with two corners and
 * a fringe until somebody opens it, and a slick never has plates on at all.
 *
 * `droop` 0.62 is as shallow as the floor goes before the body stops closing
 * cleanly at this width. Nine lashes: enough to read as a fringe at the couple
 * of dozen pixels a body draws at on a phone, and few enough that they are
 * still separate things at the bottom of the field.
 */
export const LID: LidSilhouette = {
  rx: 66,
  ry: 44,
  droop: 0.62,
  lashes: 9,
  wobble: 0.05,
  seed: 4.5,
};
