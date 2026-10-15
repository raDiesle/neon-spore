import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawFrogBody, drawFrogTongue } from "./draw.js";

/**
 * FROG — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:swipe`: SLUG, FROG and
 * ZIP.
 */
export const BLISTER_FROG: Variant = {
  slot: "blister:swipe",
  name: "frog",
  sentence:
    "A squat frog comes up with its mouth and eyes on the side the stroke runs — the knob is its tongue's tip, and the tongue runs out behind it as far as the thumb takes it.",
  dir: "tools/versus/candidates/blister-swipe/frog",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.swipe,
      reached: () => bodies.BLISTER_BODY.swipe,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.swipe",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawFrogBody, beyond: drawFrogTongue },
    }),
  ],
};
