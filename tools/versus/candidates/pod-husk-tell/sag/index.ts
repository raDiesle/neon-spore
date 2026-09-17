import * as look from "../../../../../packages/render/src/husk-look.js";
import { patch, type Variant } from "../../../variant.js";
import { sagBody } from "./paint.js";

/**
 * SAG — the husk's body carries the tell, and the frame comes off.
 *
 * **What the game draws today** is a pod, on both screens, with a white frame
 * and DO NOT TAKE round it on player 2's alone (`husk-mark.ts`). The body
 * never says anything; the mark says it all, in the frame the pair already
 * learnt on THE LURE.
 *
 * **What this argues** is that a dead thing should look dead. The shape
 * sheet's HUSK 1 — the POD card's own contour with its mass gone to the
 * bottom, on the SAG motion — was drawn for a fourth pod kind that was never
 * built, and the owner moved it here on 17 September 2026: *a second look for
 * the shipped husk mark — the sagging dead-core body offered against the flag
 * on the pod.* Player 2 sees a pod that hangs wrong and does not glow, and has
 * to say so; player 1 sees the pod. No frame, no words.
 *
 * **How it can lose.** A frame is an instruction and a sag is a fact: the pair
 * has to have learnt what a sagging pod means, and nothing on the screen tells
 * them the first time. And the difference is a proportion and a brightness on
 * a body a third of a tile wide — the sheet's own note on HUSK 1 was that an
 * eye may have nothing to point at.
 */
export const HUSK_SAG: Variant = {
  slot: "pod:husk-tell",
  name: "sag",
  sentence:
    "the husk's body is the tell — the pod's contour with its mass gone to the bottom and its core gone out, on player 2's screen, and no frame",
  dir: "tools/versus/candidates/pod-husk-tell/sag",
  patches: [
    patch({
      target: look.HUSK_LOOK,
      reached: () => look.HUSK_LOOK,
      where: {
        file: "packages/render/src/husk-look.ts",
        symbol: "HUSK_LOOK",
        type: "HuskLook",
      },
      fields: { body: sagBody, marked: false },
    }),
  ],
};
