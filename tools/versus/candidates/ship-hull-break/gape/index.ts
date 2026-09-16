import * as look from "../../../../../packages/render/src/hull-break-look.js";
import { patch, type Variant } from "../../../variant.js";
import { gape, OPEN } from "./paint.js";

/**
 * `ship:hull-break` / `gape` — the hole opened into a cavity: ribs of the
 * frame crossing it where the skin used to be, and light venting up out of it.
 *
 * **What the shipped side is.** A pit and a crack, for `peel`'s reasons.
 *
 * **What this argues.** That the ship should be shown to have an inside. A pit
 * in a membrane says the surface is damaged; a cavity with structure in it
 * says the thing the pair is standing on is broken, which is what a lost wave
 * is. It is also the only answer of the three that stays wholly inside the
 * silhouette — everything it draws is clipped to the cavity it cut.
 *
 * **How it can lose.** The ribs are a claim about what the ship is made of
 * that no other part of this game makes, and once one hole has them every hole
 * does. A vent breathing in the hull is also one more thing pulsing on a
 * screen where the beat, the shield and the muzzle all already do.
 */
export const HULL_BREAK_GAPE: Variant = {
  slot: "ship:hull-break",
  name: "gape",
  sentence:
    "the hole opened into a cavity under the mouth — five ribs of the frame crossing it where the skin used to be, a torn lip either side, and a vent breathing up out of the middle",
  dir: "tools/versus/candidates/ship-hull-break/gape",
  patches: [
    patch({
      target: look.HULL_BREAK_LOOK,
      reached: () => look.HULL_BREAK_LOOK,
      where: {
        file: "packages/render/src/hull-break-look.ts",
        symbol: "HULL_BREAK_LOOK",
        type: "HullBreakLook",
      },
      fields: { open: OPEN, paint: gape },
    }),
  ],
};
