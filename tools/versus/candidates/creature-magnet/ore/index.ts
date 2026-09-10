import * as magnetLook from "../../../../../packages/render/src/magnet-look.js";
import { patch, type Variant } from "../../../variant.js";
import { ore } from "./paint.js";

/**
 * `creature:magnet` / `ore` — a lump of something dug up, with the colour
 * running through it as a vein.
 *
 * **What the shipped side is.** `coil` (`magnet-coil.ts`): a machined
 * horseshoe — bevel, ramp, hard edge — with the poles lit from their tips as
 * two lamps. It is the only body on the field that looks manufactured, and
 * on a field of blobs and slimes that is a choice worth arguing with.
 *
 * **What this argues.** That the magnet is *found*, not made, and that the
 * colour is *in* it rather than on it. The arch is pitted, each pit a hollow
 * with its far wall catching the key light, placed once per body off the
 * creature's id so no two are pitted alike. The plate is split rock, three
 * strata across it. And the poles are veins: two or three crooked lines of
 * the pole's own colour running up from the tip into the arm, with a bead of
 * light travelling down each one *toward* the tip on the pose clock — so the
 * colour is seen flowing to the end of the arm, and the end of the arm is
 * where a shot has to arrive. The only motion here is that flow; rock does
 * not turn and should not.
 *
 * **What it does not touch.** The silhouette (`magnet.ts`'s paths), the
 * plate's own paint, the poles' gradient and the lanes, all `coil`'s passes
 * called as they are; the key light.
 *
 * **How it can lose.** *It is a rock.* Grey and pitted is the field's word
 * for THE ROCK, and a rock is a thing the pair answers by shooting it — the
 * one thing a magnet's plate exists to refuse. If at twenty-eight pixels the
 * pits read before the poles do, the body has changed kind, and the pits go
 * before the veins do.
 */
export const MAGNET_ORE: Variant = {
  slot: "creature:magnet",
  name: "ore",
  sentence:
    "the horseshoe as dug-up stone — pitted, the plate split into strata, and the colour a vein running into each arm with a bead of light flowing down it to the tip",
  dir: "tools/versus/candidates/creature-magnet/ore",
  patches: [
    patch({
      target: magnetLook.MAGNET_LOOK,
      reached: () => magnetLook.MAGNET_LOOK,
      where: {
        file: "packages/render/src/magnet-look.ts",
        symbol: "MAGNET_LOOK",
      },
      fields: { body: ore },
    }),
  ],
};
