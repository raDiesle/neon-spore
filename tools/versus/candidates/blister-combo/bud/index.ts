import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawBudBody } from "./draw.js";

/**
 * BUD — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:combo`: BUD, CLAM and
 * CURL.
 */
export const BLISTER_BUD: Variant = {
  slot: "blister:combo",
  name: "bud",
  sentence:
    "A flower comes up with the press as its heart — the press shuts it into a bud, and a green stalk runs out of its side to the knob as far as the thumb draws it.",
  dir: "tools/versus/candidates/blister-combo/bud",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.combo,
      reached: () => bodies.BLISTER_BODY.combo,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.combo",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawBudBody },
    }),
  ],
};
