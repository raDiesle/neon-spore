import * as glance from "../../../../../packages/render/src/curtain-glance.js";
import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `curtain:glance`: SWAY, LOOK and COCK.
 */
export const CURTAIN_COCK: Variant = {
  slot: "curtain:glance",
  name: "cock",
  sentence:
    "cock — the bare core turns left and right on the sine and cocks itself side to side three times a round, like a thing caught out from behind the cloth.",
  dir: "tools/versus/candidates/curtain-glance/cock",
  patches: [
    patch({
      target: glance.CURTAIN_GLANCE,
      reached: () => glance.CURTAIN_GLANCE,
      where: {
        file: "packages/render/src/curtain-glance.ts",
        symbol: "CURTAIN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.CURTAIN_GLANCE_SIZE),
    }),
  ],
};
