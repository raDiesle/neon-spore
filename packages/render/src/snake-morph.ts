import { hullPercent, midCol, type SnakeState } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { drawHull } from "./hull.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { type Arena, arenaX, arenaY } from "./snake-draw.js";

/** Where the second movement starts. The first is the squeeze, on the spot. */
const HANDOVER = 0.45;

/**
 * How much of the body is drawn under the ship, and how far along its own
 * length: 0 until the squeeze is done, then out to the tail.
 *
 * The body is *extruded* rather than faded in — it grows backwards from the
 * head — which is the difference between two pictures crossfading and one
 * shape turning into another.
 */
export function morphBodyGrowth(morph01: number): number {
  return Math.max(0, Math.min(1, (morph01 - HANDOVER) / (1 - HANDOVER)));
}

export function drawSnakeMorph(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  arena: Arena,
  view: ViewState,
  snake: SnakeState,
  morph01: number,
): void {
  const head = snake.body[0];
  if (!head) return;
  const squeeze = smoothstep(Math.min(1, morph01 / HANDOVER));
  const carry = smoothstep(morphBodyGrowth(morph01));

  const fromX = l.gridLeft + l.gridWidth / 2;
  const fromY = l.hullY;
  const toX = arenaX(arena, head.col) + arena.tile / 2;
  const toY = arenaY(arena, head.row) + arena.tile / 2;

  // The two movements, as two scales. Across, the ship pulls in to a tile's
  // width; along, it keeps more of itself for longer, so what is left in the
  // middle of the fold is upright rather than flat — a body rather than a hull.
  const narrow = arena.tile / Math.max(1, l.gridWidth);
  const sx = 1 + (narrow - 1) * (squeeze * 0.7 + carry * 0.3);
  const sy = 1 + (narrow * 2.2 - 1) * carry;

  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - carry * carry);
  ctx.translate(fromX + (toX - fromX) * carry, fromY + (toY - fromY) * carry);
  ctx.scale(sx, Math.max(0.02, sy));
  ctx.translate(-fromX, -fromY);
  drawHull(
    ctx,
    l,
    view.world.scars,
    view.time,
    { armed: 0, intake: 0, chew: 0, charge: 0 },
    hullPercent(view.world),
    // Both lobes in the middle, still: the round put them there when it
    // started (`startWave`), and a ship folding up is not a ship being flown.
    { cannon: mid(view), shield: [{ col: mid(view), weight: 1, halfMul: 1 }] },
  );
  ctx.restore();

  drawSpark(ctx, arena, toX, toY, squeeze, carry);
}

/**
 * The seam the change happens at: a ring on the head's tile that tightens as
 * the ship arrives and is gone by the time the body is whole.
 *
 * It is there because a shape that only shrinks reads as a shape going away.
 * Something has to say *here*, and the cheapest thing that says it is a mark
 * on the tile the ship is turning into.
 */
function drawSpark(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  x: number,
  y: number,
  squeeze: number,
  carry: number,
): void {
  const show = Math.min(1, squeeze) * (1 - carry);
  if (show <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = show;
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, arena.tile * (0.9 - 0.35 * carry), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function mid(view: ViewState): number {
  return midCol(view.world.cfg);
}
