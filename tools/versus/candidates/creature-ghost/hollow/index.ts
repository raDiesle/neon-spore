import * as ghostLook from "../../../../../packages/render/src/ghost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { hollow } from "./paint.js";

/**
 * `creature:ghost` / `hollow` — the dome is a bell of glass, lit on its far
 * inner wall, with a heart hanging inside it.
 *
 * **What the shipped side is.** One radial gradient, colour welling up from
 * the middle and dark at the rim, the same from every side — a nebula, and a
 * flat one.
 *
 * **What this argues.** That a ghost is a thing you see *into*, and the way
 * to say so is the one a glass gives: light from `KEY` comes in at the upper
 * left and lands on the inside of the far wall at the lower right, so the
 * body is bright where a solid would be dark and dark where a solid would be
 * bright. The wall has a thickness you can see as a dark ring with the key
 * catching its outer face, and a small hot heart hangs inside and goes round
 * on the camouflage's own slow turn, seen on the far half of its orbit too
 * because there is nothing opaque to hide it. `lantern` next door is the
 * same body as a solid; this is it as a shell, and the pair is the whole
 * question. The camouflage is `latitude` on both sides, untouched.
 *
 * **How it can lose.** *Two outlines where there was one.* The inner wall is
 * a second contour at four fifths, and at 26 px it may read as a small ghost
 * inside a big one. Judge it small.
 */
export const GHOST_HOLLOW: Variant = {
  slot: "creature:ghost",
  name: "hollow",
  sentence:
    "the dome is a glass bell — lit on the inside of its far wall where the key lands, dark where a solid would be bright, with a hot heart hanging inside it and going round on the camouflage's own turn",
  dir: "tools/versus/candidates/creature-ghost/hollow",
  patches: [
    patch({
      target: ghostLook.GHOST_LOOK,
      // No accessor: `drawGhost` reads the export itself. The module namespace
      // is the whole route there is.
      reached: () => ghostLook.GHOST_LOOK,
      where: {
        file: "packages/render/src/ghost-look.ts",
        symbol: "GHOST_LOOK",
        type: "GhostLook",
      },
      fields: { interior: hollow },
    }),
  ],
};
