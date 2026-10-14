import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawCradleBody } from "./draw.js";

/**
 * CRADLE — offered 14 October 2026, from the owner's ask the same day: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:tap`: MOLE, RIDER and
 * CRADLE.
 */
export const BLISTER_CRADLE: Variant = {
  slot: "blister:tap",
  name: "cradle",
  sentence:
    "Only its arms come up — two tentacles out of the pore, round either side of the press and curled over it, holding the button up like a pearl.",
  dir: "tools/versus/candidates/blister-tap/cradle",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.tap,
      reached: () => bodies.BLISTER_BODY.tap,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.tap",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawCradleBody },
    }),
  ],
};
