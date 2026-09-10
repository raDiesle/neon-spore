import * as backdropLook from "../../../../../packages/render/src/backdrop-look.js";
import { patch, type Variant } from "../../../variant.js";
import { bare } from "./paint.js";

/**
 * `field:backdrop` / `bare` — nothing behind the field but the dark, pooled
 * toward the middle.
 *
 * **What the shipped side is.** Five dim layers, all of them moving: a wash
 * that breathes, three shafts of light, a horizon band and two depths of
 * drifting dust.
 *
 * **What this argues.** That the bodies read best against nothing, and that
 * a back's one job is to hold the eye where the columns are — so it paints a
 * vignette and nothing else.
 *
 * **How it can lose.** *It reads as a test rig.* Judge it with four bodies
 * on it, not empty.
 */
export const BACKDROP_BARE: Variant = {
  slot: "field:backdrop",
  name: "bare",
  sentence:
    "nothing behind the field but the field's own dark, deepest at the side edges so the columns sit in a pool of the brighter ground — no dust, no light shafts, no horizon, no wash",
  dir: "tools/versus/candidates/field-backdrop/bare",
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
      fields: { back: bare },
    }),
  ],
  // A back is on every frame regardless of timing, and one instant of it is
  // the whole question (`docs/versus.md`, "A candidate is static by default").
  // A second in, so the four bodies are on the field and not still arriving.
  screenshot: { freezeSeconds: 1 },
};
