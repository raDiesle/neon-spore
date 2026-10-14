import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/sinew-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `sinew:glance`: SWAY, LOOK and COCK.
 */
export const SINEW_COCK: Variant = {
  slot: "sinew:glance",
  name: "cock",
  sentence:
    "cock — the mass cocks aside on its fibres and turns a little, about the centre its handles rest beside.",
  dir: "tools/versus/candidates/sinew-glance/cock",
  patches: [
    patch({
      target: glance.SINEW_GLANCE,
      reached: () => glance.SINEW_GLANCE,
      where: {
        file: "packages/render/src/sinew-glance.ts",
        symbol: "SINEW_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.SINEW_GLANCE_SIZE),
    }),
  ],
};
