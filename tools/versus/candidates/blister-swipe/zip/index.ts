import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawZipBase, drawZipPod } from "./draw.js";

/**
 * ZIP — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:swipe`: SLUG, FROG and
 * ZIP.
 */
export const BLISTER_ZIP: Variant = {
  slot: "blister:swipe",
  name: "zip",
  sentence:
    "A long pod lies out along the channel zipped shut — the knob is its zip's pull, the seam gaping open behind it and still toothed shut ahead, as far as is left to stroke.",
  dir: "tools/versus/candidates/blister-swipe/zip",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.swipe,
      reached: () => bodies.BLISTER_BODY.swipe,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.swipe",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawZipBase, beyond: drawZipPod },
    }),
  ],
};
