import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawHugBody } from "./draw.js";

/**
 * HUG — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:hold`: PALM, HUG and
 * SPONGE.
 */
export const BLISTER_HUG: Variant = {
  slot: "blister:hold",
  name: "hug",
  sentence:
    "A round slime comes up hugging the drop to its belly — its arms rest loose round it, and under a thumb they wrap in under it and its eyes squeeze shut.",
  dir: "tools/versus/candidates/blister-hold/hug",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.hold,
      reached: () => bodies.BLISTER_BODY.hold,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.hold",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawHugBody },
    }),
  ],
};
