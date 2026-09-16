import * as look from "../../../../../packages/render/src/hull-break-look.js";
import { patch, type Variant } from "../../../variant.js";
import { OPEN, peel } from "./paint.js";

/**
 * `ship:hull-break` / `peel` — two flaps of plating bent back out of the hole,
 * one off each lip, standing clear of the membrane with their inner faces
 * turned to the player.
 *
 * **What the shipped side is.** A crystal-shaped pit clipped into the skin
 * (`craters.ts`) with a crack running out of its rim (`scars.ts`), and nothing
 * else. Neither of them is plating: it is a hole in a membrane with a line off
 * it (`hull-break-look.ts`).
 *
 * **What this argues.** That the ship should be seen to be made of something.
 * Nothing in this game has ever shown the *inside* of the hull's skin — every
 * surface here is lit from within and seen from outside — so a dark face with
 * a hot torn edge is a material the player has no other reading for, and that
 * is what makes a hole read as a wound rather than as a shape cut out of a
 * picture.
 *
 * **How it can lose.** The flaps stand off the silhouette, and the silhouette
 * is how the pair reads where the ship is; a hull carrying three of these has
 * an outline nobody drew. They also sit exactly where the cannon and the dome
 * travel, and a flap the cannon slides behind will read as a thing in front of
 * it.
 */
export const HULL_BREAK_PEEL: Variant = {
  slot: "ship:hull-break",
  name: "peel",
  sentence:
    "two flaps of plating bent back out of the hole, one off each lip — their inner faces nearly black, which is a surface this game has never shown, and the tear along the top of each one still hot",
  dir: "tools/versus/candidates/ship-hull-break/peel",
  patches: [
    patch({
      target: look.HULL_BREAK_LOOK,
      reached: () => look.HULL_BREAK_LOOK,
      where: {
        file: "packages/render/src/hull-break-look.ts",
        symbol: "HULL_BREAK_LOOK",
        type: "HullBreakLook",
      },
      fields: { open: OPEN, paint: peel },
    }),
  ],
};
