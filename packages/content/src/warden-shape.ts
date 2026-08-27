import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * THE WARDEN's body, and the only silhouette in the game with a hole in it.
 *
 * Its own file rather than a section of `silhouettes.ts`, because it is the
 * one shape there made of two loops instead of one: everything else on that
 * page is a single contour tuned by lobes, depth and wobble, and a ring is two
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
