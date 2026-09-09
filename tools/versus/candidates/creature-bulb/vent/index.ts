import * as interior from "../../../../../packages/render/src/body-interior.js";
import { patch, type Variant } from "../../../variant.js";
import { vent } from "./paint.js";

/**
 * `creature:bulb` / `vent` — the thing the creature actually does.
 *
 * **What this argues.** The bulb fills and vents. That is what it is for, and
 * nothing on the body has ever said so. A ring of eight lips round one point on
 * the surface, working slowly open and shut, and turning away to a slit and
 * then out of sight as the body turns. The other four answers in this slot are
 * about what is *inside*; this one is the only one that would still be legible
 * if the membrane were opaque.
 *
 * **How it can lose, and it is a rules question rather than a taste one.** *A
 * mouth that opens is a window that invites a shot.* Nothing in the game makes
 * a bulb more or less shootable at any moment, and a body that visibly opens
 * and closes is a pair waiting for a window that does not exist. Look at it on
 * a wave, not on a card — and if it reads as a timing cue, it is wrong however
 * good it looks.
 */
export const BULB_VENT: Variant = {
  slot: "creature:bulb",
  name: "vent",
  sentence:
    "a ring of eight lips working open and shut on the surface — the thing the creature is for",
  dir: "tools/versus/candidates/creature-bulb/vent",
  patches: [
    patch({
      target: interior.BULB_LOOK,
      reached: () => interior.interiorFor("bulb"),
      where: {
        file: "packages/render/src/body-interior.ts",
        symbol: "BULB_LOOK",
        type: "BodyInterior",
      },
      fields: { paint: vent },
    }),
  ],
};
