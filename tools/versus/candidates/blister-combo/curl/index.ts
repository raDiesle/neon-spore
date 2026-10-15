import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawCurlBody } from "./draw.js";

/**
 * CURL — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:combo`: BUD, CLAM and
 * CURL.
 */
export const BLISTER_CURL: Variant = {
  slot: "blister:combo",
  name: "curl",
  sentence:
    "A round slime comes up with the press on its back and its tail wound in a curl at its side — the press frees the tail, which runs out to the knob as far as the thumb draws it.",
  dir: "tools/versus/candidates/blister-combo/curl",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.combo,
      reached: () => bodies.BLISTER_BODY.combo,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.combo",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawCurlBody },
    }),
  ],
};
