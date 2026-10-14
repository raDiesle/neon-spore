import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/nettle-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn, especially the head*.
 * One of three answers in `nettle:glance`: SWAY, LOOK and COCK.
 */
export const NETTLE_COCK: Variant = {
  slot: "nettle:glance",
  name: "cock",
  sentence:
    "The jellyfish turns its bell and tips it as it does — a head cocked at the ship — and holds before it turns back.",
  dir: "tools/versus/candidates/nettle-glance/cock",
  patches: [
    patch({
      target: glance.NETTLE_GLANCE,
      reached: () => glance.NETTLE_GLANCE,
      where: {
        file: "packages/render/src/nettle-glance.ts",
        symbol: "NETTLE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.NETTLE_GLANCE_SIZE),
    }),
  ],
};
