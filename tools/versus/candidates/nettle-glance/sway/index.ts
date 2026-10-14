import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/nettle-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn, especially the head*.
 * One of three answers in `nettle:glance`: SWAY, LOOK and COCK.
 */
export const NETTLE_SWAY: Variant = {
  slot: "nettle:glance",
  name: "sway",
  sentence:
    "The jellyfish's bell turns slowly to one side and the other — its far side going away into the dark and coming back.",
  dir: "tools/versus/candidates/nettle-glance/sway",
  patches: [
    patch({
      target: glance.NETTLE_GLANCE,
      reached: () => glance.NETTLE_GLANCE,
      where: {
        file: "packages/render/src/nettle-glance.ts",
        symbol: "NETTLE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.NETTLE_GLANCE_SIZE),
    }),
  ],
};
