import * as ghostLook from "../../../../../packages/render/src/ghost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { swarm } from "./paint.js";

/**
 * `creature:ghost` / `swarm` — the nebula is a crowd of motes streaming round
 * the inside of the dome.
 *
 * **What the shipped side is.** One radial gradient, colour welling up from
 * the middle and dark at the rim: a nebula that cannot move, because a
 * gradient is the same picture from every side.
 *
 * **What this argues.** That the inside of this body should be *alive*.
 * Fourteen motes of its own light, each pinned to a place on a ball inside
 * the contour and carried round by the camouflage's own turn — faster than
 * the bands, because a swarm is not a skin — each a disc facing us, a sliver
 * at the limb, lit toward `KEY` and seen faintly through the body when it is
 * behind, so every one of them goes round the back and comes out the other
 * side. Each drifts up and down its own meridian too, so the crowd never
 * settles into a ring. `lantern` and `hollow` next door keep the nebula and
 * light it; this replaces it with something moving. The camouflage is
 * `latitude` on both sides, untouched.
 *
 * **How it can lose.** *A ghost with measles.* At 26 px a mote is a pixel,
 * and the seven bands are already on this body. Judge it small.
 */
export const GHOST_SWARM: Variant = {
  slot: "creature:ghost",
  name: "swarm",
  sentence:
    "the nebula is a crowd — fourteen motes of the body's own light streaming round a ball inside the dome, lit toward the key, drifting on their own meridians, each going round the back and coming out the other side",
  dir: "tools/versus/candidates/creature-ghost/swarm",
  patches: [
    patch({
      target: ghostLook.GHOST_LOOK,
      // No accessor: `drawGhost` reads the export itself. The module namespace
      // is the whole route there is.
      reached: () => ghostLook.GHOST_LOOK,
      where: {
        file: "packages/render/src/ghost-look.ts",
        symbol: "GHOST_LOOK",
        type: "GhostLook",
      },
      fields: { interior: swarm },
    }),
  ],
};
