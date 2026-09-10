import * as magnetLook from "../../../../../packages/render/src/magnet-look.js";
import { patch, type Variant } from "../../../variant.js";
import { rod } from "./paint.js";

/**
 * `creature:magnet` / `rod` — a bent bar with a round section, cut square at
 * the ends, over a plate with an edge.
 *
 * **What the shipped side is.** `coil` (`magnet-coil.ts`): the horseshoe
 * filled dark and lit by the key as a round thing, a bevel inside the rim,
 * the poles lit from their tips, the plate as a lighter slab with the ramp
 * across it. It reads as a solid — but as a solid *disc* with a hole in it,
 * because nothing on it says how thick the bar is.
 *
 * **What this argues.** Three thicknesses, each one drawn. The arch carries a
 * crest — a band of light along its middle radius falling off to both edges,
 * which is what a bar with a round section does under a light and what a
 * flat ring cannot. Each pole ends in a cut face: an ellipse of the pole's
 * own colour standing across the end of the arm, foreshortened as the end of
 * a rod is, so the arm has an *end* rather than stopping. And the plate and
 * the staff are extruded, a darker copy showing under the front face as the
 * side of a slab — the one part of this body whose whole rule is *thick*,
 * finally with a side.
 *
 * **What it does not touch.** The silhouette, which is `magnet.ts`'s paths;
 * the poles' gradient and the lanes, which are `coil`'s own passes called as
 * they are; the key light, which is `litRound` and `litBox`.
 *
 * **How it can lose.** *The cut face is a third lamp.* At twenty-eight pixels
 * a coloured ellipse on the end of the arm is bigger than the tip's own glow,
 * and if the pair reads it as the thing to hit rather than as the end of the
 * thing that carries the colour, the face has moved where they look — and
 * where they look is the whole of what a pole is for. The squash is what
 * keeps it a face and not a disc; if it is not enough, the face goes.
 */
export const MAGNET_ROD: Variant = {
  slot: "creature:magnet",
  name: "rod",
  sentence:
    "the horseshoe as a bar with a round section — a crest of light along its middle, a cut face of colour across each pole's end, and a plate with a side",
  dir: "tools/versus/candidates/creature-magnet/rod",
  patches: [
    patch({
      target: magnetLook.MAGNET_LOOK,
      reached: () => magnetLook.MAGNET_LOOK,
      where: {
        file: "packages/render/src/magnet-look.ts",
        symbol: "MAGNET_LOOK",
      },
      fields: { body: rod },
    }),
  ],
};
