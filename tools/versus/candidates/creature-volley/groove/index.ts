import * as volleyLook from "../../../../../packages/render/src/volley-look.js";
import { shippedStone } from "../../../../../packages/render/src/volley-stone.js";
import { patch, type Variant } from "../../../variant.js";
import { grooveSeams } from "./paint.js";

/**
 * `creature:volley` / `groove` — the seams are cut into the stone.
 *
 * **What the shipped side is.** Four lines of the body's colour laid on the
 * lit rock, each with a soft glow round it. They say *which colour* clearly,
 * and they say nothing about the surface: a line on a rock has no side the
 * light can catch, so the ball reads as a stone with a pattern drawn on it.
 *
 * **What this argues.** That the seams should be *channels* — the trench
 * between a basketball's panels — with a pale lip on the side that faces the
 * key light, a shadow on the side that faces away, and the colour down at the
 * bottom of the cut. Relief, on a body the key light already models, and the
 * one cue that survives a roll: the lips swap sides as the pattern turns
 * under a light that does not, which is a thing paint cannot do. The stone
 * under it and the rim round it are the shipped ones, so a ward takes the same
 * sector away and the skeleton stands the same.
 *
 * **How it can lose.** *The colour gets quieter.* The core is thinner than the
 * shipped seam and sits inside a dark trench, so at twenty-six pixels the
 * red or the cyan has to carry through two dark edges. If the pair cannot
 * name the colour of a groove ball from where they sit, the trench goes and
 * the lips have to ride a seam as wide as the shipped one.
 */
export const VOLLEY_GROOVE: Variant = {
  slot: "creature:volley",
  name: "groove",
  sentence:
    "the four seams as trenches cut into the stone — a pale lip toward the key light, a shadow away from it and the body's colour down in the cut, so the lips swap sides as the ball rolls under a light that stays put",
  dir: "tools/versus/candidates/creature-volley/groove",
  patches: [
    patch({
      target: volleyLook.VOLLEY_LOOK,
      // No accessor: `volley.ts` reads the export itself. The module
      // namespace is the whole route there is.
      reached: () => volleyLook.VOLLEY_LOOK,
      where: {
        file: "packages/render/src/volley-look.ts",
        symbol: "VOLLEY_LOOK",
        type: "VolleyLook",
      },
      // The stone is the shipped one: this slot patches both fields because
      // every candidate in it must, and this answer is about the seams alone.
      fields: { stone: shippedStone, seams: grooveSeams },
    }),
  ],
};
