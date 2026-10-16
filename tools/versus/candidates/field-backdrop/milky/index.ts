import * as backdropLook from "../../../../../packages/render/src/backdrop-look.js";
import { patch, type Variant } from "../../../variant.js";
import { milky } from "./paint.js";

/**
 * `field:backdrop` / `milky` — the galaxy's band crosses the sky corner to corner.
 *
 * **What the shipped side is.** A sea: light from above, dust in the water,
 * a horizon band, a wash that breathes and one soft light in the corner —
 * which the owner called *boring and empty* on 16 October 2026.
 *
 * **What this argues.** That *space* is said most plainly by the one picture everyone already
 * knows: the Milky Way across a night sky, dense where it runs and empty
 * where it does not.
 *
 * **How it can lose.** A busy diagonal behind bodies that read by their outline. If a small
 * body's edge is lost in the band's densest stars, the band is too dense.
 */
export const BACKDROP_MILKY: Variant = {
  slot: "field:backdrop",
  name: "milky",
  sentence:
    "a river of stars crosses the sky from bottom left to top right — thousands of points packed toward its spine over a glow of the act's colour, broken by dark lanes of dust — the rest of the sky black and sparse, a dozen bright stars breathing; nothing slides",
  dir: "tools/versus/candidates/field-backdrop/milky",
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
      fields: { back: milky },
    }),
  ],
  // A back is on every frame and one instant of it is the whole question.
  screenshot: { freezeSeconds: 1 },
};
