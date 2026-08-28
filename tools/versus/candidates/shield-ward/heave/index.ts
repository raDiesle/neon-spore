import * as deflectLook from "../../../../../packages/render/src/deflect-look.js";
import * as shield from "../../../../../packages/render/src/shield.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `shield:ward` / `heave` — the whole ward gives, deeply and slowly.
 *
 * The failure this slot is aimed at is a ward that reads as a wall that was
 * always there, so a catch is invisible unless you were already watching the
 * thing that hit it. That failure is not really about the shockwave: it is
 * about a rim that looks identical the instant before and the instant after,
 * which is what a bright band with a fast shimmer does.
 *
 * `heave` answers with the whole mass. The rim goes wider than a shield lobe
 * (`halfMul` past 1) and nearly twice as thick when armed, and its shimmer
 * slows to something a periphery can read as breathing rather than as static.
 * Then the catch itself is a long give: the rock presses more than twice as
 * deep for twice as long, squashing a third of its width, and the shockwave
 * starts crushed to just over half its rest size, opens to nearly a tile per
 * span and crawls outward at half the shipped rate for four tenths of a second
 * longer. The event has a duration you can arrive late to.
 *
 * How it can lose. A permanently fatter, permanently slower rim is *more* of a
 * wall, not less — the whole complaint might get worse. And a bounce that
 * takes a third of a second to resolve is a third of a second in which the
 * next rock is already falling; the pair may find they cannot tell two
 * consecutive catches apart, which is worse than not seeing one.
 */
export const WARD_HEAVE: Variant = {
  slot: "shield:ward",
  name: "heave",
  sentence:
    "a wide slow rim that visibly gives — the catch is a long deep heave you can arrive late to",
  dir: "tools/versus/candidates/shield-ward/heave",
  patches: [
    patch({
      target: shield.WARD_LOOK,
      // No accessor: `drawShieldRim` reads the export itself. The module
      // namespace is the whole route the drawing code has.
      reached: () => shield.WARD_LOOK,
      where: {
        file: "packages/render/src/shield.ts",
        symbol: "WARD_LOOK",
        type: "WardLook",
      },
      fields: {
        halfMul: 1.15,
        shimmerBase: 0.62,
        shimmerA: 0.26,
        shimmerHzA: 1.5,
        shimmerB: 0.16,
        shimmerHzB: 0.7,
        glowFloor: 0.22,
        // The two together stay at 1 exactly at the shimmer's peak, the way
        // the shipped pair does. An alpha past 1 is ignored by a real canvas,
        // so a rim that overshot would silently stop brightening at the top.
        alphaBase: 0.22,
        alphaGlow: 0.75,
        widthBase: 2,
        widthArmed: 11,
        intensityBase: 0.35,
        intensityArmed: 1.6,
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
        shockLife: 0.9,
        pressLife: 0.17,
        pressDepthFrac: 0.34,
        squashAmount: 0.32,
        ringCompressFrac: 0.55,
        ringSpanFrac: 0.85,
        ringGrowTiles: 2.6,
        ringWidth: 7,
        ringWidthFloor: 1.5,
        ringAlpha: 0.9,
        rings: 1,
        ringGap: 0,
        haloMul: 0.8,
        haloAlpha: 0.55,
      },
    }),
  ],
};
