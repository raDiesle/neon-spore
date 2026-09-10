import * as lidLook from "../../../../../packages/render/src/lid-look.js";
import { patch, type Variant } from "../../../variant.js";
import { iris } from "./paint.js";

/**
 * `creature:lid` / `iris` — the armour is a diaphragm, not a pair of doors.
 *
 * **What the shipped side is.** Two plates parting on one straight seam. The
 * opening is a slot, and a slot widening is a shape changing size.
 *
 * **What this argues.** That the same armour arranged as six overlapping
 * leaves is a mechanism, and a mechanism opening is a thing happening. The
 * leaves pivot outward as the cord is pulled, so the aperture is a rounded
 * hexagon growing from a point at the middle of the eye; they turn a little
 * as they go, which is a motion a slide does not have; and each is lit by
 * where it sits under the one key light, with a dark cut and a lit lip along
 * the edge it rides over the next leaf with, so six discs read as six
 * thicknesses. The readout is exactly the shipped one — every leaf stands off
 * the middle by the rule's own `gap`, so the aperture's inradius is the
 * number the other seat has always read, as a circle rather than a slot —
 * and the seam in the lens's colour runs along every leaf's inner arc.
 *
 * **How it can lose.** *It is a different creature.* The sim's own sentence
 * is two plates parting from the middle outwards, and a pair who have learned
 * to read a slot for the other seat's hand will have to learn to read a hole.
 * That is also the argument for it: a hole growing from a point is the
 * plainest picture of *how far open* there is. If at the pair the six seams
 * read as a mark on the eye rather than as armour, this loses — and it should
 * be judged shut as well as open, because shut is where it spends its life.
 */
export const LID_IRIS: Variant = {
  slot: "creature:lid",
  name: "iris",
  sentence:
    "six overlapping armour leaves closing to a point at the middle of the eye and turning outward as the cord is pulled — a diaphragm opening on the rule's own gap, each leaf lit by where it sits under the key light, with a dark cut where it rides over the next",
  dir: "tools/versus/candidates/creature-lid/iris",
  patches: [
    patch({
      target: lidLook.LID_LOOK,
      // No accessor: `lid.ts` reads the export itself, once per lid.
      reached: () => lidLook.LID_LOOK,
      where: {
        file: "packages/render/src/lid-look.ts",
        symbol: "LID_LOOK",
        type: "LidLook",
      },
      fields: { plates: iris },
    }),
  ],
};
