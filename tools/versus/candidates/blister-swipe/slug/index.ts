import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawSlugHump, drawSlugStretched } from "./draw.js";

/**
 * SLUG — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:swipe`: SLUG, FROG and
 * ZIP.
 */
export const BLISTER_SLUG: Variant = {
  slot: "blister:swipe",
  name: "slug",
  sentence:
    "A slug humps up out of the pore and lies out along the channel — its back the channel, its head the knob, eye stalks reaching on the way to stroke, stretching as it is carried.",
  dir: "tools/versus/candidates/blister-swipe/slug",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.swipe,
      reached: () => bodies.BLISTER_BODY.swipe,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.swipe",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawSlugHump, beyond: drawSlugStretched },
    }),
  ],
};
