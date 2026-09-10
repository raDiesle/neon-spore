import * as rindLook from "../../../../../packages/render/src/rind-look.js";
import { patch, type Variant } from "../../../variant.js";
import { slough } from "./paint.js";

/**
 * `creature:rind` / `slough` — the skin drops off whole.
 *
 * **What the shipped side is.** The old contour thrown outward in every
 * direction at once and thinning as it goes, in a bloom. Even, radial and
 * weightless: it is how light leaves a thing, and a skin is not light.
 *
 * **What this argues.** That a skin just off a body is an empty bag, and an
 * empty bag falls. The worn contour is filled thinly with the body's own
 * colour, lit along the key so it has a bright side and a dark one, and
 * dropped under gravity — slow at first and well away by the end — while it
 * stretches long and pinches narrow, because it has nothing inside to hold it
 * open. Where the body left it there is a mouth: an ellipse of the cool inside
 * colour ringed in the rim, gathering shut as the skin slides away. Three
 * creases run down from it. The crush stays exactly as it ships: the size
 * going down a step is the health bar and not the material.
 *
 * **How it can lose.** *It goes where the shots come from.* A skin dropping
 * down the column is a thing moving toward the ship, and the pair reads
 * everything moving toward the ship as coming for it. It is translucent, has
 * no colour of its own and is gone inside half a second, which should be
 * enough — but if at the pair a falling skin reads as a second body in the
 * lane, it drops less far and fades sooner, or the whole idea loses.
 */
export const RIND_SLOUGH: Variant = {
  slot: "creature:rind",
  name: "slough",
  sentence:
    "the skin drops off the body whole like a sock — falling under its own weight, stretching long and narrow, its mouth gathering shut over the dark inside — and fades as it slides away below",
  dir: "tools/versus/candidates/creature-rind/slough",
  patches: [
    patch({
      target: rindLook.RIND_LOOK,
      // No accessor: `rind-shed.ts` reads the export itself, once per shed.
      reached: () => rindLook.RIND_LOOK,
      where: {
        file: "packages/render/src/rind-look.ts",
        symbol: "RIND_LOOK",
        type: "RindLook",
      },
      fields: { shed: slough },
    }),
  ],
};
