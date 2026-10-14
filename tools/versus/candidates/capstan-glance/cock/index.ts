import * as glance from "../../../../../packages/render/src/capstan-glance.js";
import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `capstan:glance`: SWAY, LOOK and COCK.
 */
export const CAPSTAN_COCK: Variant = {
  slot: "capstan:glance",
  name: "cock",
  sentence:
    "The whole drum turns between its faces and tips as it does — and holds before it turns back.",
  dir: "tools/versus/candidates/capstan-glance/cock",
  patches: [
    patch({
      target: glance.CAPSTAN_GLANCE,
      reached: () => glance.CAPSTAN_GLANCE,
      where: {
        file: "packages/render/src/capstan-glance.ts",
        symbol: "CAPSTAN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.CAPSTAN_GLANCE_SIZE),
    }),
  ],
};
