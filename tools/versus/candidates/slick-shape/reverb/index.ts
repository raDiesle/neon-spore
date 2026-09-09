import * as silhouettes from "../../../../../packages/content/src/silhouettes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `slick:shape` / `reverb` — REVERB's contour, on the slick's proportion.
 *
 * **This one is lifted from the drafts rather than invented**, which is the
 * rule the owner gave on 9 September 2026: a candidate outline does not reuse a
 * shape the game already draws, and where it can it comes out of the unused
 * collection instead. REVERB is a draft creature in
 * `tools/shape-sheet/src/drafts/creatures.ts`, offered to an idea called Reverb
 * and never built — three lobes at `depth` 0.24 with `seed` 6.1, deliberately
 * plain so it would not be mistaken for the Herald beside it. Its numbers are
 * here unchanged except for the proportion, which is stretched from 46 × 40 to
 * the slick's own footprint.
 *
 * **What it replaces, and why.** The candidate that stood here was a trefoil at
 * `seed` 2π — which is THE DART's construction exactly, three lobes with an
 * apex on the long axis and two swept back. Different depth, same arithmetic
 * and the same drawn shape: a second body built the way one already in the game
 * is built. That is the thing the rule exists to stop.
 *
 * **What it argues.** That the slick should be *even*: three lobes at a modest
 * depth carried across a long body, no waist, no head, nothing to count in a
 * hurry. It is the quietest of the five, and it is here so that the loud ones
 * have something to be loud against.
 *
 * **How it can lose.** *Plain reads as unfinished.* The draft's own note says
 * the contour was kept plain on purpose because the creature's whole idea lived
 * in its motion — and the slick's motion is a swim, not a delay, so the reason
 * that shape was plain does not come with it.
 */
export const SLICK_REVERB: Variant = {
  slot: "slick:shape",
  name: "reverb",
  sentence:
    "the REVERB draft's even three-lobed edge, stretched onto the slick — no waist and no head",
  dir: "tools/versus/candidates/slick-shape/reverb",
  patches: [
    patch({
      target: silhouettes.SLICK,
      reached: () => silhouettes.SLICK,
      where: {
        file: "packages/content/src/silhouettes.ts",
        symbol: "SLICK",
        type: "CreatureSilhouette",
      },
      fields: { lobes: 3, depth: 0.24, wobble: 0.06, rx: 72, ry: 42, seed: 6.1 },
    }),
  ],
};
