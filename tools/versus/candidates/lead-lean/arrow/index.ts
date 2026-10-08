import * as lean from "../../../../../packages/render/src/lead-lean.js";
import { patch, type Variant } from "../../../variant.js";
import { paintLeanArrow } from "./paint.js";

/**
 * ARROW — offered 8 October 2026, the first of THE LEAD's three unbuilt
 * looks (bosses.md §11.29): the lean drawn as an arrow with a length to it,
 * where the game only tilts the stalk. The length is the pace, a chevron a
 * column, on the pilot's screen alone.
 */
export const LEAD_ARROW: Variant = {
  slot: "lead:lean",
  name: "arrow",
  sentence:
    "arrow — out of the stalk's tip the way the body goes, a chevron for each column it moves a beat, on the pilot's screen alone",
  dir: "tools/versus/candidates/lead-lean/arrow",
  patches: [
    patch({
      target: lean.LEAN_LOOK,
      reached: () => lean.LEAN_LOOK,
      where: { file: "packages/render/src/lead-lean.ts", symbol: "LEAN_LOOK", type: "LeanLook" },
      fields: { draw: paintLeanArrow },
    }),
  ],
};
