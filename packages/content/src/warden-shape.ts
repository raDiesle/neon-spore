import type { Point } from "./shapes.js";
import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * THE WARDEN's body, and the only silhouette in the game with a hole in it —
 * a hole with a way into it from below (`wardenOpening`, at the foot of this
 * file).
 *
 * Its own file rather than a section of `silhouettes.ts`, because it is the
 * one shape there built from two loops instead of one: everything else on that
 * page is a single contour tuned by lobes, depth and wobble, and this is two
 * of those in a relationship. `tools/shape-sheet/src/ring.ts` samples it, and
 * `packages/render/src/warden.ts` draws it, from these numbers.
 */

/**
 * A ring: two lobed loops, an outer body and a pupil cut out of it. The only
 * silhouette in the game made of two loops, and the only one you can see the
 * field through.
 *
 * The two are tuned separately on purpose — on a shape whose whole subject is
 * an eye, the edge you look *through* has to be the one that moves.
 */
export interface RingSilhouette {
  outer: CreatureSilhouette;
  pupil: CreatureSilhouette;
  /** Pupil radius as a fraction of the body's, before anything dilates it. */
  pupilMul: number;
  /**
   * How far off centre the pupil sits when it has slid all the way over, in
   * fractions of the body's `rx`. Far enough that the material visibly bunches
   * on one side and thins on the other — a smaller offset reads as a hole that
   * happens to be off centre, which is a manufacturing defect rather than a
   * thing looking at you.
   */
  pupilTravel: number;
}

/**
 * THE WARDEN's body. Eight shallow lobes with almost no wobble — rounder than
 * any creature, faintly organic, so it reads as a fixture rather than as
 * something that fell — around five deeper ones with three times the wobble.
 */
export const WARDEN_RING: RingSilhouette = {
  outer: { lobes: 8, depth: 0.035, wobble: 0.012, rx: 100, ry: 100, seed: 5.0 },
  pupil: { lobes: 5, depth: 0.1, wobble: 0.075, rx: 100, ry: 100, seed: 9.0 },
  pupilMul: 0.44,
  pupilTravel: 0.28,
};

/**
 * The pupil at the two beats the core stands in it, as a fraction of the body.
 * Close to as far as the hole can ever go: `ringClearance` in the shape tools
 * puts the pupil out of body somewhere past 0.66 of the radius, where it
 * breaches the rim and the shape quietly stops being a ring.
 * `tools/shape-sheet/test/ring.test.ts` holds that floor, which is why the
 * last phase is this pupil *at rest* rather than a wider one.
 */
export const WARDEN_PUPIL_OPEN = 0.62;

/**
 * How much of the pupil's own half-width the opening below it takes, either
 * side of centre.
 *
 * Not one. Walls run down tangent to the widest part of an open hole take
 * three fifths of the body with them, and what is left reads as two horns
 * rather than as a body with a way into it. This is a slot: wider than the
 * shot that has to come up it by some margin, and narrow enough that the shape
 * is still the ring it was. It widens as the eye does, because it is measured
 * off the pupil.
 */
export const WARDEN_OPENING = 0.55;

/**
 * THE WARDEN's body cut open below the eye: the hole is not enclosed, it has a
 * way in from underneath.
 *
 * A shot that counts is a shot into the open eye, and a body closed all the
 * way round put a band of its own material between the cannon and the only
 * thing on it worth hitting. The picture said "you cannot get there" while the
 * rule said the shot lands, and of the two the picture is the one a player
 * believes. So the material below the hole is gone: two walls run down from
 * the pupil's widest points, out through the rim, and the shape is a horseshoe
 * standing on the field rather than a ring floating in it.
 *
 * It is one contour, not two. The moment a hole opens onto the outside it
 * stops being a hole, and even-odd — which is what cut it while it was one —
 * has nothing left to cut.
 */
export interface WardenOpening {
  /** The whole body, one closed loop, ready to fill. */
  contour: Point[];
  /** Its own edge: the wall up one side, round the top, down the other. */
  edge: Point[];
  /** The edge you look through: the pupil's arc over the top, wall to wall. */
  lip: Point[];
  /** The angles from the body's centre the opening stands between, `from` the
   * smaller. Anything drawn round the body — the plates — steps over them. */
  from: number;
  to: number;
}

/** A few points along a straight run, so smoothing cannot bow a wall. */
function along(a: Point, b: Point, steps: number): Point[] {
  const out: Point[] = [];
  for (let k = 1; k < steps; k++) {
    const f = k / steps;
    out.push({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });
  }
  return out;
}

/** Where a point stands, seen from the body's centre, in 0..2π. */
function turn(p: Point, cx: number, cy: number): number {
  const a = Math.atan2(p.y - cy, p.x - cx);
  return a < 0 ? a + Math.PI * 2 : a;
}

/**
 * The two sampled loops joined into the one contour above, from loops sampled
 * the way `hullRadiusMul` samples everything else — angle by angle, starting at
 * the body's right and running down through its bottom.
 *
 * Returns null when the pupil has wandered somewhere the opening cannot be cut,
 * which is the caller's cue to draw the ring it drew before rather than a
 * shape with a fold in it.
 */
export function wardenOpening(
  outer: Point[],
  pupil: Point[],
  cx: number,
  cy: number,
  width = WARDEN_OPENING,
): WardenOpening | null {
  const n = outer.length;
  if (n < 8 || pupil.length < 8) return null;
  let wide = 0;
  let narrow = 0;
  for (let i = 1; i < pupil.length; i++) {
    if ((pupil[i] as Point).x > (pupil[wide] as Point).x) wide = i;
    if ((pupil[i] as Point).x < (pupil[narrow] as Point).x) narrow = i;
  }
  const mid = ((pupil[wide] as Point).x + (pupil[narrow] as Point).x) / 2;
  const half = (((pupil[wide] as Point).x - (pupil[narrow] as Point).x) / 2) * width;
  const xR = mid + half;
  const xL = mid - half;

  // The throat leaves the hole at its *underside*, not at its widest points: a
  // slot that started level with the middle of the eye would swallow the eye
  // into it, and what the shape has to say is that there is an eye with a way
  // up to it. So each wall meets the pupil at the point on its lower edge
  // standing nearest that wall's own line.
  let iRight = -1;
  let iLeft = -1;
  for (let i = 0; i < pupil.length; i++) {
    const p = pupil[i] as Point;
    if (p.y <= cy) continue;
    if (iRight < 0 || Math.abs(p.x - xR) < Math.abs((pupil[iRight] as Point).x - xR)) iRight = i;
    if (iLeft < 0 || Math.abs(p.x - xL) < Math.abs((pupil[iLeft] as Point).x - xL)) iLeft = i;
  }
  if (iRight < 0 || iLeft < 0 || iRight === iLeft) return null;

  // The body's underside between the walls, as an index range. Taken as first
  // and last rather than as a set: a lobe can put one point back outside the
  // pair, and an opening with an island in it is not an opening.
  let first = -1;
  let last = -1;
  for (let i = 0; i < n; i++) {
    const p = outer[i] as Point;
    if (p.y <= cy || p.x < xL || p.x > xR) continue;
    if (first < 0) first = i;
    last = i;
  }
  if (first < 0 || last - first >= n / 2 - 1) return null;

  const arc: Point[] = [];
  for (let k = 0, i = (last + 1) % n; k < n - (last - first + 1); k++, i = (i + 1) % n) {
    arc.push(outer[i] as Point);
  }
  const head = arc[0] as Point;
  const tail = arc[arc.length - 1] as Point;
  const edge = [
    pupil[iLeft] as Point,
    ...along(pupil[iLeft] as Point, head, 3),
    ...arc,
    ...along(tail, pupil[iRight] as Point, 3),
    pupil[iRight] as Point,
  ];

  // The pupil from its right shoulder back over the top to its left one. Over
  // the top and never under: the material below it is what has just been cut
  // away, and an edge drawn there is an edge round nothing.
  const lip: Point[] = [];
  for (let k = 0, i = iRight; k <= pupil.length; k++) {
    lip.push(pupil[i] as Point);
    if (i === iLeft) break;
    i = (i - 1 + pupil.length) % pupil.length;
  }

  return {
    contour: [...edge, ...lip.slice(1, -1)],
    edge,
    lip,
    from: turn(tail, cx, cy),
    to: turn(head, cx, cy),
  };
}
