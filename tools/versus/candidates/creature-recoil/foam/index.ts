import * as recoilLook from "../../../../../packages/render/src/recoil-look.js";
import { patch, type Variant } from "../../../variant.js";
import { foam } from "./paint.js";

/**
 * `creature:recoil` / `foam` — no cage at all: the bounces are bubbles stuck
 * to the body.
 *
 * **What the shipped side is.** A frame of springs and a hoop, metal on a
 * field where everything alive is grown, and every answer so far has been
 * another frame. The owner asked on 10 September 2026 for answers that are
 * not — anything at all, so long as what sits inside keeps the cannon's
 * colour.
 *
 * **What this argues.** One bubble per bounce, each a translucent ball the
 * body's colour clinging to its outside like foam on a thing pulled out of
 * water, drawn as a ball — a soft film, a rim that catches the far light, a
 * pale crescent toward the key — wobbling on its own clock and swelling with
 * the strain. A spent bounce is the burst ring of one. The body underneath
 * is untouched, so the colour inside is the cannon's.
 *
 * **How it can lose.** *Three balls on a ball are a cluster of bodies.* If a
 * bubble reads as a second creature, the pair has more to name than the wave
 * gave them. The overlap is what says *on*; judge it at 26 px.
 */
export const RECOIL_FOAM: Variant = {
  slot: "creature:recoil",
  name: "foam",
  sentence:
    "no cage — one bubble per bounce stuck to the body's outside, each a translucent ball in the body's colour with a crescent toward the key, wobbling and swelling with the strain; a spent bounce is the burst ring of one, four scorched arcs where the film was",
  dir: "tools/versus/candidates/creature-recoil/foam",
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
      fields: { cage: foam },
    }),
  ],
};
