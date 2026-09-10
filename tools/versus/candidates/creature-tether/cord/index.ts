import * as tetherLook from "../../../../../packages/render/src/tether-look.js";
import { patch, type Variant } from "../../../variant.js";
import { cord, grommet } from "./paint.js";

/**
 * `creature:tether` / `cord` — the rope is round.
 *
 * **What the shipped side is.** One glowing stroke of one width from the eye
 * to the hand, thinning and brightening as it is pulled: a line, with
 * nothing on it to say it has a side.
 *
 * **What this argues.** That a rope is a cylinder, and three strokes on one
 * curve say so — a cool shadow the full width underneath, the body colour
 * narrower over it, and a thin highlight laid along the key side. The root
 * becomes a grommet the cord passes through rather than a dot it starts at.
 * Pulled, the cord thins and the highlight goes hard, so the tension is
 * still read off the rope alone.
 *
 * **How it can lose.** *Three strokes at four pixels are one stroke.* If on
 * a phone the shadow and the highlight merge into a slightly wider line,
 * the round has cost width and bought nothing.
 */
export const TETHER_CORD: Variant = {
  slot: "creature:tether",
  name: "cord",
  sentence:
    "the rope as a round cord — a cool shadow its full width, the body colour narrower over it and a thin highlight along the key side, thinning and hardening as it is pulled — leaving the eye through a grommet rather than from a dot",
  dir: "tools/versus/candidates/creature-tether/cord",
  patches: [
    patch({
      target: tetherLook.TETHER_LOOK,
      // No accessor: `tether.ts` reads the export itself. The module namespace
      // is the whole route there is.
      reached: () => tetherLook.TETHER_LOOK,
      where: {
        file: "packages/render/src/tether-look.ts",
        symbol: "TETHER_LOOK",
        type: "TetherLook",
      },
      fields: { rope: cord, root: grommet },
    }),
  ],
};
