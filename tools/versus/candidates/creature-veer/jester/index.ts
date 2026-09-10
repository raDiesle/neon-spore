import * as veerLook from "../../../../../packages/render/src/veer-look.js";
import { patch, type Variant } from "../../../variant.js";
import { jesterRider } from "./paint.js";

/**
 * `creature:veer` / `jester` — a two-horned hood in place of the cone, with
 * bells that swing.
 *
 * **What the shipped side is.** A triangle over a circle. At arm's length a
 * cone is what a clown is, and it is also what a mountain, a tent and THE
 * DART's jet are: the one clown silhouette that other things on the field
 * already own.
 *
 * **What this argues.** That the rider should wear the *other* clown
 * silhouette — a jester's hood, two horns curving out and up from the crown
 * with a bell on each tip — because a wide V over a circle is a shape nothing
 * else on the field has. The bells are the moving part: they hang and swing
 * with the sway the stone already gives the rider, and on the brace both whip
 * out to the sides, so the crouch reads off the hood as well as off the body.
 * The collar is a row of hanging points, as a jester's is. The head, the
 * face and where everything sits are `clownFigure`'s. Nothing points a way:
 * both horns move together, because which way the rock steps is player one's
 * alone.
 *
 * **How it can lose.** *Two horns read as two things.* A pair naming this
 * body across a delay may see ears, antennae, a moth — anything but a hat —
 * and a rider the pair cannot name is worse than a plain cone the pair can.
 * If "the clown" stops being the word for it, the horns go and the bells
 * stay on a cone.
 */
export const VEER_JESTER: Variant = {
  slot: "creature:veer",
  name: "jester",
  sentence:
    "a jester's hood in place of the cone — two horns curving out and up from the crown with a bell on each tip, swinging with the sway and whipping out on the brace, over a collar of hanging points; a shape nothing else on the field has",
  dir: "tools/versus/candidates/creature-veer/jester",
  patches: [
    patch({
      target: veerLook.VEER_LOOK,
      reached: () => veerLook.VEER_LOOK,
      where: {
        file: "packages/render/src/veer-look.ts",
        symbol: "VEER_LOOK",
        type: "VeerLook",
      },
      fields: { rider: jesterRider },
    }),
  ],
};
