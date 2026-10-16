import * as backdropLook from "../../../../../packages/render/src/backdrop-look.js";
import { patch, type Variant } from "../../../variant.js";
import { galaxy } from "./paint.js";

/**
 * `field:backdrop` / `galaxy` — a spiral galaxy turning behind the field.
 *
 * **What the shipped side is.** A sea: light from above, dust in the water,
 * a horizon band, a wash that breathes and one soft light in the corner —
 * which the owner called *boring and empty* on 16 October 2026.
 *
 * **What this argues.** That a sky with one great shape in it is a place: a galaxy's arms give the
 * middle columns a slow structure and its core a single bright point to look
 * past, without ever crossing a body.
 *
 * **How it can lose.** The core is the brightest thing in the sky and it sits near the top
 * right, where bodies arrive. If an arriving body is harder to see there
 * than anywhere else, the core is too loud.
 */
export const BACKDROP_GALAXY: Variant = {
  slot: "field:backdrop",
  name: "galaxy",
  sentence:
    "a spiral galaxy in the act's colour, tilted into an ellipse, high and to the right with half of it off the edge — two arms of a few thousand points round a warm core, turning once every few minutes; stars behind, no shafts, no horizon",
  dir: "tools/versus/candidates/field-backdrop/galaxy",
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
      fields: { back: galaxy },
    }),
  ],
  // A back is on every frame and one instant of it is the whole question.
  screenshot: { freezeSeconds: 1 },
};
