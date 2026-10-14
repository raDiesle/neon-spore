import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/reprise-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `reprise:glance`: SWAY, LOOK and COCK.
 */
export const REPRISE_LOOK_AROUND: Variant = {
  slot: "reprise:glance",
  name: "look",
  sentence:
    "look — the sac holds a turn ahead, to the left, ahead and to the right, turning briskly between them and swinging toward where it turns, like a camera panning.",
  dir: "tools/versus/candidates/reprise-glance/look",
  patches: [
    patch({
      target: glance.REPRISE_GLANCE,
      reached: () => glance.REPRISE_GLANCE,
      where: {
        file: "packages/render/src/reprise-glance.ts",
        symbol: "REPRISE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.REPRISE_GLANCE_SIZE),
    }),
  ],
};
