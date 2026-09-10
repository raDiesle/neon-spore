import * as gyreLook from "../../../../../packages/render/src/gyre-look.js";
import { patch, type Variant } from "../../../variant.js";
import { orbit } from "./paint.js";

/**
 * `creature:gyre` / `orbit` — a band of light girdles the ball at a tilt, and
 * the ball is in the way of half of it.
 *
 * **What the shipped side is.** `yolk` (`gyre-core.ts`): nine granules
 * pinned to the surface of a lit ball and carried round by the wheel, a
 * specular that stays put, a nucleus in the middle. The reveal is there — a
 * granule comes round the limb — but at the size a core is drawn nine small
 * dots are a texture, and a texture going round reads as a pattern before it
 * reads as a surface.
 *
 * **What this argues.** That one continuous thing going *behind* the ball says
 * round louder than nine things going over it. The marks in the fluid are a
 * single ring — a great circle tipped off the equator, turning at the wheel's
 * true rate — drawn as a far arc under the mass, dim and thin and seen
 * through it, and a near arc over the mass and over the nucleus, bright and
 * wide. The two meet at the limb and swap once per turn. A second, fainter
 * band is tipped the other way and turns slower, so the picture never
 * repeats. The mass, the specular, the membrane and the aura are the shipped
 * passes called as they are (`gyreMass`, `gyreSpecular`, `gyreSkinPath`).
 *
 * **What it does not touch.** The rim and the six bodies, which are not this
 * slot's (`gyre-look.ts`); the contour; the nucleus, which is only moved under
 * the near arc so the arc has something to pass in front of.
 *
 * **How it can lose.** *It reads as a planet.* A ring round a ball is Saturn
 * before it is anything else, and an organelle wearing a ring is a body that
 * has stopped being grown. The tilt is the answer to that — a ring seen edge
 * on is a belt on a body, and a ring seen open is a planet — and if at the
 * pair the open half of the turn is what an eye remembers, the band has to go
 * rather than be tuned.
 */
export const GYRE_ORBIT: Variant = {
  slot: "creature:gyre",
  name: "orbit",
  sentence:
    "one band of light girdles the ball at a tilt — the far half seen dimly through the mass, the near half drawn over the nucleus, swapping once a turn",
  dir: "tools/versus/candidates/creature-gyre/orbit",
  patches: [
    patch({
      target: gyreLook.GYRE_LOOK,
      reached: () => gyreLook.GYRE_LOOK,
      where: {
        file: "packages/render/src/gyre-look.ts",
        symbol: "GYRE_LOOK",
        type: "GyreLook",
      },
      fields: { core: orbit },
    }),
  ],
};
