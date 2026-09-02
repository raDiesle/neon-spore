import { blobRadiusMul, type Point } from "./shapes.js";

/**
 * The hull's own geometry, split out of `shapes.ts` when that file hit its
 * size cap. The seam is real and not arbitrary: everything here describes one
 * surface — a height field the ship's skin is drawn as, parameterised by
 * screen x so a lobe stands exactly above the column it belongs to. Nothing
 * here is used to draw a creature, and nothing in `shapes.ts` knows about
 * bumps.
 */

/**
 * Bump used to deform the hull. It holds full `strength` over a `plateau` range
 * and falls back to 0 over a `shoulder` range on each side.
 *
 * The falloff is a smootherstep, not a raised cosine: both leave the slope at 0
 * where the lobe meets the hull, but the cosine still turns a corner in
 * curvature there, and on a membrane that corner is visible as a crease at the
 * foot of the lobe. Smootherstep flattens the second derivative as well, so the
 * lobe grows out of the surface instead of being set down on it.
 *
 * Used by both the cannon and shield lobes, which are bumps on the hull contour
 * at a controllable angle.
 */
export function bumpAdd(diff: number, strength: number, plateau: number, shoulder: number): number {
  const ad = Math.abs(diff);
  if (ad <= plateau) return strength;
  const total = plateau + shoulder;
  if (ad >= total) return 0;
  const u = (ad - plateau) / shoulder;
  return strength * (1 - u * u * u * (u * (u * 6 - 15) + 10));
}

/**
 * Radius multiplier for the hull at angle `a`. This combines the base lobes and
 * the wobble (three frequency layers). Returns a value to multiply the nominal
 * radius by.
 *
 * Bumps are deliberately *not* part of it: they lift the surface straight up
 * (`bumpLift`), not outwards along the radius. See `hullPointAtX`.
 *
 * The body is `blobRadiusMul`'s, unchanged: the hull is a blob's contour like
 * any other, and the two used to carry byte-identical copies of this
 * arithmetic before one called the other.
 */
export function hullRadiusMul(
  a: number,
  lobes: number,
  depth: number,
  wobble: number,
  t: number,
  seed: number,
): number {
  return blobRadiusMul(a, lobes, depth, wobble, t, seed);
}

/**
 * How far the bumps lift the surface at angle `a`, in units of `ry`.
 *
 * The lift is vertical, and that is the whole point. Added to the radius
 * instead, a bump would push the surface *outwards along the ellipse*, so the
 * further a lobe sits from the apex the more it would lean and stretch
 * sideways — the cannon would no longer stand above the column it fires from.
 * Straight up means the lobe looks the same in the middle of the hull as it
 * does at either edge, and its tip is always directly above its base.
 */
export function bumpLift(a: number, bumps?: Bump[]): number {
  if (!bumps) return 0;
  let lift = 0;
  for (const b of bumps) {
    // Wrap to ±π so the bump doesn't split at the seam
    const diff = Math.atan2(Math.sin(a - b.angle), Math.cos(a - b.angle));
    lift += bumpAdd(diff, b.strength, b.plateau, b.shoulder);
  }
  return lift;
}

/**
 * The hull surface directly above a screen `x`.
 *
 * The hull is a height field, not a closed contour: only the arc around the
 * apex is ever in view, and every lobe has to stand exactly above the column it
 * belongs to. Taking the angle as the parameter and reading x back off it does
 * not do that — the lobe depth multiplies the radius, so it slides the point
 * sideways by as much as `depth * (x - cx)`, and a cannon at the edge of the
 * field ends up leaning towards the middle of it. So x is the parameter, and
 * the lobes, the wobble and the bumps only ever move the surface up and down.
 *
 * The ellipse is at (cx, cy) with semi-axes (rx, ry); the angle is derived from
 * x, which is what keeps the mapping linear. Bumps lift straight up.
 */
export function hullPointAtX(
  x: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  lobes: number,
  depth: number,
  wobble: number,
  t: number,
  seed: number,
  bumps?: Bump[],
): Point {
  const a = -Math.PI / 2 + (x - cx) / rx;
  const m = hullRadiusMul(a, lobes, depth, wobble, t, seed);
  const lift = bumpLift(a, bumps) * ry;
  return { x, y: cy + Math.sin(a) * ry * m - lift };
}

/** The angle a screen `x` sits at on a hull centred at `cx` with radius `rx`. */
export function hullAngleAtX(x: number, cx: number, rx: number): number {
  return -Math.PI / 2 + (x - cx) / rx;
}

export interface Bump {
  /** Angle on the hull where the bump centre sits. */
  angle: number;
  /** Peak strength of the bump at the centre. */
  strength: number;
  /** How wide the full-strength plateau is. */
  plateau: number;
  /** How wide the falloff shoulder is on each side. */
  shoulder: number;
}
