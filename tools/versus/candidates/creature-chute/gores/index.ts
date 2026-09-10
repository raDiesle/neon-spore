import * as chuteLook from "../../../../../packages/render/src/chute-look.js";
import { patch, type Variant } from "../../../variant.js";
import { fluted, gored } from "./paint.js";

/**
 * `creature:chute` / `gores` — a dome is made of panels, and a panel has a
 * normal.
 *
 * **What the shipped side is.** One bellied curve filled at low alpha with a
 * bright rim, leaning about the body on a slow sway, and under a climbing body
 * a flat tapering flame with a paler core. Both are outlines with a wash in
 * them: nothing inside either shape changes as the assembly moves, so the sway
 * reads as a picture being tilted and the flame as a triangle.
 *
 * **What this argues.** That a canopy is a *hemisphere* and the cheapest proof
 * of one is where its seams sit. Eight meridian gores placed by longitude and
 * carried round by the sway: the pair near the middle stand wide apart, the
 * ones approaching the limb crowd together and go, and the far four are not
 * drawn. That crowding is the difference between a dome and a fan, and it is
 * not reachable by any amount of leaning. Each panel is shaded by its own
 * normal against the fixed key. The plume takes the same argument pointed down
 * — three ribs placed round a column and swinging on their own clock, so the
 * fire has a near side.
 *
 * **How it can lose.** *It is a parachute.* Gores are what nylon is cut into,
 * and `chute.ts` argues at length that this thing is a membrane rather than
 * fabric because everything in this game that is not rock is grown. If at the
 * pair the canopy reads as equipment the body was issued, the seams have to
 * become veins — the same placement, drawn as thickenings rather than as cuts.
 */
export const CHUTE_GORES: Variant = {
  slot: "creature:chute",
  name: "gores",
  sentence:
    "a dome made of panels — eight meridian gores placed by longitude and carried round by the sway, crowding together at the limb, each shaded by its own normal, over a plume with three lit ribs down it",
  dir: "tools/versus/candidates/creature-chute/gores",
  patches: [
    patch({
      target: chuteLook.CHUTE_LOOK,
      // No accessor: `chute.ts` reads the export itself, once per body. The
      // module namespace is the whole route there is.
      reached: () => chuteLook.CHUTE_LOOK,
      where: {
        file: "packages/render/src/chute-look.ts",
        symbol: "CHUTE_LOOK",
        type: "ChuteLook",
      },
      fields: { canopy: gored, plume: fluted },
    }),
  ],
};
