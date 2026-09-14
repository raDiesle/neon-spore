import { clubbedPoints } from "./body-path-clubbed.js";
import { blobRadiusMul, catmullRomToBezierPath, type Point } from "./shapes.js";
import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * The contour of one living body, and the one call every site that draws one
 * makes.
 *
 * Every body on the field used to be `blobPath(0, 0, shape.rx, shape.ry, …)`
 * written out at each of the eight places that draw a creature — the field,
 * the strips, the control glyphs, the dart's previewed path, a rind shedding a
 * layer, a veil tearing. That was one shape family and one call, so the
 * repetition cost nothing. It stopped being one family the day THE THROB grew
 * a rim of clubs: eight copies of "a body is a blob" is eight places that draw
 * a throb as a plain ball, and seven of them are exactly the small pictures a
 * player checks a body's name against.
 *
 * So the family lives here. `livingPath` asks the silhouette what it is and
 * nothing else has to know (`packages/sim/test/purity.test.ts` carries the row).
 *
 * This file is the asking. A walk that is not a sampled blob is a file of its
 * own — the clubbed rim is `body-path-clubbed.ts`, a carried contour is the
 * silhouette's own — so the router stays a page however many shapes a radius
 * cannot describe the field grows.
 */

/**
 * The points of one living body's contour at time `t`, centred on the origin
 * and at the silhouette's own `rx`/`ry` — `sizeMul` is deliberately not applied,
 * because every draw site folds it into a scale it is setting anyway.
 *
 * `n` is how many samples a plain blob takes and is ignored by a walked rim or
 * contour: how many points a club needs is a fact about the club, not the caller.
 */
export function livingPoints(shape: CreatureSilhouette, t: number, n = 40): Point[] {
  // A form carried whole is walked as it is, and `n` is its own business too.
  if (shape.contour) return shape.contour(t);
  if (shape.clubs) return clubbedPoints(shape, shape.clubs, t);
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const m = blobRadiusMul(a, shape.lobes, shape.depth, shape.wobble, t, shape.seed);
    pts.push({ x: Math.cos(a) * shape.rx * m, y: Math.sin(a) * shape.ry * m });
  }
  return pts;
}

/**
 * How many features an eye counts round this body's rim — the number the pair
 * would say out loud, and the number `tools/shape-sheet`'s lobe axis measures.
 *
 * Its clubs where it wears them, and its lobes otherwise. A clubbed body's
 * `lobes` describes the *core*, which is under the rim and invisible: the throb
 * is authored with three of them and nobody will ever count three of anything
 * on it. Read through here rather than off `lobes`, or a gate meant to hold two
 * bodies apart is checking a number that is not on the screen.
 */
export function rimCount(shape: CreatureSilhouette): number {
  return shape.clubs?.clubs ?? shape.lobes;
}

/** The same contour as a path string, which is what a canvas wants. */
export function livingPath(shape: CreatureSilhouette, t: number, n = 40): string {
  return catmullRomToBezierPath(livingPoints(shape, t, n));
}
