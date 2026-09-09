import { halo } from "../../../../../packages/render/src/glow.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { ball, plumes } from "../../../../../packages/render/src/torch-ball.js";
import * as torchLook from "../../../../../packages/render/src/torch-look.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:torch` / `crown` — the fire streams off the top of the stone, so
 * the rock is seen to be falling.
 *
 * **What the shipped side is.** A ball centred on the stone, even the whole way
 * round. It is a fireball and it reads as one, and it says nothing at all about
 * which way the body is going: a torch held still on a sheet and a torch four
 * rows into its fall are the same picture.
 *
 * **What this argues.** That anything travelling through anything leaves its
 * fire behind it. The whole ball is carried **up** and stretched along that
 * axis, so the stone sits low in a flame that rises off its crown; the near
 * plumes are carried with it and are widest above the rock rather than around
 * it; and a hot cap sits where the fire leaves the stone. The rock's own
 * silhouette is untouched and so is its place on the field — nothing about the
 * rule moves, and the pair still reads the column off the stone.
 *
 * **The lean breathes rather than holding.** It rides a slow clock of its own,
 * out of phase with the ball's own boil, so the flame gathers and streams
 * instead of sitting at one offset. Parts that breathe on the same beat read as
 * one flat object, and the same parts out of phase read as alive
 * (`.claude/skills/svg-look`).
 *
 * Nothing here is placed on the stone's surface, and that is deliberate: this
 * candidate argues about the fire *around* the rock, which is the half the
 * stone never occludes (`torch-ball.ts`). The turn, the tongues on the skin and
 * the occlusion that comes with them are the shipped ones, untouched — so a
 * pair comparing this against `kiln` is comparing two different questions and
 * should say so.
 *
 * **How it can lose.** *The stone slides out of its fire.* An offset ball is
 * the one change here that can break the thing the whole pass order was built
 * for — the rock being *inside* the fire — and at the bottom of the stone there
 * is now bare rock against the field. If a torch reads as a rock with a flame
 * stuck to its head, that is this candidate failing rather than a tuning: the
 * lean would have to come down until it is no longer a lean.
 */

/** How far the ball is carried up, as a share of the stone's radius, and how
 * much it stretches along the same axis. Both modest: past a third of a radius
 * the bottom of the stone leaves the fire altogether. */
const LEAN = 0.3;
const STRETCH = 1.16;

/** Seconds for one gathering of the lean. Longer than the ball's own boil and
 * not a multiple of it, so the two never come back into step. */
const GATHER = 3.7;

/** The cap where the fire leaves the stone: how far up it sits and how wide, in
 * stone radii. */
const CAP_AT = 0.92;
const CAP_SIZE = 0.7;

/** Seconds for one turn of the fire, which is `torch-fire.ts`' own and is here
 * because a candidate replacing `flame` has to hand `ball` a turn. */
const SPIN_SECONDS = 4.5;

export const TORCH_CROWN: Variant = {
  slot: "creature:torch",
  name: "crown",
  sentence:
    "the fire is carried up off the stone's crown and streams there — a rock falling inside its own wake, instead of a rock in the middle of an even ball",
  dir: "tools/versus/candidates/creature-torch/crown",
  patches: [
    patch({
      target: torchLook.TORCH_LOOK,
      reached: () => torchLook.TORCH_LOOK,
      where: {
        file: "packages/render/src/torch-look.ts",
        symbol: "TORCH_LOOK",
        type: "TorchLook",
      },
      fields: {
        flame: (d) => {
          const { ctx, r, time } = d;
          const theta = (time / SPIN_SECONDS) * Math.PI * 2;
          const lean = LEAN * (0.72 + 0.28 * Math.sin((time / GATHER) * Math.PI * 2));
          ctx.save();
          ctx.translate(0, -r * lean);
          ctx.scale(1, STRETCH);
          ball(ctx, r, theta, time);
          ctx.restore();
          d.stone();
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.translate(0, -r * lean);
          // The near plumes carried with the ball rather than left behind on
          // the stone: the veil and the mass have to lean together, or the
          // fourth pass reads as a second fire that is standing still.
          plumes(ctx, r, theta, time, true, 0.45);
          ctx.restore();
          // And the cap, where the flame leaves the rock. Small and
          // unforeshortened — it is the brightest thing in the picture and
          // marks the one place the fire is being pushed through.
          halo(ctx, 0, -r * (CAP_AT + lean), r * CAP_SIZE, PALETTE.emberRim, 0.34);
        },
      },
    }),
  ],
};
