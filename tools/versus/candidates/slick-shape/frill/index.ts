import * as silhouettes from "../../../../../packages/content/src/silhouettes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `slick:shape` / `frill` — a long body with a fringed edge.
 *
 * **What this argues.** That the slick's edge should be *busy* where every
 * other body's is calm. Nine shallow lobes on a long body: not a count to be
 * made but a texture to be recognised, the way a leaf's edge is recognised
 * without anybody counting the teeth.
 *
 * **It deliberately revisits a mistake the bulb already made and corrected.**
 * The bulb was nine lobes at a shallow depth once, and it was thrown out for
 * being a rim that moved seven pixels — a texture rather than a count
 * (`silhouettes.ts`). The argument for trying it again here is that the slick
 * is *long*: nine lobes round a circle is a wobble, and nine along a body twice
 * as wide as it is tall is a fringe, which is a different thing. That may be
 * wrong, and it is exactly what the pair is for.
 *
 * **How it can lose.** *The wobble eats it.* The contour also breathes on its
 * own clock, and at this depth the fringe is the same size as the breathing —
 * so the edge may read as noise rather than as a feature the body has.
 */
export const SLICK_FRILL: Variant = {
  slot: "slick:shape",
  name: "frill",
  sentence: "nine shallow lobes along a long body — a fringed edge, recognised rather than counted",
  dir: "tools/versus/candidates/slick-shape/frill",
  patches: [
    patch({
      target: silhouettes.SLICK,
      reached: () => silhouettes.SLICK,
      where: {
        file: "packages/content/src/silhouettes.ts",
        symbol: "SLICK",
        type: "CreatureSilhouette",
      },
      fields: { lobes: 9, depth: 0.17, wobble: 0.09, rx: 72, ry: 42, seed: 0 },
    }),
  ],
};
