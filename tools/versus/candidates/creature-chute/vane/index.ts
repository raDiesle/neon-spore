import * as chuteLook from "../../../../../packages/render/src/chute-look.js";
import { column } from "../../../../../packages/render/src/chute-look.js";
import { patch, type Variant } from "../../../variant.js";
import { vane } from "./paint.js";

/**
 * `creature:chute` / `vane` — the canopy turns as it comes down, and its
 * surface goes round.
 *
 * **What the shipped side is.** A dome that sways in the picture plane and
 * cannot be seen to turn, because a dome is the same outline from every
 * bearing.
 *
 * **What this argues.** That the outline's sameness is the opportunity: a
 * yaw changes nothing about the silhouette and everything on the surface.
 * Eight pores are placed on the dome by longitude and latitude and projected
 * by `facet` about the canopy's own axis, which turns at a slow steady rate
 * with the sway's twist on top, so each arrives thin at one limb, crosses
 * the front full and lit, and thins away at the other — the reveal an
 * affine cannot make. The outline is the shipped `canopyPath`, lit as a
 * shell underneath; the shrouds, the sway, the breath and the plume are the
 * shipped ones. Beside BELL, GORES and RIBS this is the one answer that
 * turns the canopy rather than reshaping it.
 *
 * **How it can lose.** *Eight dots sliding across a flat shape.* If the
 * foreshortening at the limbs is lost at the size the game draws a chute,
 * the marks are a decal scrolling. Judge it at a limb, where a mark should
 * be a sliver before it is a mark.
 */
export const CHUTE_VANE: Variant = {
  slot: "creature:chute",
  name: "vane",
  sentence:
    "the shipped dome turning slowly about its own axis as it comes down, with a twist from the sway — eight pores placed on it by longitude and latitude arrive thin at one limb, cross the front lit and full, and thin away at the other — over a shell lit from the key; the shipped shrouds, and the shipped plume on the climb",
  dir: "tools/versus/candidates/creature-chute/vane",
  patches: [
    patch({
      target: chuteLook.CHUTE_LOOK,
      // No accessor: `chute.ts` reads the export itself, once per frame. The
      // module namespace is the whole route there is.
      reached: () => chuteLook.CHUTE_LOOK,
      where: {
        file: "packages/render/src/chute-look.ts",
        symbol: "CHUTE_LOOK",
        type: "ChuteLook",
      },
      // The plume is the shipped one: this slot patches both fields because
      // every candidate in it must, and this answer is about the descent.
      fields: { canopy: vane, plume: column },
    }),
  ],
};
