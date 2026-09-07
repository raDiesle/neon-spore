import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * Beatbox: a rounded cabinet, and the one body on this roster whose contour is
 * *architecture* rather than an organism.
 *
 * Cut out of `silhouettes.ts` when this shape took that file over its
 * 250-line limit, on the same terms `crystals.ts` and `silhouettes-spare.ts`
 * were: one contour, on its own, because the argument for its numbers is
 * longer than the numbers are. `silhouettes.ts` re-exports it, so nothing
 * that already reaches for `BEATBOX` through that file had to move.
 *
 * **Four lobes, and the seed puts the corners on the diagonals.** A contour's
 * radius is `1 + depth · cos(lobes · a + seed)` (`hullRadiusMul`), so an apex
 * sits wherever `lobes · a + seed` is nought. At `π` with four lobes the
 * apexes land at 45°, 135°, 225° and 315° — corners on the diagonals, and
 * therefore *flats* at the top, the bottom and both sides. That is what makes
 * this read as a box with its edges rounded off standing squarely on its base,
 * rather than as a four-pointed star, and it is the whole shape: move the seed
 * an eighth of a turn and the flats become the corners, which is a diamond
 * balanced on a point.
 *
 * **Four is the last free lobe count and it is spent well here.** Slick has 2,
 * Choir, Throb and Dart have 3, Wisp 5 and Bulb 9, so the axis
 * `tools/shape-sheet/src/nameability.ts` measures separates this from every
 * one of them by a whole count — and unlike the other five, the count here is
 * *visible as a silhouette rather than as a rim*, because four shallow lobes
 * is a recognisable outline (a box) and not a number to be counted round an
 * edge. The pair says "box" and nobody has to count anything.
 *
 * `depth` at 0.22 is Wisp's figure and is there for Wisp's measured reason:
 * below about 0.2 the lobes stop being countable at all and the shape reads as
 * a plain circle on some frames, which for this body would lose the one thing
 * separating it from a bulb.
 *
 * Slightly wider than it is tall, which is a cabinet's proportion and also a
 * working difference from Bulb's exact 52 × 52. The **swelling** is not here:
 * a box grows and shrinks on every beat, and that is drawn against the beat
 * clock in `render/beatbox.ts` rather than baked into a contour, because a
 * silhouette is what a thing *is* and the pulse is what it is doing.
 */
export const BEATBOX: CreatureSilhouette = {
  lobes: 4,
  depth: 0.22,
  wobble: 0.04,
  rx: 54,
  ry: 48,
  seed: Math.PI,
};
