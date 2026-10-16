import * as backdropLook from "../../../../../packages/render/src/backdrop-look.js";
import { patch, type Variant } from "../../../variant.js";
import { giant } from "./paint.js";

/**
 * `field:backdrop` / `giant` — a banded world hangs over the field.
 *
 * **What the shipped side is.** A sea: light from above, dust in the water,
 * a horizon band, a wash that breathes and one soft light in the corner —
 * which the owner called *boring and empty* on 16 October 2026.
 *
 * **What this argues.** That one big thing behind the field says *space*
 * more than any amount of dust: a gas giant in the act's colour, a third of
 * it off the left edge, banded, lit from the right, ringed, turning slowly.
 *
 * **How it can lose.** It is large and it is lit, and the lit side is where
 * the columns are. If a slick in the left columns has less edge against the
 * bands than against the sea, the world is too bright.
 */
export const BACKDROP_GIANT: Variant = {
  slot: "field:backdrop",
  name: "giant",
  sentence:
    "a gas giant in the act's colour hangs over the field, a third of it off the left edge — banded, lit from the right with its left limb in night, a thin ring tilted across it, the bands turning slowly; stars behind, no shafts, no horizon",
  dir: "tools/versus/candidates/field-backdrop/giant",
  patches: [
    patch({
      target: backdropLook.BACKDROP_LOOK,
      // No accessor: `drawBackdrop` reads the export itself.
      reached: () => backdropLook.BACKDROP_LOOK,
      where: {
        file: "packages/render/src/backdrop-look.ts",
        symbol: "BACKDROP_LOOK",
        type: "BackdropLook",
      },
      fields: { back: giant },
    }),
  ],
  // A back is on every frame and one instant of it is the whole question.
  screenshot: { freezeSeconds: 1 },
};
