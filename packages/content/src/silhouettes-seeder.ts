import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * **THE SEEDER is SEED HEAD: BULB · BURR and SLICK · COMMA**, two drafts off
 * the shape sheet combined and named here (`tools/shape-sheet/src/drafts/offered.ts`).
 *
 * BURR gives the edge: twelve small lobes, past counting on purpose — a seed
 * head, a thing covered in something, which is the creature before anybody
 * has read its blurb: it is carrying what it will leave behind. COMMA gives
 * the proportion, 64 by 54, wider than it is tall, so it sits heavy in its
 * lane where THE MORSEL stands up. COMMA's own single deep lobe could not
 * come with it: one lobe on an ellipse is measured as two, the slick's word.
 *
 * Neither draft is worn at creature size today: THE VISE took BURR as the
 * bristle on a boss's seed-case, split by PEAR, and THE TRAPEZE took COMMA
 * laid along a bent line as its flag.
 */
export const SEEDER: CreatureSilhouette = {
  lobes: 12,
  depth: 0.15,
  wobble: 0.05,
  rx: 64,
  ry: 54,
  seed: 1,
};
