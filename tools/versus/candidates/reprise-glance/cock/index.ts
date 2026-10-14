import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/reprise-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `reprise:glance`: SWAY, LOOK and COCK.
 */
export const REPRISE_COCK: Variant = {
  slot: "reprise:glance",
  name: "cock",
  sentence:
    "cock — the sac turns left and right on the sine and swings side to side from its cords three times a round, like a camera sizing up the shot.",
  dir: "tools/versus/candidates/reprise-glance/cock",
  patches: [
    patch({
      target: glance.REPRISE_GLANCE,
      reached: () => glance.REPRISE_GLANCE,
      where: {
        file: "packages/render/src/reprise-glance.ts",
        symbol: "REPRISE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.REPRISE_GLANCE_SIZE),
    }),
  ],
};
