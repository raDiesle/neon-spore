import * as look from "../../../../../packages/render/src/cairn-look.js";
import { patch, type Variant } from "../../../variant.js";
import { bankedPile } from "./paint.js";

/**
 * `cairn:pile` / `banked` — grey stone, with the fire gone down into the seams.
 *
 * **What the shipped side is.** Seven burning rocks drawn live every frame
 * under one clip — the pile is made of the field's rocks and burns like them,
 * and costs what seven of them cost, for the whole wave.
 *
 * **What this argues.** That a rock standing still should not look like a rock
 * falling. The stones are the game's grey stone, painted once and held; what
 * is live is the heat between them — one ember glow from the pile's middle,
 * inside its outline, and the seams stroked in the ember's own colour,
 * breathing slowly. A banked fire is grey on the outside and glows in the
 * cracks, and that is a thing that has been standing a while. Every rock the
 * pair pulls off becomes a live burning one on its way down, so the pull is
 * the moment grey turns to fire — the mechanic drawn as a change of material.
 *
 * **How it can lose.** *It is a different rock.* The pile's whole argument
 * (`cairn-pile.ts`) is that the parts have to *be* ordinary rocks while they
 * are stacked, and a grey stack coming apart into burning rocks may read as
 * one thing turning into another rather than one thing made of seven. And the
 * seam glow is a mark in light on a body that the field's other marks already
 * use for *next* and *held* — the tell and the hand may lose to it.
 */
export const CAIRN_BANKED: Variant = {
  slot: "cairn:pile",
  name: "banked",
  sentence:
    "grey stone held still, with one ember glow inside the outline and the seams breathing in the ember's own colour — a fire that has been standing long enough to bank",
  dir: "tools/versus/candidates/cairn-pile/banked",
  patches: [
    patch({
      target: look.CAIRN_LOOK,
      reached: () => look.CAIRN_LOOK,
      where: { file: "packages/render/src/cairn-look.ts", symbol: "CAIRN_LOOK" },
      fields: { pile: bankedPile },
    }),
  ],
};
