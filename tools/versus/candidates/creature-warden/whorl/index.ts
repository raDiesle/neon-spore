import * as wardenLook from "../../../../../packages/render/src/warden-look.js";
import { patch, type Variant } from "../../../variant.js";
import { whorl } from "./paint.js";

/**
 * `creature:warden` / `whorl` — the material is muscle: a sphincter of
 * ridged fibres winding from the rim into the hole, turning, with a pulse
 * running down them.
 *
 * **What the shipped side is.** Five veins running in from the rim on fixed
 * spokes, breathing in length, on a flat fill. They say *alive*; nothing on
 * the body says what the hole is for.
 *
 * **What this argues.** That a body whose middle is a hole should be seen to
 * be *drawing in*. RIDGE off the shapes page, laid in a spiral: thirty fibres
 * run from the rim to the lip, each winding a third of a turn on the way and
 * each a ridge — a shadow line with a lit line offset a hair toward the key,
 * so the surface is corrugated rather than striped. Under them the ring is
 * shaded as a bowl, deepest at the lip and lit on the wall that faces the
 * key, which is the lower-right one for anything concave. Then it moves: the
 * whole whorl turns on a twenty-six-second clock, which on a spiral the eye
 * reads as the fibres flowing inward, and a bead of the body's own green runs
 * down each fibre into the hole on its own phase — the pulse of a thing
 * swallowing. The eyelets, the fringe, the two edges and the armour are the
 * shipped passes called as they are.
 *
 * **How it can lose.** *It is a fingerprint.* Thirty dark lines at this size
 * may read as a drawn pattern rather than as a surface, and a turning pattern
 * is the one thing on the field that could compete with the pupil for the
 * pair's eye. If at the pair the whorl is what the eye follows, the fibres
 * have to go fewer and fainter and the beads alone have to carry the flow.
 */
export const WARDEN_WHORL: Variant = {
  slot: "creature:warden",
  name: "whorl",
  sentence:
    "a sphincter of thirty ridged fibres winding from the rim into the hole over a bowl lit on its far wall, the whorl turning slowly and a bead of green running down each fibre — a body drawing in",
  dir: "tools/versus/candidates/creature-warden/whorl",
  patches: [
    patch({
      target: wardenLook.WARDEN_LOOK,
      // No accessor: `warden.ts` reads the export itself, once per frame. The
      // module namespace is the whole route there is.
      reached: () => wardenLook.WARDEN_LOOK,
      where: {
        file: "packages/render/src/warden-look.ts",
        symbol: "WARDEN_LOOK",
        type: "WardenLook",
      },
      fields: { surface: whorl },
    }),
  ],
};
