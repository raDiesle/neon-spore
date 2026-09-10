import * as bodyHit from "../../../../../packages/render/src/body-hit.js";
import { patch, type Variant } from "../../../variant.js";
import { pop } from "./paint.js";

/**
 * `bulb:hit` / `pop` — a bubble bursting from the point the shot went in.
 *
 * **What the shipped side is.** Five squares and nine wedges: a thin case
 * round a volume, breaking like a rock.
 *
 * **What this argues.** A bulb is a bubble, and a bubble pops. The tear
 * opens at the bottom of the contour where the bolt met it and runs round
 * both ways, a bright bead at each running end, the film ahead of it
 * swelling outward and thinning until the two ends meet at the top. Inside,
 * a puff of mist in the body's cyan rises and fades — the volume the case
 * was holding. Four flecks of film fall onto the ship and lie there wet.
 *
 * **How it can lose.** *A tear is slower than a hit.* For half the strike
 * there is an open, swelling cyan stroke in the lane; if at 26 px that
 * reads as a bulb still standing, this loses.
 */
export const BULB_HIT_POP: Variant = {
  slot: "bulb:hit",
  name: "pop",
  sentence:
    "the film tears open at the bottom where the bolt met it and runs round both ways with a bright bead at each end, swelling outward as it goes, a puff of cyan mist rising out of it — four flecks of film fall to the ship and lie there wet",
  dir: "tools/versus/candidates/bulb-hit/pop",
  patches: [
    patch({
      target: bodyHit.BULB_HIT,
      // The route the effects take: `body-strike.ts` and `effects-break.ts`
      // both ask `hitFor` for the record, per kind, every kill.
      reached: () => bodyHit.hitFor("bulb"),
      where: {
        file: "packages/render/src/body-hit.ts",
        symbol: "BULB_HIT",
        type: "HitLook",
      },
      fields: { life: 0.9, strike: pop },
    }),
  ],
};
