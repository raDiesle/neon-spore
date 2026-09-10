import * as recoilLook from "../../../../../packages/render/src/recoil-look.js";
import { patch, type Variant } from "../../../variant.js";
import { sprung } from "./paint.js";

/**
 * `creature:recoil` / `sprung` — every rib is a coil spring, wound, with a
 * near side and a far side.
 *
 * **What the shipped side is.** A rib is a zigzag leaf from the body to the
 * hoop — three folds, tapering to nothing at both ends, swinging a little on
 * the clock. It is the diagram of a spring: the shape an eye accepts as
 * *spring* without there being any wire in it.
 *
 * **What this argues.** That the spring should be wound. Each rib is turns
 * of wire round the line from the body to the hoop, and every turn is drawn
 * as the two halves of a loop seen at a slant — the half nearer the viewer
 * bright and thick over the half behind it, thin and dark — which is the
 * alternation that makes a drawn coil read as a cylinder of wire rather than
 * a wavy line. The coil compresses as the hoop breathes in and stretches as
 * it breathes out, because a spring does, and each near half carries a
 * thread of light on its crest, shifted toward the key. The hoop, its gaps
 * and its bolts are the shipped `drawHoopArc`, so the count is read exactly
 * as before; a spent rib is a coil pulled to half its reach, snapped to two
 * turns and scorched, hanging off its own line where the shipped wreck
 * hangs.
 *
 * **How it can lose.** *Four loops on a rib a tile long are a hatch.* At 26
 * px a turn is three pixels of pitch, and a coil whose loops merge is a
 * thicker zigzag. Judge it on whether one loop can be seen to sit in front
 * of the next; if not, the turns need to go to three or the candidate goes.
 */
export const RECOIL_SPRUNG: Variant = {
  slot: "creature:recoil",
  name: "sprung",
  sentence:
    "every rib a coil spring wound round its own line — each turn a loop at a slant with its near half bright over its far half dark, compressing as the hoop breathes in — on the shipped hoop and bolts",
  dir: "tools/versus/candidates/creature-recoil/sprung",
  patches: [
    patch({
      target: recoilLook.RECOIL_LOOK,
      // No accessor: `recoil.ts` reads the export itself, once per frame. The
      // module namespace is the whole route there is.
      reached: () => recoilLook.RECOIL_LOOK,
      where: {
        file: "packages/render/src/recoil-look.ts",
        symbol: "RECOIL_LOOK",
        type: "RecoilLook",
      },
      fields: { cage: sprung },
    }),
  ],
};
