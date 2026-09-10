import * as backdropLook from "../../../../../packages/render/src/backdrop-look.js";
import { patch, type Variant } from "../../../variant.js";
import { nebula } from "./paint.js";

/**
 * `field:backdrop` / `nebula` — the field is in space.
 *
 * **What the shipped side is.** A sea: light from above, dust in the water,
 * a horizon band and a wash that breathes.
 *
 * **What this argues.** That the game is set in space and the back should
 * say so: a deeper black, two large dim clouds of the act's tint drifting
 * far behind, the far dust kept as stars, and six pin stars breathing.
 *
 * **How it can lose.** *Colour behind a coloured body.* A red slick over a
 * red-tinted cloud has less edge than it had. Judge it on the wave whose
 * tint is nearest a body's colour.
 */
export const BACKDROP_NEBULA: Variant = {
  slot: "field:backdrop",
  name: "nebula",
  sentence:
    "the field is in space — a black a step deeper than the ground, two large dim clouds of the act's tint drifting far behind everything, the far dust kept as stars and six pin stars breathing; no shafts, no horizon, no wash",
  dir: "tools/versus/candidates/field-backdrop/nebula",
  patches: [
    patch({
      target: backdropLook.BACKDROP_LOOK,
      // No accessor: `drawBackdrop` reads the export itself. The module
      // namespace is the whole route there is.
      reached: () => backdropLook.BACKDROP_LOOK,
      where: {
        file: "packages/render/src/backdrop-look.ts",
        symbol: "BACKDROP_LOOK",
        type: "BackdropLook",
      },
      fields: { back: nebula },
    }),
  ],
  // A back is on every frame regardless of timing, and one instant of it is
  // the whole question (`docs/versus.md`, "A candidate is static by default").
  screenshot: { freezeSeconds: 1 },
};
