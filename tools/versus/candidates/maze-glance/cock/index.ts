import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/maze-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `maze:glance`: SWAY, LOOK and COCK.
 */
export const MAZE_COCK: Variant = {
  slot: "maze:glance",
  name: "cock",
  sentence:
    "cock — the heart turns left and right on the sine and cocks itself side to side three times a round.",
  dir: "tools/versus/candidates/maze-glance/cock",
  patches: [
    patch({
      target: glance.MAZE_GLANCE,
      reached: () => glance.MAZE_GLANCE,
      where: { file: "packages/render/src/maze-glance.ts", symbol: "MAZE_GLANCE", type: "Glance" },
      fields: glanceOf(cock, glance.MAZE_GLANCE_SIZE),
    }),
  ],
};
