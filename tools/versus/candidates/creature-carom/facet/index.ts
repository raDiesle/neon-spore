import * as caromLook from "../../../../../packages/render/src/carom-look.js";
import { wedge } from "../../../../../packages/render/src/carom-look.js";
import { patch, type Variant } from "../../../variant.js";
import { faceted } from "./paint.js";

/**
 * `creature:carom` / `facet` — the crust is a cut stone, and every face
 * takes its own light.
 *
 * **What the shipped side is.** A seven-sided outline filled with one flat
 * mid-tone and lit by one gradient across the whole of it: facets promised at
 * the edge and none on the surface.
 *
 * **What this argues.** That the surface should be cut the way the outline
 * is. Two rings of faces — an outer ring sloping out to the silhouette and a
 * bevel sloping down into the hole — each shaded flat by its own normal
 * against `KEY`, so as the stone spins each face turns through the light
 * and brightens and dims on its own. The bevel makes the window a hole in
 * something thick: its near lip is in shadow and its far wall is lit, the
 * CLEFT argument on a rock. The window and the streak are the shipped ones.
 *
 * **How it can lose.** *Fourteen faces on a twelve-pixel wall are a
 * checker.* If at 26 px the ring reads as light and dark squares rather
 * than as a stone with sides, it is a texture. Judge it as it turns.
 */
export const CAROM_FACET: Variant = {
  slot: "creature:carom",
  name: "facet",
  sentence:
    "the crust cut into faces — an outer ring sloping to the silhouette and a bevel sloping down into the hole, each face shaded flat by its own normal against the key, so they brighten and dim as the stone spins; the shipped streak",
  dir: "tools/versus/candidates/creature-carom/facet",
  patches: [
    patch({
      target: caromLook.CAROM_LOOK,
      // No accessor: `carom.ts` reads the export itself, twice per body. The
      // module namespace is the whole route there is.
      reached: () => caromLook.CAROM_LOOK,
      where: {
        file: "packages/render/src/carom-look.ts",
        symbol: "CAROM_LOOK",
        type: "CaromLook",
      },
      // The streak is the shipped one: this slot patches both fields because
      // every candidate in it must, and this answer has nothing to say about
      // the travel.
      fields: { shell: faceted, travel: wedge },
    }),
  ],
};
