import * as interior from "../../../../../packages/render/src/body-interior.js";
import { patch, type Variant } from "../../../variant.js";
import { sediment } from "./paint.js";

/**
 * `creature:slick` / `sediment` — a level, and something heavy under it.
 *
 * **What this argues.** The other four answers fill a sac. This one fills the
 * bottom of it, and the empty top is the idea: a body with a level in it reads
 * as a container of liquid without anybody being told, and it is the only one
 * of the five that says which way up the creature is. The level tilts slowly as
 * the body falls; the grains do not move, because sediment that jittered would
 * be a body in a shaker.
 *
 * **How it can lose.** *It is the quietest of the five.* Fourteen small grains
 * low in each sac and a thin ellipse over them may be nothing at all at
 * twenty-six pixels — where LATTICE and BLOOM will be legible or offensive,
 * this one's failure is being invisible, and the page's own size note is the
 * thing to read before deciding it lost.
 */
export const SLICK_SEDIMENT: Variant = {
  slot: "creature:slick",
  name: "sediment",
  sentence:
    "grains settled in the bottom of each sac under a tilting level — a container, and which way up it is",
  dir: "tools/versus/candidates/creature-slick/sediment",
  patches: [
    patch({
      target: interior.SLICK_LOOK,
      reached: () => interior.interiorFor("slick"),
      where: {
        file: "packages/render/src/body-interior.ts",
        symbol: "SLICK_LOOK",
        type: "BodyInterior",
      },
      fields: { paint: sediment },
    }),
  ],
};
