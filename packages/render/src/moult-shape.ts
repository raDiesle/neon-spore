import { blobRadiusMul, crystalRadiusMul, METEOR, POD, type Point } from "@neon-spore/content";
import { splinePath } from "./spline.js";

/**
 * **THE MOULT's one contour**: the rock's facets and the pod's blob, blended
 * vertex by vertex, so that a body part-way through turning over is one
 * silhouette rather than two drawings laid over each other.
 *
 * The queen's mark is where this move comes from and the argument is hers
 * (`queen-glyph.ts`): both shapes are sampled at the same angles and the
 * *points* are mixed before a single outline is built, so a stone genuinely
 * rounds into a cargo instead of one picture dissolving over another, and
 * there is never a frame with two edges in it. What is different here is only
 * that one of the two ends is not a blob — a rock is a seven-sided crystal and
 * has straight edges — so the sampling has one more step in it, below.
 *
 * Its own file because that step is geometry and the file next door is a
 * creature: `moult.ts` decides how far through the turn the body is and what
 * to paint inside the outline, and never has to know what a facet is.
 */

/**
 * Samples round the ring, and it is **six per facet on purpose**. A rock has
 * seven straight edges; sampling at any count that is not a multiple of seven
 * puts every corner between two samples, and the spline then rounds off the
 * one thing that says "this does not live". At `6 * 7` every sixth point lands
 * exactly on a vertex and the five between it and the next are collinear,
 * which a Catmull-Rom spline carries as the straight line it is.
 */
const N = 42;

const mix = (a: number, b: number, k: number): number => a + (b - a) * k;

/** The pod's half-extents in radius-1 units — the same normalisation
 * `drawPodBody` does with its own `scale`, so a blend at `k = 1` is the size
 * the pod draw would have put down on its own. */
const POD_NORM = Math.max(POD.rx, POD.ry);

/**
 * How far out the rock's **edge** is at an angle, rather than how far out its
 * radius function is.
 *
 * `crystalRadiusMul` answers for a vertex; between two vertices a crystal is a
 * straight chord, and a ring of radii read off that function is a seven-lobed
 * curve that is not the shape the game draws. So the two vertices either side
 * are built and the ray at `a` is intersected with the chord between them:
 * `r * u = P + s * d` crossed with `d` leaves `r = (P x d) / (u x d)`, one
 * division and no iteration.
 *
 * The result is the rock exactly, at every angle, which is what lets the blend
 * start from the body the pair already knows rather than from an approximation
 * of it.
 */
function rockEdge(a: number, t: number): number {
  const step = (Math.PI * 2) / METEOR.sides;
  const j = Math.floor(a / step);
  const vertex = (i: number): Point => {
    const va = i * step;
    const m = crystalRadiusMul(va, METEOR.sides, METEOR.depth, METEOR.wobble, t, METEOR.seed);
    return { x: Math.cos(va) * m, y: Math.sin(va) * m };
  };
  const p = vertex(j);
  const q = vertex(j + 1);
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const denom = Math.cos(a) * dy - Math.sin(a) * dx;
  // Parallel is impossible for a star-shaped ring read at an angle inside its
  // own wedge, and a fall back to the vertex radius is cheaper than trusting
  // that through a floating-point corner.
  if (Math.abs(denom) < 1e-9) return Math.hypot(p.x, p.y);
  return (p.x * dy - p.y * dx) / denom;
}

/**
 * The outline of a moult that is `k` of the way from its rock to its cargo, in
 * radius-1 units: multiply by the radius the body is being drawn at.
 *
 * `k` is 0 for the stone and 1 for the pod, and every value between is a real
 * shape rather than a stage — the point of blending points instead of pictures
 * is that the in-between is answerable at any fraction of a beat.
 *
 * `t` is the same seconds clock both ends already breathe on, so a body held
 * at either extreme is not a still: it wobbles as the rock does at 0 and as
 * the cargo does at 1, out of the two shapes' own `wobble` fields.
 */
export function moultOutline(k: number, t: number): Path2D {
  const rx = mix(1, POD.rx / POD_NORM, k);
  const ry = mix(1, POD.ry / POD_NORM, k);
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const m = mix(
      rockEdge(a, t * 0.15),
      blobRadiusMul(a, POD.lobes, POD.depth, POD.wobble, t, POD.seed),
      k,
    );
    pts.push({ x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
  }
  return splinePath(pts, true);
}
