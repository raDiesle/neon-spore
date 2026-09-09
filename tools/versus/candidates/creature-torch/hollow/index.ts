import { METEOR } from "../../../../../packages/content/src/crystals.js";
import { crystalPath } from "../../../../../packages/content/src/shapes.js";
import { facet, LAT_LIMIT, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { ball, EMBER_FLOOR, flicker } from "../../../../../packages/render/src/torch-ball.js";
import * as torchLook from "../../../../../packages/render/src/torch-look.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:torch` / `hollow` — the fire is behind the stone and burns at its
 * edge, and the face of the rock is dark.
 *
 * **What the shipped side is.** Eighteen tongues lie on the stone's own skin,
 * the far half hidden behind it and the near half drawn across its face, and
 * then the nearest plumes again over all of it. The rock is inside the fire,
 * which is what the pass order was built for — and the price is that the face
 * of the stone is the busiest part of the picture, on a body whose only readout
 * is the craters a shot opens in it.
 *
 * **What this argues.** That a solid thing is read at its edge. Nothing at all
 * crosses the face here: the ball burns behind the rock as it always did, and
 * what the near side gets is a **rim** — two strokes just inside the outline,
 * the wide one dim and the narrow one pale — plus the handful of tongues that
 * are near the limb, where a surface is nearly edge-on. That is the oldest cue
 * there is for a sphere in front of a light, and it costs the craters nothing:
 * the middle of the stone stays the grey the shipped hand painted, so a chip in
 * it is a chip and not a dark tongue.
 *
 * The tongues that survive are chosen by the same `facet` the shipped fire uses
 * and by the same `|sx|`, which is how edge-on a mark's own surface is — so a
 * tongue still leaves at one limb, spends the far half of its turn hidden, and
 * comes back at the other. Nothing about the rotation is argued.
 *
 * **How it can lose.** *The rock stops burning.* A rim is a boundary and a fire
 * is a volume, and a stone with a bright edge and a dead middle may read as a
 * hole cut in the fireball rather than as a body inside one — which is exactly
 * the failure the shipped fourth pass exists to prevent. Watch the moment a
 * torch crosses a bright part of the field: a rim that is only a little
 * brighter than what is behind it is no rim at all.
 */

/** How many tongues cling to the skin. The shipped eighteen, so the two sides
 * differ in where a tongue may be and never in how many there are. */
const EMBERS = 18;
const REACH = 1.12;
const SPIN_SECONDS = 4.5;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/**
 * How edge-on a facet has to be to keep its tongue. A third: `|sx|` is the
 * cosine of the longitude off the meridian facing us, so this is the outer
 * seventy degrees of the near hemisphere — the band that reads as the *side* of
 * a ball rather than as its face.
 */
const LIMB = 0.34;

/** The rim, as shares of the stone's radius: where it sits, how wide the dim
 * pass is and how wide the pale one. Inside the outline rather than on it, so
 * the stone's own edge still closes the shape. */
const RIM_AT = 0.93;
const RIM_WIDE = 0.22;
const RIM_FINE = 0.07;

const PINS = Array.from({ length: EMBERS }, (_, i) =>
  pin(i * GOLDEN, Math.sin(i * 1.7) * LAT_LIMIT * 0.8, REACH),
);

export const TORCH_HOLLOW: Variant = {
  slot: "creature:torch",
  name: "hollow",
  sentence:
    "the fire burns behind the stone and at its edge and never across its face — a dark rock with a burning rim, and every crater in it countable",
  dir: "tools/versus/candidates/creature-torch/hollow",
  patches: [
    patch({
      target: torchLook.TORCH_LOOK,
      // No accessor: `torch.ts` reads the export itself, once per torch per
      // frame. The module namespace is the whole route there is.
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
          ball(ctx, r, theta, time);
          d.stone();
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          // The rim: wide and dim under narrow and pale, which is one light
          // falling off rather than two rings.
          //
          // **It is the stone's own contour and never a circle round it.** The
          // rock is a crystal with facets and a slow wobble, so a ring would
          // stand off the shape wherever the shape came in — armour and light
          // alike are cut from a body's own outline in this game. The path is
          // the shipped one at the shipped seed and turn (`drawStone`,
          // torch.ts), asked for at a smaller radius rather than scaled, so the
          // stroke keeps its width.
          const breath = 0.82 + 0.18 * Math.sin(time * 2.7);
          const inner = new Path2D(
            crystalPath(
              0,
              0,
              r * RIM_AT,
              r * RIM_AT,
              METEOR.sides,
              METEOR.depth,
              METEOR.wobble,
              time * 0.15,
              METEOR.seed,
            ),
          );
          ctx.strokeStyle = rgba(PALETTE.ember, 0.5 * breath);
          ctx.lineWidth = r * RIM_WIDE;
          ctx.stroke(inner);
          ctx.strokeStyle = rgba(PALETTE.emberRim, 0.75 * breath);
          ctx.lineWidth = r * RIM_FINE;
          ctx.stroke(inner);
          // And the tongues that are near the limb, on the shipped pins and
          // the shipped turn. A blit would need the sprite this file has no
          // business owning, so they are drawn as their own foreshortened
          // lozenges — the tangent plane's own map, `scale(sx, sy)` about the
          // facet, exactly as `.claude/skills/depth` asks.
          for (let i = 0; i < PINS.length; i++) {
            const p = PINS[i];
            if (!p) continue;
            const f = facet(p, theta);
            if (!f.near) continue;
            const edge = Math.abs(f.sx);
            if (edge > LIMB) continue;
            const heat = flicker(i, time) * surfaceDim(EMBER_FLOOR, edge);
            ctx.save();
            ctx.translate(f.x * r, f.y * r);
            ctx.scale(Math.max(0.08, edge), f.sy);
            ctx.fillStyle = rgba(PALETTE.emberRim, 0.55 * heat);
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 0.26, r * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          ctx.globalAlpha = 1;
          ctx.restore();
        },
      },
    }),
  ],
};
