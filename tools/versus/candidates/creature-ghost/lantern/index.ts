import * as ghostLook from "../../../../../packages/render/src/ghost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { lantern } from "./paint.js";

/**
 * `creature:ghost` / `lantern` — the dome is a ball under the key light, and
 * the nebula inside it is a place on that ball that turns.
 *
 * **What the shipped side is.** One radial gradient, centred a little below
 * the middle: colour welling up out of the centre, dark at the rim, the same
 * from every side. It is the reference the owner sent — a dark body with a
 * nebula inside it — and it is drawn under no light at all, so at any size
 * it is a disc with a bright middle.
 *
 * **What this argues.** That the body should be lit the way everything else
 * on the field is: fullest toward `KEY`, darkest on the far rim, with a band
 * of bounced light along that rim, and the heart of the nebula pinned to the
 * surface and carried round by the slow turn the camouflage already turns on
 * — so it goes round the back, is seen faintly through the body, and comes
 * out the other side. `paint.ts` says which of the five zones is left out
 * and why. The camouflage is `latitude` on both sides, untouched.
 *
 * **How it can lose.** *A ghost should not be so definitely there.* A clear
 * lit side is a clear solid, and the shipped shapelessness is part of what
 * this creature is. Judge it small.
 */
export const GHOST_LANTERN: Variant = {
  slot: "creature:ghost",
  name: "lantern",
  sentence:
    "the dome is a ball under the key light — fullest toward it, darkest at the far rim with a band of bounced light there, and the nebula's heart a place on the surface that goes round the back and comes out the other side",
  dir: "tools/versus/candidates/creature-ghost/lantern",
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
      fields: { interior: lantern },
    }),
  ],
};
