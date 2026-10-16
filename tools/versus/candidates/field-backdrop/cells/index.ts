import * as backdropLook from "../../../../../packages/render/src/backdrop-look.js";
import { patch, type Variant } from "../../../variant.js";
import { cells } from "./paint.js";

/**
 * `field:backdrop` / `cells` — the field is inside a wall of living cells.
 *
 * **What the shipped side is.** A sea: light from above, dust in the water,
 * a horizon band, a wash that breathes and one soft light in the corner —
 * which the owner called *boring and empty* on 16 October 2026.
 *
 * **What this argues.** That the slimes come from somewhere: the field is the inside of a living
 * thing, and a back made of the same stuff as the bodies says so without a
 * word.
 *
 * **How it can lose.** Blobs behind blobs. If a slick's outline is mistaken for a cell's
 * membrane even once, the wall is too close in kind to what is in front of
 * it, however good it looks.
 */
export const BACKDROP_CELLS: Variant = {
  slot: "field:backdrop",
  name: "cells",
  sentence:
    "behind the field a wall of huge cells packed edge to edge, each many times a body's size — dark inside, a lit membrane round it, a dim nucleus off centre — in the act's colour, the whole wall swelling and settling on a slow breath; no stars",
  dir: "tools/versus/candidates/field-backdrop/cells",
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
      fields: { back: cells },
    }),
  ],
  // A back is on every frame and one instant of it is the whole question.
  screenshot: { freezeSeconds: 1 },
};
