import * as look from "../../../../../packages/render/src/cairn-look.js";
import { patch, type Variant } from "../../../variant.js";
import { stillPile } from "./paint.js";

/**
 * `cairn:pile` / `still` — the shipped pile, taken once and held.
 *
 * **What the shipped side is.** Seven of the field's burning rocks drawn live
 * every frame — each one's whole fire, tongues, craters and halo — under one
 * clip that throws most of each away, because the stone above covers it. The
 * fire flickers, the stones turn a little and the pile settles; it costs what
 * seven rocks cost, on screen for the whole wave.
 *
 * **What this argues.** That a standing pile does not need to burn live. The
 * same picture is painted once, at one instant, into a canvas the size of the
 * stack and blitted after that: the same three materials, the same seams, the
 * same silhouette, and one image call a frame instead of seven fires. What the
 * pair loses is the flicker — and the claim is that on a thing that never
 * moves, the flicker was the one part of the rock's look that said *falling*,
 * and a pile is the rock that is not.
 *
 * **How it can lose.** *A frozen fire is a painted fire.* At 26 px a tongue
 * that holds still may read as a decal on the stone rather than as heat, and
 * a body whose parts are the live rocks the pair will soon be pulling off may
 * look wrong standing dead beside them. The tell that points at the next stone
 * (`cairn-settle.ts`) and the hand on one (`cairn-hand.ts`) still read the
 * live settle, so their marks drift a fiftieth of a rock against a picture
 * that does not — small, and visible to an eye that is looking for it.
 */
export const CAIRN_STILL: Variant = {
  slot: "cairn:pile",
  name: "still",
  sentence:
    "the same seven burning rocks, painted once at one instant and blitted after — a pile that holds its heat still instead of flickering for the whole wave",
  dir: "tools/versus/candidates/cairn-pile/still",
  patches: [
    patch({
      target: look.CAIRN_LOOK,
      reached: () => look.CAIRN_LOOK,
      where: { file: "packages/render/src/cairn-look.ts", symbol: "CAIRN_LOOK" },
      fields: { pile: stillPile },
    }),
  ],
};
