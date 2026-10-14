import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/valve-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `valve:glance`: SWAY, LOOK and COCK.
 */
export const VALVE_COCK: Variant = {
  slot: "valve:glance",
  name: "cock",
  sentence:
    "The whole drum turns and tips as it does — a machine cocked on its wheel — and holds before it turns back.",
  dir: "tools/versus/candidates/valve-glance/cock",
  patches: [
    patch({
      target: glance.VALVE_GLANCE,
      reached: () => glance.VALVE_GLANCE,
      where: {
        file: "packages/render/src/valve-glance.ts",
        symbol: "VALVE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.VALVE_GLANCE_SIZE),
    }),
  ],
};
