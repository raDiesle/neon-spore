import * as bullets from "../../../../../packages/render/src/bullets.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `cannon:shot` / `pip` — no tail at all, and one hard white edge to track.
 *
 * The other answer in this slot, and deliberately the opposite kind of answer.
 * `streak` says travel with the whole mass; `pip` says it with a feature small
 * enough to vanish — a 1.4 px white ring at a fifth of a tile, round a head
 * cut smaller than shipped, over a tail renounced almost entirely.
 *
 * The claim is that a smear does not travel, it merely occupies. What travels
 * is an object, and an object needs an edge: a hard rim reads as a solid thing
 * at a position, frame after frame, and an eye tracks a position far better
 * than it tracks the end of a gradient. The shipped shot has no edge, only a
 * halo fading into the field, which is exactly what a flash also looks like.
 *
 * This is the catalogue's NOTCH pair, and it is a pair on purpose: NOTCH 1
 * says the thing with a feature that can disappear at 26 px, NOTCH 2 with the
 * silhouette's whole mass, so the vote is a measurement whichever way it goes.
 *
 * How it can lose, and this is the likely half of it. A 1.4 px ring on a
 * phone, over a field that is already lit, may simply not be there — and with
 * the tail gone there is nothing left to have failed with. If `pip` vanishes,
 * that is not a bad candidate, it is the measurement: it says the shot has to
 * be carried by mass at this size, and `streak` wins on evidence rather than
 * on a session's opinion.
 */
export const SHOT_PIP: Variant = {
  slot: "cannon:shot",
  name: "pip",
  sentence: "no tail and a hard white edge on the head — an object with a position, not a smear",
  dir: "tools/versus/candidates/cannon-shot/pip",
  patches: [
    patch({
      target: bullets.SHOT_LOOK,
      reached: () => bullets.SHOT_LOOK,
      where: {
        file: "packages/render/src/bullets.ts",
        symbol: "SHOT_LOOK",
        type: "ShotLook",
      },
      fields: {
        tailBack: (frac) => frac * 0.25,
        tailAlpha: 0.14,
        tailWidth: 1,
        haloMul: 0.2,
        haloAlpha: 0.55,
        coreMul: 0.1,
        ringMul: 0.2,
        ringWidth: 1.4,
        ringColor: "#FFFFFF",
      },
    }),
  ],
};
