import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/vane-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `vane:glance`: SWAY, LOOK and COCK.
 */
export const VANE_COCK: Variant = {
  slot: "vane:glance",
  name: "cock",
  sentence:
    "cock — THE VANE's bearing turns on its hub toward one end and the other and tips side to side three times as fast, so the mount keeps changing its angle while the hub stays where a shot finds it",
  dir: "tools/versus/candidates/vane-glance/cock",
  patches: [
    patch({
      target: glance.VANE_GLANCE,
      reached: () => glance.VANE_GLANCE,
      where: { file: "packages/render/src/vane-glance.ts", symbol: "VANE_GLANCE", type: "Glance" },
      fields: glanceOf(cock, glance.VANE_GLANCE_SIZE),
    }),
  ],
};
