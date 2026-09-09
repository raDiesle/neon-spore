import { haloSprite } from "../../../../../packages/render/src/glow.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import * as torchVeil from "../../../../../packages/render/src/torch-veil.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `torch:veil` / `bloom` — one soft glow over the whole stone instead of five
 * plumes across its face.
 *
 * **What the shipped side is.** The nearest plumes drawn a second time, over
 * the rock, after it has gone down opaque — four or five separate bright
 * lozenges lying across the face at whatever longitudes the fire has rolled to
 * this instant. They are the same marks that were drawn behind the stone a
 * moment earlier, which is what the pass is: the fire showing through.
 *
 * **What this argues, against FIFTH standing beside it.** FIFTH says the
 * shipped answer is right and only the volume is wrong. BLOOM says the *shape*
 * is wrong. A rock inside a fire does not have five bright patches on its face
 * — it has an even wash, because what reaches the eye through a body that
 * bright is scattered light and scattering has no structure in it. So the veil
 * is one halo, centred on the stone, at the size of the stone, breathing on
 * the fire's own flicker and on nothing else.
 *
 * Three things follow, and they are the case for it.
 *
 * *The craters keep their edges.* A crater is a dark notch in a grey mass, and
 * what destroys it is a bright edge crossing it. A plume is exactly that; an
 * even wash is not, however bright it is. This is the answer that can be
 * *loud* and still leave the readout alone, which is a thing FIFTH cannot
 * claim — FIFTH buys the craters back by turning the light down, and pays for
 * them with the rock's connection to its own fire.
 *
 * *It costs one blit.* The shipped pass and FIFTH both walk nine plumes and
 * draw the four or five on the near side. This is one cached sprite, and the
 * sprite is the one the ball is already made of.
 *
 * *And it is the same picture at every size.* Five lozenges on a body that is
 * twenty-six pixels across up the field are not five of anything; they are a
 * texture. A wash reads as a wash at any size, which is what the far end of the
 * lane actually shows.
 *
 * **How it can lose, and the pair should watch for exactly this.** *The fire
 * stops rolling.* The plumes over the face are the only thing on the near side
 * that says this rock is *turning*, and everything else that turns — the
 * tongues, the far plumes — is either on the skin or behind the body. A wash
 * that only breathes may take the roll out of the picture and leave a dark
 * disc in a bright fog, which is a different failure from the one FIFTH risks
 * and a worse one if it happens: a torch that has stopped moving is a torch
 * that has stopped being the fastest thing on the field.
 */
export const TORCH_BLOOM: Variant = {
  slot: "torch:veil",
  name: "bloom",
  sentence:
    "one even glow over the whole stone instead of five bright plumes across it — scattered light has no structure in it, and a wash cannot cross a crater the way a lozenge does",
  dir: "tools/versus/candidates/torch-veil/bloom",
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
        draw: ({ ctx, r, time }) => {
          // The ball's own breath, and no second clock: the same frequency the
          // fire is already breathing on is what this rides, so the wash is
          // part of the fire rather than a thing pulsing on top of it.
          const breath = 0.86 + 0.14 * Math.sin(time * 2.7);
          const sprite = haloSprite(PALETTE.ember, Math.max(2, Math.round(r)));
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = 0.3 * breath;
          ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
          ctx.restore();
        },
      },
    }),
  ],
};
