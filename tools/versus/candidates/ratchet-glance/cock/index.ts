import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/ratchet-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `ratchet:glance`: SWAY, LOOK and COCK.
 */
export const RATCHET_COCK: Variant = {
  slot: "ratchet:glance",
  name: "cock",
  sentence:
    "The rack turns in its strut and tips as it does — a shaft cocked on its pawl — and holds before it turns back.",
  dir: "tools/versus/candidates/ratchet-glance/cock",
  patches: [
    patch({
      target: glance.RATCHET_GLANCE,
      reached: () => glance.RATCHET_GLANCE,
      where: {
        file: "packages/render/src/ratchet-glance.ts",
        symbol: "RATCHET_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.RATCHET_GLANCE_SIZE),
    }),
  ],
};
