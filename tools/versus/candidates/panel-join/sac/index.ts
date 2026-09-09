import * as join from "../../../../../packages/render/src/band-join.js";
import { patch, type Variant } from "../../../variant.js";
import { saggingRoof } from "../fused/tissue.js";
import { slung } from "./paint.js";

/**
 * `panel:ship-join` / `sac` — every control hangs inside a bladder of the
 * ship's own skin.
 *
 * The other three cards all answer *what connects a button to the ship*. This
 * one says that is the wrong question, and that what a body actually does with
 * an organ is **carry** it: an eye sits in an orbit, an egg in a sac, and what
 * they sit in is as visible as they are. So each control is inside a
 * fluid-filled vacuole, slung from the membrane on a short thick umbilical and
 * guyed to its neighbours and to the walls by threads.
 *
 * **The bladder is transparent, which is the point of it.** Its wall thickens
 * toward the edge and clears through the middle, so the panel's own tissue is
 * still visible behind every button — the control reads as suspended in the
 * ship rather than mounted on it, and nothing that was there before is covered
 * up. It is also the only card in the slot whose main shape is a *volume*
 * rather than a surface, which is what the pair should be looking for: does the
 * panel gain a depth it did not have, or does it gain four blisters.
 *
 * **And the roof pouches for each one.** Its sag is the tightest and the
 * deepest of the four, because what hangs here is heavy and hangs from one
 * place rather than spreading its weight along the membrane.
 *
 * How it loses. A ring round a button is the shape this game uses for *armed*,
 * *locked* and *targeted*, and a permanent one round every control could read
 * as a state rather than as anatomy — the same objection that keeps marks on
 * the field made of light rather than of outlines. If it reads as four rings,
 * it has lost, and the two cards without a closed shape round a button are what
 * it is standing next to.
 */
export const JOIN_SAC: Variant = {
  slot: "panel:ship-join",
  name: "sac",
  sentence:
    "every control hangs inside a fluid-filled bladder of the ship's own skin, slung from the membrane on a thick umbilical and guyed to its neighbours — the panel gains a depth rather than a structure, and the tissue stays visible through every wall",
  dir: "tools/versus/candidates/panel-join/sac",
  patches: [
    patch({
      target: join.BAND_JOIN,
      reached: () => join.BAND_JOIN,
      where: {
        file: "packages/render/src/band-join.ts",
        symbol: "BAND_JOIN",
        type: "BandJoin",
      },
      fields: { ceiling: saggingRoof(1.6, 0.55), attach: slung },
    }),
  ],
};
