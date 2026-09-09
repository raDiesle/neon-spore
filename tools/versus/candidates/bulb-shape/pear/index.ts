import * as silhouettes from "../../../../../packages/content/src/silhouettes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `bulb:shape` / `pear` — taller than it is wide, and heavier at one end.
 *
 * **What this argues.** That the bulb should stop being symmetrical. One lobe
 * placed by a quarter-turn seed on a body taller than it is wide: a fruit
 * hanging, with a fat end and a narrow one. Every other body in the game is
 * either symmetrical about its long axis or pointed along it; this is the only
 * shape that is simply *heavier at the bottom*, which is a thing a falling body
 * can honestly be.
 *
 * **It is the only candidate in this slot that changes the proportion** rather
 * than the count — 46 by 56 against the shipped 52 square — which is the axis
 * `nameability.ts` measures first, and the reason to look at it beside the
 * others rather than on its own.
 *
 * **How it can lose.** *Tall is the slick's business turned ninety degrees.*
 * The two first bodies are told apart mostly by proportion — one long, one
 * round — and a bulb with a proportion of its own spends that difference.
 */
export const BULB_PEAR: Variant = {
  slot: "bulb:shape",
  name: "pear",
  sentence: "one lobe on a body taller than it is wide — a thing hanging, heavier at the bottom",
  dir: "tools/versus/candidates/bulb-shape/pear",
  patches: [
    patch({
      target: silhouettes.BULB,
      reached: () => silhouettes.BULB,
      where: {
        file: "packages/content/src/silhouettes.ts",
        symbol: "BULB",
        type: "CreatureSilhouette",
      },
      fields: { lobes: 1, depth: 0.28, wobble: 0.05, rx: 46, ry: 56, seed: Math.PI / 2 },
    }),
  ],
};
