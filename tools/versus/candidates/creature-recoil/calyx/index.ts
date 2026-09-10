import * as recoilLook from "../../../../../packages/render/src/recoil-look.js";
import { patch, type Variant } from "../../../variant.js";
import { calyx } from "./paint.js";

/**
 * `creature:recoil` / `calyx` — no cage: the body is a fruit held in a cup
 * of leaves.
 *
 * **What the shipped side is.** A frame of metal round a grown thing. The
 * owner asked on 10 September 2026 for answers that are not a frame, with
 * one rule: what sits inside keeps the cannon's colour.
 *
 * **What this argues.** One leaf per bounce, fanning out and down from under
 * the body the way a calyx holds a berry, each a cupped blade with a midrib
 * shaded by where it faces the key — the left leaf pale, the right one in
 * the body's dark — stirring a little on the clock. A spent bounce is a
 * wilted leaf, half its length, curled at the tip and scorched. The leaves
 * only touch the body at their roots, so the colour inside is the cannon's
 * and uncovered.
 *
 * **How it can lose.** *A cup under a body that jumps.* On the shot the body
 * is kicked back up its lane; if the eye takes that as the body parting from
 * its cup rather than jumping in it, the candidate goes. Judge it on the beat
 * after the shot.
 */
export const RECOIL_CALYX: Variant = {
  slot: "creature:recoil",
  name: "calyx",
  sentence:
    "no cage — one leaf per bounce fanning out and down from under the body, each a cupped blade with a midrib lit by where it faces the key, stirring on the clock, so the body sits in a calyx like a berry; a spent bounce is a wilted leaf, half its length and scorched",
  dir: "tools/versus/candidates/creature-recoil/calyx",
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
      fields: { cage: calyx },
    }),
  ],
};
