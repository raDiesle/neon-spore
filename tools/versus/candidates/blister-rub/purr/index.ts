import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawPurrBody } from "./draw.js";

/**
 * PURR — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:rub`: URCHIN, WASHBOARD
 * and PURR.
 */
export const BLISTER_PURR: Variant = {
  slot: "blister:rub",
  name: "purr",
  sentence:
    "A furry mound with pointed ears carries the drop on its back — its fur lies smooth until rubbed, bristles more with every blow, and its eyes close happy under a thumb.",
  dir: "tools/versus/candidates/blister-rub/purr",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.rub,
      reached: () => bodies.BLISTER_BODY.rub,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.rub",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawPurrBody },
    }),
  ],
};
