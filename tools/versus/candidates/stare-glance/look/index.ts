import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/stare-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `stare:glance`: SWAY, LOOK and COCK.
 */
export const STARE_LOOK_AROUND: Variant = {
  slot: "stare:glance",
  name: "look",
  sentence:
    "look — the head holds a turn ahead, to the left, ahead and to the right, turning briskly between them and leaning toward where it looks.",
  dir: "tools/versus/candidates/stare-glance/look",
  patches: [
    patch({
      target: glance.STARE_GLANCE,
      reached: () => glance.STARE_GLANCE,
      where: {
        file: "packages/render/src/stare-glance.ts",
        symbol: "STARE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.STARE_GLANCE_SIZE),
    }),
  ],
};
