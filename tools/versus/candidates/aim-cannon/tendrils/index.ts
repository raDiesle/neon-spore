import * as aim from "../../../../../packages/render/src/cue-helper.js";
import { patch, type Variant } from "../../../variant.js";
import { paintTendrils, REACH } from "./paint.js";

/**
 * TENDRILS — offered 6 October 2026, the owner's second answer on the
 * shot's mark: *create more variants, it should look more cool, again colour
 * of either cyan or the red of cannon button must be clear. maybe some more
 * neon and more living, it looks too much geometric like straight lines.
 * maybe with more unevenness.* In the cyan of the fire button,
 * `PALETTE.cyan` exactly. Five tendrils of different lengths reach in at the target from all round, a wave running down each and the tip curling in to a glowing bud, round an uneven ring. The grey scan box goes.
 */
export const AIM_TENDRILS: Variant = {
  slot: "aim:cannon",
  name: "tendrils",
  sentence:
    "tendrils — five cyan tendrils, the fire button's cyan, curling in at the target and waving, each tip a glowing bud, round an uneven ring, and no grey box",
  dir: "tools/versus/candidates/aim-cannon/tendrils",
  patches: [
    patch({
      target: aim.AIM_LOOK,
      reached: () => aim.AIM_LOOK,
      where: { file: "packages/render/src/cue-helper.ts", symbol: "AIM_LOOK" },
      fields: { paint: paintTendrils, boxed: false, reach: REACH },
    }),
  ],
};
