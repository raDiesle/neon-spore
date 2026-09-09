import * as silhouettes from "../../../../../packages/content/src/silhouettes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `slick:shape` / `ray` — flat and wide, with a shallow scallop.
 *
 * **This slot reopens a decided question, on purpose.** `creature:slick` /
 * `pinch` was taken on 8 September 2026 and `DECIDED.md` records it; the owner
 * asked on 9 September for completely different shapes for both first bodies,
 * so the outline is open again. Every candidate here keeps the ammunition
 * colour, which is the one thing about a creature that is a rule rather than a
 * look.
 *
 * **What this argues.** That the slick should be the *flattest* thing on the
 * field. The shipped body is a deep waist between two sacs; this is one wide
 * sheet with three shallow scallops along its edge, half the height and wider
 * than anything else that falls. A pair reading a column at speed gets a shape
 * that is unmistakably horizontal.
 *
 * **How it can lose.** *Flat is close to a bar.* At twenty-six pixels a body
 * this shallow may stop reading as a creature and start reading as furniture —
 * a rung, a lip, a piece of the frame.
 */
export const SLICK_RAY: Variant = {
  slot: "slick:shape",
  name: "ray",
  sentence:
    "one wide flat sheet with seven shallow scallops — the most horizontal thing on the field",
  dir: "tools/versus/candidates/slick-shape/ray",
  patches: [
    patch({
      target: silhouettes.SLICK,
      // `livingSilhouette` is the route every drawing and every hit test takes
      // to this record, and it hands back the export itself.
      reached: () => silhouettes.SLICK,
      where: {
        file: "packages/content/src/silhouettes.ts",
        symbol: "SLICK",
        type: "CreatureSilhouette",
      },
      fields: { lobes: 7, depth: 0.13, wobble: 0.03, rx: 80, ry: 34, seed: 0 },
    }),
  ],
};
