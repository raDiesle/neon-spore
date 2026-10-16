import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * **THE GLUTTON is GULLET: BULB · CLOVER and SLICK · REVERB**, two drafts off
 * the shape sheet combined and named here (`tools/shape-sheet/src/drafts/offered.ts`).
 *
 * CLOVER gives the count and the depth: four deep lobes, the largest number a
 * player reads at a glance without counting. REVERB gives the proportion, 72
 * by 42, the widest body in its family — a belly stretched across its lane,
 * which is what a thing that eats looks like before it has eaten. Each meal
 * is drawn on top of this (`render/glutton.ts`); the contour here is the
 * hungry one.
 *
 * Neither draft is worn this way today: THE BLISTER wears CLOVER round, with
 * roots under it, and THE TRAPEZE took REVERB as its spindle.
 */
export const GLUTTON: CreatureSilhouette = {
  lobes: 4,
  depth: 0.34,
  wobble: 0.045,
  rx: 72,
  ry: 42,
  seed: 1,
};
