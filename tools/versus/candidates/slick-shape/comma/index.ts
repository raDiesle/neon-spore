import * as silhouettes from "../../../../../packages/content/src/silhouettes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `slick:shape` / `comma` — one lobe, and a tail.
 *
 * **What this argues.** That the slick should have a *head end*. One deep lobe
 * on a body a third taller than the shipped one: a tadpole rather than two sacs,
 * with a fat end and a drawn-out one. It is the only candidate in this slot
 * whose outline is asymmetric along the long axis, which is the cheapest way a
 * shape says which way it is going without anything moving.
 *
 * **How it can lose.** *THE DART already owns a point.* The dart is the body
 * that has a direction, and it is the shape a pair has learned to read as
 * *steering*. A slick with a head is a slick that could be mistaken for one at
 * the size both are drawn — and that is a confusion between two creatures
 * rather than a matter of taste.
 */
export const SLICK_COMMA: Variant = {
  slot: "slick:shape",
  name: "comma",
  sentence: "one deep lobe and a drawn-out tail — a body with a head end, not two sacs",
  dir: "tools/versus/candidates/slick-shape/comma",
  patches: [
    patch({
      target: silhouettes.SLICK,
      reached: () => silhouettes.SLICK,
      where: {
        file: "packages/content/src/silhouettes.ts",
        symbol: "SLICK",
        type: "CreatureSilhouette",
      },
      fields: { lobes: 1, depth: 0.42, wobble: 0.05, rx: 64, ry: 54, seed: 0 },
    }),
  ],
};
