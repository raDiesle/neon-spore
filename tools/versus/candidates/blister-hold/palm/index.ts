import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawPalmBody } from "./draw.js";

/**
 * PALM — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:hold`: PALM, HUG and
 * SPONGE.
 */
export const BLISTER_PALM: Variant = {
  slot: "blister:hold",
  name: "palm",
  sentence:
    "A slime hand comes up palm up with the drop cupped in it like water — its fingers stand open round the drop, and curl in over it while a thumb holds it.",
  dir: "tools/versus/candidates/blister-hold/palm",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.hold,
      reached: () => bodies.BLISTER_BODY.hold,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.hold",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawPalmBody },
    }),
  ],
};
