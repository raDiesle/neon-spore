import type { Body } from "./creature-body-in.js";
import { drawMeteor } from "./meteor.js";
import { drawTorch, drawTorchStone } from "./torch.js";

/**
 * **The three rock bodies**, cut out of `creature-body.ts` when THE COIL's
 * row took that file over its 250-line limit — along the seam
 * `creature-body-worn.ts` was cut on. All three are stone: the plain tiers,
 * the torch, and the coil, which is a torch that has not been let out yet.
 */

/** The rock draw, and the only one a body gets from `isMeteorKind` alone. */
export function drawMeteorBody({ ctx, l, c, x, y, time }: Body): void {
  drawMeteor(ctx, l, c, x, y, time);
}

/**
 * A torch is a rock by `isMeteorKind` and has a body of its own regardless, so
 * it sits in the table where the table wins.
 */
export function drawTorchBody({ ctx, l, c, x, y, time, tailFrom }: Body): void {
  drawTorch(ctx, l, c, x, y, time, tailFrom);
}

/**
 * THE COIL is the torch it will become, already burning inside its dome —
 * the owner's ask, so that the rock thrown out of a dome is seen to be the
 * thing that was in it and a dome reads as something to keep the plate away
 * from. The stone without the tail: a coil crosses and has no fall.
 */
export function drawCoilBody({ ctx, l, c, x, y, time }: Body): void {
  drawTorchStone(ctx, l, c, x, y, time);
}
