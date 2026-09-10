import * as caromLook from "../../../../../packages/render/src/carom-look.js";
import { patch, type Variant } from "../../../variant.js";
import { pitted, wake } from "./paint.js";

/**
 * `creature:carom` / `pits` — the stone is a surface with holes in it, and what
 * it leaves behind is made of stone rather than of colour.
 *
 * **What the shipped side is.** A crystal filled with one mid-tone, lit by a
 * single round key pass, turning; and behind it a wedge of the body's colour
 * fading to nothing. Both are correct and neither says anything about a *far
 * side*: the fill is uniform, so a facet coming round is a facet that was
 * already there, and a gradient smear is the same smear whichever way the rock
 * happens to be facing.
 *
 * **What this argues.** That a rock is read by the holes in it. Nine pits
 * placed by longitude and latitude, carried round by the roll the stone
 * already has, each drawn about its own origin and foreshortened by the
 * tangent plane — a full cup facing us, a sliver at the limb, gone on the far
 * side. Each is dark where a ball is bright and carries a lit far lip, because
 * that inversion is what says *into* rather than *onto*. And the streak becomes
 * three ghosts of the stone's own outline at the turns it had a sixth, a third
 * and a half of a beat ago: a wake that shows the thing was **rolling** while
 * it crossed, which a gradient cannot.
 *
 * **How it can lose.** *Nine holes at twenty-six pixels is noise.* The rock is
 * the smallest thing on this page carrying a placed surface, and three ghosts
 * of a seven-sided crystal is three more outlines in a lane already carrying a
 * body, a bezel and a hatch. If at the pair the crust reads as speckled rather
 * than as pitted, or the wake reads as four caroms, the count comes down to
 * five and the ghosts to one.
 */
export const CAROM_PITS: Variant = {
  slot: "creature:carom",
  name: "pits",
  sentence:
    "a rock read by the holes in it — nine pits placed by longitude and latitude and carried round by its own roll, each lit on the wall a ball is dark on, over a wake of three fading copies of the rock's own outline at the turns it had a moment ago",
  dir: "tools/versus/candidates/creature-carom/pits",
  patches: [
    patch({
      target: caromLook.CAROM_LOOK,
      // No accessor: `carom.ts` reads the export itself, twice per body. The
      // module namespace is the whole route there is.
      reached: () => caromLook.CAROM_LOOK,
      where: {
        file: "packages/render/src/carom-look.ts",
        symbol: "CAROM_LOOK",
        type: "CaromLook",
      },
      fields: { shell: pitted, travel: wake },
    }),
  ],
};
