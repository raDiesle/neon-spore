import * as gyreLook from "../../../../../packages/render/src/gyre-look.js";
import { patch, type Variant } from "../../../variant.js";
import { helix } from "./paint.js";

/**
 * `creature:gyre` / `helix` — something coiled is growing inside the ball, and
 * it is winding.
 *
 * **What the shipped side is.** `yolk` (`gyre-core.ts`): nine loose granules
 * on the surface of a lit ball, carried round by the wheel. They are marks,
 * and marks are placed but not *alive* — nothing in the fluid does anything
 * the wheel is not doing to it.
 *
 * **What this argues.** That an organelle should have something in it. The
 * granules become one strand wound round the inside of the membrane from the
 * bottom of the ball to the top — thirty beads on a helix, each pinned at
 * a longitude and latitude and turned by `facet` at the wheel's true rate,
 * the near ones over the mass and the far ones seen dimly through it — and the
 * last bead is a head, which is what the nucleus was. Then the strand creeps:
 * on a slow clock of its own the beads advance along the coil and are taken
 * up into the head, so on top of the wheel's turn the thing inside is seen to
 * be *moving through* the fluid, a grown thing and not a mechanism. The two
 * clocks are not multiples, so the picture never repeats.
 *
 * **What it does not touch.** The mass, the specular, the membrane and the
 * aura are the shipped passes called as they are; the rim and the six bodies
 * are not this slot's (`gyre-look.ts`).
 *
 * **How it can lose.** *It is a worm in a jar.* A coil with a head is a
 * creature, and a creature inside the hub is a body the pair might think can
 * be shot. If at the pair the head reads as something to aim at rather than
 * as the middle of the wheel, the head has to go back to being a nucleus,
 * which is most of the argument. And thirty beads at the size a core is
 * drawn may be a smear — `bun run versus:shot` at true size is the check, not
 * the magnified pair.
 */
export const GYRE_HELIX: Variant = {
  slot: "creature:gyre",
  name: "helix",
  sentence:
    "one strand coiled round the inside of the ball, thirty beads on a helix turning with the wheel and creeping up into a head — a thing moving through the fluid, not marks on it",
  dir: "tools/versus/candidates/creature-gyre/helix",
  patches: [
    patch({
      target: gyreLook.GYRE_LOOK,
      reached: () => gyreLook.GYRE_LOOK,
      where: {
        file: "packages/render/src/gyre-look.ts",
        symbol: "GYRE_LOOK",
        type: "GyreLook",
      },
      fields: { core: helix },
    }),
  ],
};
