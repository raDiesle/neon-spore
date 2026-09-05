/**
 * The angular family: a shape drawn with `crystalPath` rather than a lobed
 * contour, because it does not live.
 *
 * Cut out of `silhouettes.ts` when THE THROB's clubbed rim took that file past
 * its 250-line limit, along the seam it had always had. What is left there is
 * the lobed bodies and the interface they share; this is the material that is
 * deliberately not one of them — docs/spec/graphics.md hangs the whole
 * indestructibility rule on a rock not reading as an organism, and the two
 * families have never had a reason to change together.
 *
 * Re-exported from `silhouettes.ts`, so nothing that already reaches for a
 * `METEOR` through that file had to move.
 */

export interface CrystalSilhouette {
  sides: number;
  depth: number;
  wobble: number;
  seed: number;
}

/**
 * Meteor: angular facets, not a contour. It gets `crystalPath` rather than
 * `blobPath` precisely because it does not live — docs/spec/graphics.md hangs the whole
 * indestructibility rule on that fiction, so the rock must not read as an
 * organism. Almost no wobble, for the same reason.
 */
export const METEOR: CrystalSilhouette = {
  sides: 7,
  depth: 0.15,
  wobble: 0.01,
  seed: 5.0,
};

/**
 * The torch's original shape — more sides and deeper facets than `METEOR`,
 * the same non-living crystal material. The live torch now draws as a plain
 * `METEOR` instead (`packages/render/src/torch.ts`); this silhouette lives on
 * as a spare shape nothing draws, a starting point for a future creature.
 * Judge changes with `bun run shapes:report` before
 * eyeballing the sheet.
 */
export const TORCH: CrystalSilhouette = {
  sides: 9,
  depth: 0.22,
  wobble: 0.02,
  seed: 8.0,
};

/**
 * The Bulb Queen's shell: the same angular, non-living material as the rock
 * she spits, not a scaled-up `BULB`. Many facets for a big, cracked-plate
 * read, and just enough wobble that the shell visibly shifts and the "faster
 * as she weakens" tell still has something to speed up.
 */
export const QUEEN_SHELL: CrystalSilhouette = {
  sides: 16,
  depth: 0.22,
  wobble: 0.03,
  seed: 9.0,
};
