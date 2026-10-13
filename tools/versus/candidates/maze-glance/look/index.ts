import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/maze-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `maze:glance`: SWAY, LOOK and COCK.
 */
export const MAZE_LOOK_AROUND: Variant = {
  slot: "maze:glance",
  name: "look",
  sentence:
    "look — the heart holds a look ahead, to the left, ahead and to the right, turning briskly between them and leaning toward where it looks.",
  dir: "tools/versus/candidates/maze-glance/look",
  patches: [
    patch({
      target: glance.MAZE_GLANCE,
      reached: () => glance.MAZE_GLANCE,
      where: { file: "packages/render/src/maze-glance.ts", symbol: "MAZE_GLANCE", type: "Glance" },
      fields: glanceOf(look, glance.MAZE_GLANCE_SIZE),
    }),
  ],
};
