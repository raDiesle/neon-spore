import * as silhouettes from "../../../../../packages/content/src/silhouettes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `bulb:shape` / `burr` — twelve, which is past counting on purpose.
 *
 * **What this argues.** That the bulb should be recognised by its *edge
 * quality* rather than by a number. Twelve small lobes is not a count anybody
 * will make; it is a burr, a seed head, a thing covered in something — and that
 * is a description a player can give without having counted anything.
 *
 * **It argues directly with what the shipped shape decided.** Nine shallow
 * lobes was thrown out for being a texture rather than a count, and six was
 * chosen because six can be counted (`silhouettes.ts`). This says the premise
 * was wrong: that a texture is a perfectly good way to name a body, and that
 * the way to make one work is to go *further* past counting rather than back
 * from it.
 *
 * **How it can lose, and it is the same way its ancestor did.** *Twelve small
 * lobes at twenty-six pixels is a rim that shimmers.* If the edge reads as
 * noise — and the contour is already breathing on its own clock — the body has
 * lost a feature and gained nothing.
 */
export const BULB_BURR: Variant = {
  slot: "bulb:shape",
  name: "burr",
  sentence:
    "twelve small lobes, past counting on purpose — a seed head named by its edge, not its number",
  dir: "tools/versus/candidates/bulb-shape/burr",
  patches: [
    patch({
      target: silhouettes.BULB,
      reached: () => silhouettes.BULB,
      where: {
        file: "packages/content/src/silhouettes.ts",
        symbol: "BULB",
        type: "CreatureSilhouette",
      },
      fields: { lobes: 12, depth: 0.15, wobble: 0.05, rx: 52, ry: 52, seed: 1 },
    }),
  ],
};
