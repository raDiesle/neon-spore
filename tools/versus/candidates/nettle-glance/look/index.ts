import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/nettle-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn, especially the head*.
 * One of three answers in `nettle:glance`: SWAY, LOOK and COCK.
 */
export const NETTLE_LOOK_AROUND: Variant = {
  slot: "nettle:glance",
  name: "look",
  sentence:
    "The jellyfish turns its bell to one side and holds there — then brings it round the other way and holds again.",
  dir: "tools/versus/candidates/nettle-glance/look",
  patches: [
    patch({
      target: glance.NETTLE_GLANCE,
      reached: () => glance.NETTLE_GLANCE,
      where: {
        file: "packages/render/src/nettle-glance.ts",
        symbol: "NETTLE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.NETTLE_GLANCE_SIZE),
    }),
  ],
};
