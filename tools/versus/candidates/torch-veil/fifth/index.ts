import { plumes } from "../../../../../packages/render/src/torch-ball.js";
import * as torchVeil from "../../../../../packages/render/src/torch-veil.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `torch:veil` / `fifth` — the veil at the strength the code always claimed it
 * was, which no device has ever drawn.
 *
 * **What the shipped side is, and why this slot exists at all.** A burning rock
 * ends with a fourth pass: the nearest plumes again, over the stone's own face,
 * after the stone has gone down opaque. `torch-fire.ts` set `globalAlpha` to
 * 0.2 before that pass and `plumes` overwrote it per plume, so the veil has
 * been the near plumes at full strength — the same value they are drawn at
 * *behind* the rock — for the creature's whole life. The constant said a fifth
 * and reached nothing. That was found by a lane making the fire cheaper, and
 * the finding is not "a bug to fix": what has been on the field is what the
 * owner has been looking at, on THE TORCH and on BULB QUEEN's six sockets, and
 * turning it down is a look changed rather than chosen.
 *
 * **What this argues.** That the file was right the first time. The comment
 * beside the constant says what the pass is for and what it costs to overdo —
 * *"with it any louder, the craters stop being countable, and the craters are
 * the only readout this body carries"* — and a fifth is the number somebody
 * wrote down while thinking about exactly that. On this side the stone stays
 * **grey**: the tongues lying on its skin read as separate marks on a dark
 * mass, the craters a shot opens keep their edges, and the fire is a thing the
 * rock is inside rather than a wash across it.
 *
 * It is one number, and that is the whole reason it is a candidate rather than
 * a fix. `plumes` takes a `strength` multiplier now, defaulting to one, so this
 * is the shipped placement, the shipped flicker and the shipped foreshortening
 * with a fifth of the light on it. Nothing about *where* a plume goes is being
 * argued.
 *
 * **How it can lose, and the pair should watch for exactly this.** *The rock
 * falls out of its own fire.* The veil is the only thing tying the stone to the
 * ball around it — everything else this creature draws is either behind the
 * rock or on its silhouette — so a fifth may be too little to stop it reading
 * as a dark disc pasted over a fireball, which is the picture the whole fourth
 * pass exists to prevent. Watch it at a distance rather than close up: at the
 * couple of dozen pixels a torch draws at up the field, a fifth of a plume may
 * simply not be there.
 */
export const TORCH_FIFTH: Variant = {
  slot: "torch:veil",
  name: "fifth",
  sentence:
    "the veil over the stone's face at the fifth its own constant always said — the rock stays grey, the tongues on it stay separate marks, and the craters keep their edges",
  dir: "tools/versus/candidates/torch-veil/fifth",
  patches: [
    patch({
      target: torchVeil.TORCH_VEIL,
      // No accessor: `torch-fire.ts` reads the export itself, once per torch
      // per frame. The module namespace is the whole route there is.
      reached: () => torchVeil.TORCH_VEIL,
      where: {
        file: "packages/render/src/torch-veil.ts",
        symbol: "TORCH_VEIL",
        type: "TorchVeil",
      },
      fields: {
        draw: ({ ctx, r, theta, time }) => {
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          // The shipped pass with the shipped placement, at the strength the
          // shipped code asked for and never got.
          plumes(ctx, r, theta, time, true, 0.2);
          ctx.restore();
        },
      },
    }),
  ],
};
