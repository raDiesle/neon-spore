import * as glance from "../../../../../packages/render/src/cairn-glance.js";
import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `cairn:glance`: SWAY, LOOK and COCK.
 */
export const CAIRN_LOOK_AROUND: Variant = {
  slot: "cairn:glance",
  name: "look",
  sentence:
    "look — the pile holds a look ahead, to the left, ahead and to the right, turning briskly between them and leaning toward where it looks.",
  dir: "tools/versus/candidates/cairn-glance/look",
  patches: [
    patch({
      target: glance.CAIRN_GLANCE,
      reached: () => glance.CAIRN_GLANCE,
      where: {
        file: "packages/render/src/cairn-glance.ts",
        symbol: "CAIRN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.CAIRN_GLANCE_SIZE),
    }),
  ],
};
