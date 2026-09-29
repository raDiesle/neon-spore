import { LIGHT_HALF } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { plumbBallPath, plumbBallR, plumbChainPath } from "./plumb-shape.js";

/**
 * THE PLUMB's two weights, one at a time: out of `plumb-draw.ts` when row
 * 11's bleed came to run down their chains (`plumb-bleed-light.ts`).
 */

/** One chain and its ball, `size` times its own. A locked ball's rim is lit glass; a loosed one's chain is gone. */
export function drawPlumbWeight(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  end: { x: number; y: number },
  at: { x: number; y: number },
  size: number,
  locked: boolean,
  loosed: boolean,
): void {
  if (!loosed) {
    ctx.lineWidth = STROKE.inner * 0.8;
    ctx.strokeStyle = rgba(PALETTE.plumbBronze, 0.85);
    ctx.stroke(plumbChainPath(l, end, at));
  }
  const r = plumbBallR(l, side);
  const ball = plumbBallPath(l, side);
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.scale(size, size);
  ctx.fillStyle = rgba(PALETTE.plumbBronzeDark, 0.95);
  ctx.fill(ball);
  ctx.save();
  ctx.clip(ball);
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock);
  ctx.restore();
  ctx.lineWidth = STROKE.outline / size;
  ctx.strokeStyle = rgba(locked ? PALETTE.plumbGlass : PALETTE.plumbBronze, 0.95);
  ctx.stroke(ball);
  ctx.restore();
}
