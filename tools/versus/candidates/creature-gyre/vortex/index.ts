import * as gyreLook from "../../../../../packages/render/src/gyre-look.js";
import { patch, type Variant } from "../../../variant.js";
import { vortex } from "./paint.js";

/**
 * `creature:gyre` / `vortex` — the middle of the wheel is a throat going down,
 * not a ball with things in it.
 *
 * **What the shipped side is.** `yolk` (`gyre-core.ts`): a lit ball inside a
 * breathing membrane, nine granules carried round on its surface, a specular
 * that stays put and a nucleus in the middle. It is a solid thing turning.
 *
 * **What this argues.** That the one part of a wheel nothing stands on should
 * say what the wheel *does*. A gyre pulls — the maw drags a shot toward the
 * hub — and the picture of a pull is fluid going down a hole. So the mass is
 * drawn as a funnel seen from above and a little in front: five terraces,
 * each deeper, darker and higher up the picture than the one outside it, with
 * three arms of light spiralling down them at the wheel's true rate and faster
 * as they go. The nucleus is at the bottom. Depth here is the funnel's own
 * asymmetry: an arm on the far wall is face-on and bright, and on the near
 * wall it is foreshortened behind the lip. `pull` brightens the mouth, so the
 * readout the pair checks is still in the middle of the wheel.
 *
 * **What it does not touch.** The aura, the membrane and its turn are
 * `gyre-core.ts`'s passes called as they are, and the contour is
 * `gyreSkinPath`. The rim and the six bodies are not this slot's
 * (`gyre-look.ts`).
 *
 * **How it can lose.** *It reads as a target.* Concentric rings inside a
 * wheel are a bullseye, and a bullseye says *aim here* to a pair who must
 * not — the six bodies are what is shot, and the hub is what eats the shot.
 * If the terraces read as rings rather than as steps going down, the tilt
 * and the drop are not doing their work, and the candidate has failed rather
 * than needing tuning.
 */
export const GYRE_VORTEX: Variant = {
  slot: "creature:gyre",
  name: "vortex",
  sentence:
    "the middle of the wheel is a throat — five terraces going down, three arms of light spiralling into it faster as they go, the nucleus at the bottom",
  dir: "tools/versus/candidates/creature-gyre/vortex",
  patches: [
    patch({
      target: gyreLook.GYRE_LOOK,
      reached: () => gyreLook.GYRE_LOOK,
      where: {
        file: "packages/render/src/gyre-look.ts",
        symbol: "GYRE_LOOK",
        type: "GyreLook",
      },
      fields: { core: vortex },
    }),
  ],
};
