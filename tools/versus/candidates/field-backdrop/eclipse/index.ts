import * as backdropLook from "../../../../../packages/render/src/backdrop-look.js";
import { patch, type Variant } from "../../../variant.js";
import { eclipse } from "./paint.js";

/**
 * `field:backdrop` / `eclipse` — a black world eclipses a star high over the field.
 *
 * **What the shipped side is.** A sea: light from above, dust in the water,
 * a horizon band, a wash that breathes and one soft light in the corner —
 * which the owner called *boring and empty* on 16 October 2026.
 *
 * **What this argues.** That the sky can have a centre: one dramatic thing above the field that
 * everything else comes down from, the way a stage has a light.
 *
 * **How it can lose.** It sits where bodies enter, and its corona is bright. If a body coming
 * out from under the disc is lost in the streamers for its first beat, the
 * corona is too long.
 */
export const BACKDROP_ECLIPSE: Variant = {
  slot: "field:backdrop",
  name: "eclipse",
  sentence:
    "a black disc stands near the top of the sky with its edge burning — a tight ring of light, long uneven streamers turning slowly round it, one bead of the star breaking past the limb, and a wide soft glow of the act's colour falling down the sky; stars behind",
  dir: "tools/versus/candidates/field-backdrop/eclipse",
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
      fields: { back: eclipse },
    }),
  ],
  // A back is on every frame and one instant of it is the whole question.
  screenshot: { freezeSeconds: 1 },
};
