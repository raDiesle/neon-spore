import * as recoilLook from "../../../../../packages/render/src/recoil-look.js";
import { patch, type Variant } from "../../../variant.js";
import { moons } from "./paint.js";

/**
 * `creature:recoil` / `moons` — no cage: the bounces orbit the body.
 *
 * **What the shipped side is.** A frame in one plane. The owner asked on 10
 * September 2026 for answers that are not a frame at all, with one rule:
 * what sits inside keeps the cannon's colour.
 *
 * **What this argues.** One moon per bounce on a ring tilted toward the
 * viewer, its near side under the body and its far side skimming over the
 * top, turning on the clock. Each moon is placed on the ring and projected
 * by `facet`, so a near one is large and lit and a far one small and dim,
 * and a moon coming round from behind the body is the reveal a frame drawn
 * flat could never make. A spent bounce is a cinder — the moon gone dark,
 * still on its orbit. The body is untouched.
 *
 * **How it can lose.** *A far moon over the top of the body is a spot on the
 * body.* The cage is drawn over the creature, so the far half of the orbit
 * is too; if at 26 px that reads as a mark rather than a satellite behind,
 * the tilt has to lift the orbit clear or the candidate goes.
 */
export const RECOIL_MOONS: Variant = {
  slot: "creature:recoil",
  name: "moons",
  sentence:
    "no cage — one moon per bounce on a ring tilted toward the viewer and turning on the clock, placed by pin and facet so a moon comes round from behind the body large and lit and shrinks away dim; a spent bounce is a cinder still on its orbit",
  dir: "tools/versus/candidates/creature-recoil/moons",
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
      fields: { cage: moons },
    }),
  ],
};
