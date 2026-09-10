import * as queenLook from "../../../../../packages/render/src/queen-look.js";
import { patch, type Variant } from "../../../variant.js";
import { facet } from "./paint.js";

/**
 * `creature:queen` / `facet` — the shell is a cut stone, a raised table and
 * a crown of planes, each lit by where it faces.
 *
 * **What the shipped side is.** One linear gradient from her upper-left
 * corner to her lower-right, glued to her own frame, and the rock's outline
 * round it. It says *rock* by colour and by contour, and it is a flat plate
 * at the one size on the field where a flat plate shows worst: she is four
 * and a half tiles wide, and the gradient is as smooth at her rim as at her
 * middle, which is what a picture of a stone looks like rather than a stone.
 *
 * **What this argues.** That her material is the same crystal her torches
 * are cut from, and a crystal has faces. The sixteen corners of her contour
 * are the corners of the crown; a table sits raised above them, turned half
 * a step so each of its corners stands over an edge of the rim; thirty-two
 * planes run between the two. Each plane is filled by its own normal against
 * the key — `surfaceLit`, the projection every placed surface in the game
 * reads — dark on the faces turned down and right, a glint on the ones
 * square to the light. Then she breathes: the table's height rises and
 * falls on a five-second clock, which tips every plane of the crown a
 * little and moves its light, and the table's corners drift a fraction of a
 * step on a slower one, so the pattern of light turns under a light that
 * never moves. The contour, the marks, the eggs and the petals are untouched.
 *
 * **How it can lose.** *It is a gem, not a shell.* Thirty-two planes at her
 * size read as cut glass, and a boss that reads as jewellery has lost the
 * fight before the marks open. Judge it at the pair against the torches on
 * her wings: if she is no longer the rock they are, it has lost.
 */
export const QUEEN_FACET: Variant = {
  slot: "creature:queen",
  name: "facet",
  sentence:
    "the shell as a cut stone — a raised table and a crown of thirty-two planes down to the corners of her contour, each lit by its own normal against the key, the table breathing so the crown's light tips and turns",
  dir: "tools/versus/candidates/creature-queen/facet",
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
      fields: { shell: facet },
    }),
  ],
};
