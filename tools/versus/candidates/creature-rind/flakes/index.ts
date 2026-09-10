import * as rindLook from "../../../../../packages/render/src/rind-look.js";
import { patch, type Variant } from "../../../variant.js";
import { flakes } from "./paint.js";

/**
 * `creature:rind` / `flakes` — the skin comes apart into pieces with a face.
 *
 * **What the shipped side is.** Nine short arcs of one width riding just past
 * a thinning ring, all the same brightness, all facing the same way. They are
 * there to say *surface* rather than *shockwave*, and they say it as marks.
 *
 * **What this argues.** That a piece of skin is a thing with two sides and a
 * thickness. Twelve filled pieces are cut from the band the skin occupied,
 * each thrown out along its own angle, each tumbling about its own tangent so
 * that its height is the cosine of how far it has turned and past edge-on it
 * shows its underside — dark and cool where the face was the body's colour.
 * One light on all of them: a piece up and to the left is lit and one down
 * and to the right is not, which is what makes twelve pieces read as one
 * skin that was on one body under one light. They drop a little as they fade.
 * The crush stays exactly as it ships.
 *
 * **How it can lose.** *Debris is the break's word.* A killed body already
 * comes apart into pieces (`creature:break`), and a shed that also throws
 * pieces may read as a body dying when it is a body losing a layer — the one
 * thing a pair must not misread, because the column is not closed. If at the
 * pair a shed reads as a kill, the pieces go fewer and larger until it does
 * not, or this loses to the ring.
 */
export const RIND_FLAKES: Variant = {
  slot: "creature:rind",
  name: "flakes",
  sentence:
    "the skin comes apart into a dozen thick pieces, each thrown outward and tumbling about its own edge, lit on its face by the one key light and dark on its underside — material off a body, not sparks",
  dir: "tools/versus/candidates/creature-rind/flakes",
  patches: [
    patch({
      target: rindLook.RIND_LOOK,
      // No accessor: `rind-shed.ts` reads the export itself, once per shed.
      reached: () => rindLook.RIND_LOOK,
      where: {
        file: "packages/render/src/rind-look.ts",
        symbol: "RIND_LOOK",
        type: "RindLook",
      },
      fields: { shed: flakes },
    }),
  ],
};
