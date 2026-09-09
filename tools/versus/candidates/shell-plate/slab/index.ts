import * as shellLook from "../../../../../packages/render/src/shell-look.js";
import { patch, type Variant } from "../../../variant.js";
import { slab, slabRim } from "./paint.js";

/**
 * `shell:plate` / `slab` — the armour is a thing with a thickness under a
 * light, instead of a flat lid cut out of the body's own outline.
 *
 * **What the shipped side is.** `drawPlate` cuts the body's contour in half,
 * fills it in one flat grey, strokes a hard rim round the outer arc and lights
 * three splits with the colour underneath. It is a good picture of the *rule* —
 * armour over a body, opening where it cracks — and it is the one hard surface
 * in the game with no highlight, no bevel and no thickness at all, sitting
 * directly over a body that has both. Beside `warden:plates` / `bevel`, which
 * the owner took into the game on 9 September 2026, the shell is the obvious
 * second subject: the same question on a smaller body, and a plate that is
 * *shaped* to a contour rather than swept round a rim.
 *
 * **What this argues.** Three things a lid cannot have, in the order a solid is
 * built.
 *
 * A **wall**: the plate is drawn twice, once dark where the shipped one is and
 * once lifted a twentieth of a reach toward the light, so a hair of thickness
 * shows down the side the light does not reach.
 *
 * A **face lit by its own normal**. A plate is half a body presented outward,
 * so the direction it shows the world is the middle of its own span — π for
 * the piece over the left column, 0 for the one over the right. Read against
 * `KEY`, which is upper left and is the only light in this game, that makes the
 * left plate take nearly all of it and the right one almost none. On an intact
 * shell the two halves are therefore *different greys*, which is the single
 * change most likely to decide this vote: it says the two plates are two
 * objects on one body, where today they are one shape with a seam drawn down
 * it.
 *
 * And a **specular that does not travel**. It sits where the light is, in the
 * body's own frame with the own-motion's lean turned back out, so as the
 * creature breathes the highlight stays put and the plate moves under it. A
 * mark that moves against a light that does not is the cheapest thing there is
 * that says one of two objects is hard and the other is not, and it is the
 * whole reason this candidate is worth looking at rather than reading about.
 *
 * The bared half comes with it, and it has to: the grey edge a chipped half
 * keeps is the same material as the plate beside it, so a look that moved one
 * and not the other would put a body on the field wearing two answers.
 *
 * **How it can lose, and the pair should watch for exactly this.** *The shell
 * stops being one word.* A pair says "shell" and then says a column; if the two
 * halves read as two different objects, the first word may cost a beat that the
 * flat lid never did. And the specular is a bright mark on a body at 26 px, on
 * a field where bright means the colour a shot has to match — if the eye starts
 * checking the highlight before it finds the splits, that is this look, and it
 * is not fixable by turning it down, because a specular quiet enough not to
 * compete is a specular nobody sees.
 */
export const SHELL_SLAB: Variant = {
  slot: "shell:plate",
  name: "slab",
  sentence:
    "each plate a slab with a wall and a face lit by the half it is on — the left one bright, the right one nearly out — under a highlight that stays where the light is while the body sways beneath it",
  dir: "tools/versus/candidates/shell-plate/slab",
  patches: [
    patch({
      target: shellLook.SHELL_LOOK,
      // No accessor: `shell-draw.ts` reads the export itself, twice per body
      // per frame. The module namespace is the whole route there is.
      reached: () => shellLook.SHELL_LOOK,
      where: {
        file: "packages/render/src/shell-look.ts",
        symbol: "SHELL_LOOK",
        type: "ShellLook",
      },
      fields: { plate: slab, bareRim: slabRim },
    }),
  ],
};
