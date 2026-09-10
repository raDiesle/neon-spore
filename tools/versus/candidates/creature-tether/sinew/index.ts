import * as tetherLook from "../../../../../packages/render/src/tether-look.js";
import { patch, type Variant } from "../../../variant.js";
import { sinew, socket } from "./paint.js";

/**
 * `creature:tether` / `sinew` — the rope is a piece of the boss.
 *
 * **What the shipped side is.** One glowing stroke of one width from the eye
 * to the hand, thinning and brightening as it is pulled: a cable tied to a
 * creature.
 *
 * **What this argues.** That the thing the rope is tied to is flesh, so the
 * rope is too. A translucent sheath thick at the eye and tapering to the
 * hand, with a bright core down it; while a hand is on it, pulses run up
 * the core from the hand to the eye — the pull seen *arriving* at the thing
 * it opens, faster and brighter the harder it is — and taut it goes pale
 * and narrow. The root is a puckered socket, six creases drawing in toward
 * the hole as the pull rises, so the boss is seen to be gripped where it is
 * being pulled.
 *
 * **How it can lose.** *A wide translucent band over the field is a smear.*
 * If the sheath hides what is behind it rather than tinting it, or the
 * pulses read as bullets going the wrong way, the rope has become weather.
 */
export const TETHER_SINEW: Variant = {
  slot: "creature:tether",
  name: "sinew",
  sentence:
    "the rope as a tendon of the boss's own flesh — a translucent sheath thick at the eye and tapering to the hand over a bright core, pulses running up it from the hand to the eye while it is held, pale and narrow when taut — leaving a puckered socket that draws in with the pull",
  dir: "tools/versus/candidates/creature-tether/sinew",
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
      fields: { rope: sinew, root: socket },
    }),
  ],
};
