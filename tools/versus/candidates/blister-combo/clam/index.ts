import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawClamBody } from "./draw.js";

/**
 * CLAM — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:combo`: BUD, CLAM and
 * CURL.
 */
export const BLISTER_CLAM: Variant = {
  slot: "blister:combo",
  name: "clam",
  sentence:
    "A clam gapes up out of the pore with the press lying in it like a pearl — the press snaps it shut, and its red tongue slides out of the seam to the knob.",
  dir: "tools/versus/candidates/blister-combo/clam",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.combo,
      reached: () => bodies.BLISTER_BODY.combo,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.combo",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawClamBody },
    }),
  ],
};
