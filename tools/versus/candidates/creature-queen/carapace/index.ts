import * as queenLook from "../../../../../packages/render/src/queen-look.js";
import { patch, type Variant } from "../../../variant.js";
import { carapace } from "./paint.js";

/**
 * `creature:queen` / `carapace` — the shell is a domed back with rows of
 * spiracles on it, and she heaves so the far ones rise over the crest.
 *
 * **What the shipped side is.** One linear gradient from her upper-left
 * corner to her lower-right, glued to her own frame, and the rock's outline
 * round it. Nothing on it is *on* it: there is no mark on her surface, so
 * there is nothing that could go round the back, and a body with no back is
 * a plate.
 *
 * **What this argues.** That she is a solid under the same key light as
 * everything else, and that the way to say so is to put things on her and
 * let them travel. The dome is the shipped ramp (`litRound`) with a
 * rounding over it — the cool shadow gathering to the rim on every side, a
 * wet specular on the shoulder facing the key, and a line of cool bounced
 * light along the far rim, which is the stop that separates a ball from a
 * disc with a smudge on it. Forty-two spiracles are pinned round her long
 * axis and along it, and her back rocks slowly about that axis, so on every
 * heave the pores on the far side rise over the crest into view as slivers,
 * widen as they face us, and the near ones sink under her lower edge —
 * foreshortened by `facet`'s own map, each lit by its own normal, the light
 * never moving. That reveal is the one cue no pose can produce, and it is
 * what says she has a back. The contour, the marks, the eggs and the petals
 * are untouched.
 *
 * **How it can lose.** *The pores are a rash.* Forty-two dark holes on the
 * biggest body in the game are a lot of holes, and on a phone at the pair's
 * size they may read as texture rather than as places on a surface — at
 * which point the heave is a texture sliding, which is the coin the whole
 * rule warns against. Judge it on whether one pore can be followed over the
 * crest; if none can, the rows need to thin.
 */
export const QUEEN_CARAPACE: Variant = {
  slot: "creature:queen",
  name: "carapace",
  sentence:
    "the shell as a domed back under the key — rounded to a cool rim with a wet shoulder and bounced light along the far edge, and rows of spiracles pinned to it that rise over the crest and sink under her lower edge as she heaves",
  dir: "tools/versus/candidates/creature-queen/carapace",
  patches: [
    patch({
      target: queenLook.QUEEN_LOOK,
      // No accessor: `queen.ts` reads the export itself, once per frame. The
      // module namespace is the whole route there is.
      reached: () => queenLook.QUEEN_LOOK,
      where: {
        file: "packages/render/src/queen-look.ts",
        symbol: "QUEEN_LOOK",
        type: "QueenLook",
      },
      fields: { shell: carapace },
    }),
  ],
};
