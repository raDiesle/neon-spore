import { catmullRomToBezierPath, type Point } from "./shapes.js";

/**
 * THE BALLOON's contour: a skin with a knot under it, and the fifth family of
 * contour in this package.
 *
 * The seam is `lid-shape.ts`' and `magnet-shape.ts`', arrived at from a third
 * direction. Those two are not radial because their *shape* is not — an eye
 * has corners and a horseshoe has a hole. This one could have been radial and
 * must not be, because it is the one body in the game whose shape **changes
 * while it is played**: two hands pull it towards opposite walls, and each
 * side gives by as much as the hand on it has (`sim/balloon-pull.ts`). One
 * radius sampled all the way round grows a body evenly, which is a picture of
 * something filling — and filling is what this body does *before* anybody
 * touches it. The two have to look different or the pair cannot tell a balloon
 * that is swelling from one that is about to give.
 *
 * So the two half-widths are separate arguments, and the outline is walked
 * with a different one on each side of the centre line. They meet at the top
 * and the bottom, where both are zero from the centre, so the curve is
 * continuous however far apart they are.
 *
 * The box is centred on the origin like every other contour here, and the
 * figures live beside the geometry for `lid-shape.ts`' reason: nothing in
 * `silhouettes.ts` can read them.
 */

/** The knot's width and depth, as shares of the body's own half-height. Small
 * — it is a tie rather than a tail, and what it is really for is saying which
 * way up the body is without a line drawn inside it. */
export const BALLOON = {
  knotWide: 0.22,
  knotDeep: 0.3,
  /** The idle breathing every contour here has, on the same `t`, so a balloon
   * is never quite still and never leaves its lane. */
  wobble: 0.05,
} as const;

/**
 * The skin, as points, walked from the top over the right side and back up the
 * left.
 *
 * `rxLeft` and `rxRight` are the two half-widths and are deliberately not one
 * number and a lean: a lean would move the body, and this body never leaves
 * the lane it is climbing. What the hands do is stretch it, which is the two
 * halves growing by different amounts around a centre that stays put.
 *
 * `ry` is squashed by the caller rather than here, because how much a skin
 * gives vertically as it is pulled sideways is a fact about the material and
 * the caller is the one holding both tensions.
 */
export function balloonOutline(
  rxLeft: number,
  rxRight: number,
  ry: number,
  wobble: number,
  t: number,
  seed: number,
  steps = 28,
): Point[] {
  // Breathing on the height alone, and the widths left exactly as the rule
  // handed them over. `lidOutline` pulls its two axes against each other so a
  // body reads as holding a breath; here a width that moved on its own would
  // be indistinguishable from a hand pulling, which is the one reading this
  // creature cannot afford to blur.
  const h = ry * (1 + wobble * Math.sin(t * 0.8 + seed * 1.9));
  const pts: Point[] = [];
  for (let i = 0; i < steps; i++) {
    // From the top of the body, clockwise. `sin` is the side and `cos` the
    // height, so `i = 0` is the crown and the widest points fall a quarter of
    // the way round each way.
    const a = (i / steps) * Math.PI * 2;
    const side = Math.sin(a);
    // The egg: fuller above the middle than below it, which is what stops a
    // balloon reading as a ball. `0.12` is the shift of the widest point up
    // the body, as a share of the height.
    const lift = 1 + 0.12 * Math.cos(a);
    pts.push({ x: (side >= 0 ? rxRight : rxLeft) * side * lift, y: -h * Math.cos(a) });
  }
  return pts;
}

/** The skin as an SVG path. */
export function balloonPath(
  rxLeft: number,
  rxRight: number,
  ry: number,
  wobble: number,
  t: number,
  seed: number,
): string {
  return catmullRomToBezierPath(balloonOutline(rxLeft, rxRight, ry, wobble, t, seed));
}

/**
 * The knot under it: a short triangle hanging off the bottom of the skin, in
 * the same coordinates. Its own function rather than three more points on the
 * outline, because it is a corner and the outline is a spline — a spike put
 * through `catmullRomToBezierPath` comes out as a bulge.
 */
export function balloonKnot(ry: number): Point[] {
  const w = ry * BALLOON.knotWide;
  const d = ry * BALLOON.knotDeep;
  return [
    { x: -w, y: ry * 0.92 },
    { x: 0, y: ry * 0.92 + d },
    { x: w, y: ry * 0.92 },
  ];
}
