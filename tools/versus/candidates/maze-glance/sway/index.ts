import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/maze-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `maze:glance`: SWAY, LOOK and COCK.
 */
export const MAZE_SWAY: Variant = {
  slot: "maze:glance",
  name: "sway",
  sentence:
    "sway — the heart in the middle turns from showing its left side to its right and back on one slow sine, about the centre a shot arrives at.",
  dir: "tools/versus/candidates/maze-glance/sway",
  patches: [
    patch({
      target: glance.MAZE_GLANCE,
      reached: () => glance.MAZE_GLANCE,
      where: { file: "packages/render/src/maze-glance.ts", symbol: "MAZE_GLANCE", type: "Glance" },
      fields: glanceOf(sway, glance.MAZE_GLANCE_SIZE),
    }),
  ],
};
