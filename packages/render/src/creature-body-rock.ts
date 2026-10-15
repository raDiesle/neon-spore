import { spanOf } from "@neon-spore/sim";
import type { Body } from "./creature-body-in.js";
import { drawGlancedBody } from "./creature-glance.js";
import { drawMeteor } from "./meteor.js";
import { rockRadius } from "./rock-size.js";
import { drawTorchStone, drawTorchStreak } from "./torch.js";

/**
 * **The three rock bodies**, cut out of `creature-body.ts` when THE COIL's
 * row took that file over its 250-line limit — along the seam
 * `creature-body-worn.ts` was cut on. All three are stone: the plain tiers,
 * the torch, and the coil, which is a torch that has not been let out yet.
 *
 * Each stone glances at a rock's size (`creature-glance.ts`); a torch's
 * streak stays flat behind it, since a trail is where the stone has been.
 */

/**
 * How far out, in rock radii, a turned stone's layer reaches: a BLAZE's
 * tallest flame stands 3.3 radii over the stone, and its smoke rises on above
 * it (`meteor-blaze.ts`). At 2.2, the halo's reach, the smoke was cut flat.
 */
export const STONE_REACH = 4;

/** A stone of `b`'s span, turning as a rock. */
const stone = (b: Body) =>
  ({ r: rockRadius(b.l, spanOf(b.c)), sort: "rock", reach: STONE_REACH }) as const;

/** The rock draw, and the only one a body gets from `isMeteorKind` alone. */
export function drawMeteorBody(b: Body): void {
  drawGlancedBody(b, stone(b), (ctx) => drawMeteor(ctx, b.l, b.c, b.x, b.y, b.time));
}

/**
 * A torch is a rock by `isMeteorKind` and has a body of its own regardless, so
 * it sits in the table where the table wins.
 */
export function drawTorchBody(b: Body): void {
  drawTorchStreak(b.ctx, b.l, b.c, b.x, b.y, b.tailFrom);
  drawGlancedBody(b, stone(b), (ctx) => drawTorchStone(ctx, b.l, b.c, b.x, b.y, b.time));
}

/**
 * THE COIL is the torch it will become, already burning inside its dome —
 * the owner's ask, so that the rock thrown out of a dome is seen to be the
 * thing that was in it and a dome reads as something to keep the plate away
 * from. The stone without the tail: a coil crosses and has no fall.
 */
export function drawCoilBody(b: Body): void {
  drawGlancedBody(b, stone(b), (ctx) => drawTorchStone(ctx, b.l, b.c, b.x, b.y, b.time));
}
