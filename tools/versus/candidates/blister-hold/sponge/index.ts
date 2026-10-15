import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawSpongeBody } from "./draw.js";

/**
 * SPONGE — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:hold`: PALM, HUG and
 * SPONGE.
 */
export const BLISTER_SPONGE: Variant = {
  slot: "blister:hold",
  name: "sponge",
  sentence:
    "A holed yellow sponge comes up with the drop in a hollow on top — under a thumb it gives a little and drinks, the wet spreading out through it as the hold fills.",
  dir: "tools/versus/candidates/blister-hold/sponge",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.hold,
      reached: () => bodies.BLISTER_BODY.hold,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.hold",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawSpongeBody },
    }),
  ],
};
