import { walkedSilhouette } from "../../../../../packages/content/src/body-form.js";
import { crystalRadiusMul, type Point } from "../../../../../packages/content/src/shapes.js";
import type { CreatureSilhouette } from "../../../../../packages/content/src/silhouettes.js";

/**
 * FACET — the MOULT card off the shapes page: a rind that is a faceted shell
 * under pressure, with more facets the more layers it has on.
 *
 * `drafts/creatures.ts` draws MOULT as a crystal of eleven facets, "because a
 * shell is the non-living material the rock already uses; it swells and does
 * nothing else, so the moment it splits is the only event it ever has". A rind
 * has exactly that event, twice, and a body with corners is the one thing no
 * living body on this field has — so a faceted rind is told from every slick
 * and bulb at a glance, and told from a rock by its colour, which is the whole
 * of what the pair reads.
 *
 * The facets go with the layers: twelve with both on, eight with one, and the
 * bare body is the ordinary blob. `crystalRadiusMul` is the rock's own rule,
 * called rather than re-derived, and each facet is sampled along its length so
 * the spline the game draws contours with keeps the edges flat rather than
 * rounding a polygon back into a blob.
 */

/** Facets at one layer, and how many each further layer adds. Even counts,
 * because the rock's rule alternates its vertices in and out, and an odd
 * count leaves one pair of neighbours at the same radius. */
const FACETS_BASE = 4;
const FACETS_PER_LAYER = 4;
/** How deep a facet cuts. The MOULT card's own number is 0.26, which on a
 * body the size of a rind read as a star rather than a shell; shallower, the
 * corners are still corners and the whole is still a body. */
const DEPTH = 0.15;
/** Samples along each facet, so a straight edge survives the spline. */
const PER_FACET = 6;
const RX = 58;
const RY = 52;

const base = { lobes: 3, depth: DEPTH, wobble: 0.03, seed: 12.0 };

function contour(sides: number): (t: number) => Point[] {
  return (t) => {
    // The vertices first, off the rock's rule, then the straight runs between
    // them: a crystal is its corners, and everything between two corners is a
    // line.
    const corners: Point[] = [];
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const m = crystalRadiusMul(a, sides, DEPTH, base.wobble, t, base.seed);
      corners.push({ x: Math.cos(a) * RX * m, y: Math.sin(a) * RY * m });
    }
    const pts: Point[] = [];
    for (let i = 0; i < sides; i++) {
      const from = corners[i] as Point;
      const to = corners[(i + 1) % sides] as Point;
      for (let k = 0; k < PER_FACET; k++) {
        const u = k / PER_FACET;
        pts.push({ x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u });
      }
    }
    return pts;
  };
}

const built = new Map<number, CreatureSilhouette>();

export function facet(left: number): CreatureSilhouette {
  const have = built.get(left);
  if (have) return have;
  const sides = FACETS_BASE + FACETS_PER_LAYER * left;
  const made = walkedSilhouette({ ...base, lobes: sides }, contour(sides));
  built.set(left, made);
  return made;
}
