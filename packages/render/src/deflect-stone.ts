import { crystalPath, METEOR } from "@neon-spore/content";
import { PALETTE } from "./palette.js";
import { drawEmberRing } from "./torch-ember.js";

/**
 * The torch, bounced: the grey stone and its ember ring, drawn at the origin
 * of a context `deflect.ts` has already placed, squashed and spun. Every
 * other rock bounces in the look it fell in (`drawRockBody`); this is the one
 * body that never had one, and it is unchanged from the day the bounce was
 * written — split out only so `deflect.ts` stays on its line.
 */
export function drawBouncedStone(ctx: CanvasRenderingContext2D, r: number, ember: boolean): void {
  // The flame first, under the stone, exactly as `drawTorchRock` lays it: a
  // ring just outside the outline rather than a glow over it, so the rock's
  // own contour is still the edge the eye reads.
  if (ember) drawEmberRing(ctx, r, 0);
  const path = new Path2D(
    crystalPath(0, 0, r, r, METEOR.sides, METEOR.depth, METEOR.wobble, 0, METEOR.seed),
  );
  const rg = ctx.createLinearGradient(-r, -r, r, r);
  rg.addColorStop(0, "#9DA3B0");
  rg.addColorStop(0.55, "#6B707E");
  rg.addColorStop(1, PALETTE.rockDark);
  ctx.fillStyle = rg;
  ctx.fill(path);
  ctx.strokeStyle = PALETTE.shieldRim;
  ctx.lineWidth = 1.8;
  ctx.stroke(path);
}
