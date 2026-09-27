import * as look from "../../../../../packages/render/src/ratchet-draw.js";
import { ratchetStep, ratchetX } from "../../../../../packages/render/src/ratchet-shape.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 27 September 2026, from the queue's "THE RATCHET's spent
 * plates have no secondary motion of their own". Nothing on the rack moves by
 * itself: `time` reaches only the hurt shake, because the rack is a machine
 * on purpose. A spent plate is already drawn slack, though, and here a slack
 * plate hangs from its top edge and sways a few degrees on a slow period
 * of its own, each plate out of step with the next. The teeth still below the
 * pawl stay rigid, so the rack tells spent from left by motion as well as by
 * weight.
 *
 * The shipped plate is drawn under the turn and not copied, so the only
 * difference is the swing.
 */
/** How far a slack plate swings each way, in radians — about three and a
 * half degrees. Two was a pixel at the foot of the plate and read as nothing
 * (checked 27 September 2026). */
const SWAY = 0.06;
/** Its rate in radians a second, off the contour's 0.9, 0.53 and 0.31. */
const SWAY_RATE = 0.83;
/** How far each plate's swing is out of step with the one above it. */
const PLATE_PHASE = 1.9;

const swayingPlate: look.RatchetPlatePaint = (ctx, l, world, i, top, spent, hurt, time) => {
  if (!spent) {
    look.drawPlate(ctx, l, world, i, top, spent, hurt);
    return;
  }
  const x = ratchetX(l, world.cfg);
  const y = top + i * ratchetStep(l);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(SWAY * Math.sin(time * SWAY_RATE + i * PLATE_PHASE));
  ctx.translate(-x, -y);
  look.drawPlate(ctx, l, world, i, top, spent, hurt);
  ctx.restore();
};

export const RATCHET_PLATE_SWAY: Variant = {
  slot: "ratchet:plate",
  name: "sway",
  sentence:
    "sway — each spent plate above THE RATCHET's pawl hangs from its top edge and swings a few degrees on its own slow period, while the teeth still left stay rigid",
  dir: "tools/versus/candidates/ratchet-plate/sway",
  patches: [
    patch({
      target: look.RATCHET_PLATE,
      reached: () => look.RATCHET_PLATE,
      where: {
        file: "packages/render/src/ratchet-draw.ts",
        symbol: "RATCHET_PLATE",
        type: "{ paint: RatchetPlatePaint }",
      },
      fields: { paint: swayingPlate },
    }),
  ],
};
