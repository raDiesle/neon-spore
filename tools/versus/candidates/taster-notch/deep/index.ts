import * as crest from "../../../../../packages/render/src/taster-crest.js";
import { patch, type Variant } from "../../../variant.js";
import { deepWet, paintDeep } from "./paint.js";

/**
 * DEEP — offered 7 October 2026, the look half of *THE TASTER keeps a depth
 * for each notch* (bosses.md §11.25). The game draws every gap the same,
 * brightened by the cuts into all of them; this draws each at its own.
 */
export const TASTER_DEEP: Variant = {
  slot: "taster:notch",
  name: "deep",
  sentence:
    "deep — each gap cut as deep as the pair has cut it: a dent where nobody has fired, a wet hole through the crest where they have",
  dir: "tools/versus/candidates/taster-notch/deep",
  patches: [
    patch({
      target: crest.NOTCH_LOOK,
      reached: () => crest.NOTCH_LOOK,
      where: {
        file: "packages/render/src/taster-crest.ts",
        symbol: "NOTCH_LOOK",
        type: "NotchLook",
      },
      fields: { wet: deepWet, paint: paintDeep },
    }),
  ],
};
