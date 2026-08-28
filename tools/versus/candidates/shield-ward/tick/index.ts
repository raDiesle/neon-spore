import * as deflectLook from "../../../../../packages/render/src/deflect-look.js";
import * as shield from "../../../../../packages/render/src/shield.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `shield:ward` / `tick` — almost nothing there, then three rings, gone.
 *
 * The other answer in this slot, and the opposite kind of answer. `heave` says
 * the catch with the ward's whole mass; `tick` says it with a feature small
 * enough to vanish at 26 px, which is the catalogue's NOTCH pair and the
 * reason both are worth drawing.
 *
 * The reasoning is the inverse of `heave`'s. A ward reads as a wall because it
 * is always at full brightness, so the argument is not to make the wall move
 * more — it is to take the wall away. At rest the rim is a hairline at an
 * eighth of the shipped opacity with a fast nervous shimmer, barely a rim at
 * all; what it gains from being armed is proportionally enormous. Then the
 * catch is a hard tick: a press over in a twentieth of a second, a ring
 * crushed to two fifths and snapping outward at twice the shipped rate, three
 * concentric rings a quarter of a radius apart, all of it finished in under a
 * third of a second. Nothing lingers, so nothing can be mistaken for scenery.
 *
 * How it can lose, and it is the likelier of the two to. Three hairlines at a
 * phone's pixel density over a lit field may be one grey smudge or may be
 * literally invisible, and a rim thinned this far may stop reading as a shield
 * at all — which would cost the other player the thing they are aiming the
 * caller at. If `tick` disappears, the slot has learned that the ward has to
 * be carried by mass, and `heave` wins on evidence.
 */
export const WARD_TICK: Variant = {
  slot: "shield:ward",
  name: "tick",
  sentence:
    "a hairline rim at rest and three hard rings on the catch — nothing lingers to become scenery",
  dir: "tools/versus/candidates/shield-ward/tick",
  patches: [
    patch({
      target: shield.WARD_LOOK,
      reached: () => shield.WARD_LOOK,
      where: {
        file: "packages/render/src/shield.ts",
        symbol: "WARD_LOOK",
        type: "WardLook",
      },
      fields: {
        halfMul: 0.7,
        shimmerBase: 0.55,
        shimmerA: 0.06,
        shimmerHzA: 5.5,
        shimmerB: 0.04,
        shimmerHzB: 3.3,
        glowFloor: 0.12,
        alphaBase: 0.12,
        alphaGlow: 0.88,
        widthBase: 1.1,
        widthArmed: 3.4,
        intensityBase: 0.3,
        intensityArmed: 1.2,
      },
    }),
    patch({
      target: deflectLook.DEFLECT_LOOK,
      reached: () => deflectLook.DEFLECT_LOOK,
      where: {
        file: "packages/render/src/deflect-look.ts",
        symbol: "DEFLECT_LOOK",
        type: "DeflectLook",
      },
      fields: {
        life: 1.1,
        shockLife: 0.28,
        pressLife: 0.05,
        pressDepthFrac: 0.09,
        squashAmount: 0.1,
        ringCompressFrac: 0.4,
        ringSpanFrac: 0.3,
        ringGrowTiles: 9,
        ringWidth: 2,
        ringWidthFloor: 0.6,
        ringAlpha: 1,
        rings: 3,
        ringGap: 0.26,
        haloMul: 0.35,
        haloAlpha: 0.3,
      },
    }),
  ],
};
