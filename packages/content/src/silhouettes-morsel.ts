import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * **THE MORSEL is DUMPLING: BULB · PEAR and BULB · SPIKE**, two drafts off the
 * shape sheet combined and named here (`tools/shape-sheet/src/drafts/offered.ts`).
 *
 * PEAR gives the proportion: a body taller than it is wide, 46 by 56 — a drop,
 * a mouthful, the one outline in the game that stands up rather than lies
 * across its lane. SPIKE gives the count: eight, at well under half its depth,
 * so they are pleats round a dumpling rather than arms. Eight is a count no
 * other body wears (`nameability.ts`), and pleats read soft before anybody has
 * shot it — soft is the creature, the thing a shot does not finish.
 *
 * PEAR's own single lobe could not come with it: one lobe on an ellipse is
 * measured as two, the slick's word. Neither draft is worn at creature size
 * today — THE VISE took PEAR split as a boss three tiles high, THE LAMPREY took
 * SPIKE's points as a sucker's teeth.
 */
export const MORSEL: CreatureSilhouette = {
  lobes: 8,
  depth: 0.14,
  wobble: 0.05,
  rx: 46,
  ry: 56,
  seed: Math.PI / 2,
};
