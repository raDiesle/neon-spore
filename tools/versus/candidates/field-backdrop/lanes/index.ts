import * as backdropLook from "../../../../../packages/render/src/backdrop-look.js";
import { patch, type Variant } from "../../../variant.js";
import { lanes } from "./paint.js";

/**
 * `field:backdrop` / `lanes` — every other column shaded, so the space
 * behind the field is a ruled page.
 *
 * **What the shipped side is.** A wash, three diagonal shafts of light, a
 * horizon and two depths of dust, none of which says where one column ends
 * and the next begins.
 *
 * **What this argues.** That the one useful thing a back can do for two
 * people counting columns is make them countable: faint bands of the field's
 * own black down every odd column, the shafts gone because a diagonal fights the
 * bands, the near dust gone and the far dust halved.
 *
 * **How it can lose.** *Stripes are louder than dust.* If the bands are the
 * first thing the eye lands on, they are in the way.
 */
export const BACKDROP_LANES: Variant = {
  slot: "field:backdrop",
  name: "lanes",
  sentence:
    "every other column shaded a shade darker, in the field's own black, from the top of the sky to the band, the wash and horizon kept, the far dust halved, the near dust and the light shafts gone — a ruled page behind the bodies",
  dir: "tools/versus/candidates/field-backdrop/lanes",
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
      fields: { back: lanes },
    }),
  ],
  // A back is on every frame regardless of timing, and one instant of it is
  // the whole question (`docs/versus.md`, "A candidate is static by default").
  screenshot: { freezeSeconds: 1 },
};
