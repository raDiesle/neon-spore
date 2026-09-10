import * as rindLook from "../../../../../packages/render/src/rind-look.js";
import { patch, type Variant } from "../../../variant.js";
import { pod } from "./paint.js";

/**
 * `creature:rind` / `pod` — the skin splits and swings open on the limbs.
 *
 * **What the shipped side is.** The contour the body wore, thrown outward as
 * a thinning ring that breaks into short arcs, in a bloom of its own colour.
 * It is a good picture of *energy* leaving a body and no picture at all of
 * *material* leaving one: a ring has no inside and no outside.
 *
 * **What this argues.** That a skin is a sheet, and a sheet has two faces.
 * The contour is cut down its meridian into two half-shells, each hinged on
 * the limb it stays attached to and swung open about that hinge — so each
 * one narrows to nothing edge-on and comes back the other way up, showing an
 * underside that is pale and cool where the outside was the body's own
 * colour, with the cut edge drawn as a line of thickness along the meridian.
 * The halves drift off the body and drop a little as they go, because a thing
 * let go of has weight. The crush — the old outline collapsing onto the
 * smaller body — stays exactly as it ships: that is the size going down a
 * step, which is the health bar and not the material.
 *
 * **How it can lose.** *Two halves is two bodies.* For the moment they are
 * open the field carries three shapes where it carried one, and a pair
 * counting bodies in a column may count them. If at the pair the halves read
 * as arrivals rather than as a skin, they go more transparent and shorter-
 * lived, and the flip has to carry the whole reading on its own.
 */
export const RIND_POD: Variant = {
  slot: "creature:rind",
  name: "pod",
  sentence:
    "the skin splits down its meridian into two half-shells that swing open on the limbs, turn past edge-on to show their pale insides, and drift off the smaller body — a pod opening, not a ring expanding",
  dir: "tools/versus/candidates/creature-rind/pod",
  patches: [
    patch({
      target: rindLook.RIND_LOOK,
      // No accessor: `rind-shed.ts` reads the export itself, once per shed. The
      // module namespace is the whole route there is.
      reached: () => rindLook.RIND_LOOK,
      where: {
        file: "packages/render/src/rind-look.ts",
        symbol: "RIND_LOOK",
        type: "RindLook",
      },
      fields: { shed: pod },
    }),
  ],
};
