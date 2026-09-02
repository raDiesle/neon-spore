import type { SnakeState } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";
import { type Arena, arenaX, arenaY } from "./snake-draw.js";

/**
 * The shot: the one thing in this round both screens see the same way.
 *
 * Its own file because it is the only *event* the picture has — everything
 * next door is a thing standing on a tile, and this is a thing that happened
 * on a beat and is on its way out. It keeps no state to say so: the world
 * carries the beat the shot left on and where it stopped, so the fade is one
 * number against another and a restart cannot leave a beam hanging.
 */

/**
 * The shot, for the beat after it was taken: a line out of the head to
 * wherever it stopped, and a ring on the tile if it found something.
 *
 * Drawn on **both** screens, and it is the one thing in this round they see
 * the same way. Player 2 cannot see what was hit and has to be told; what they
 * can see is that the trigger was pulled, which is how they know the sentence
 * they just said was heard.
 */
export function drawSnakeShot(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  snake: SnakeState,
  fade: number,
): void {
  const head = snake.body[0];
  if (!head || snake.shotCol < 0) return;
  const fromX = arenaX(arena, head.col) + arena.tile / 2;
  const fromY = arenaY(arena, head.row) + arena.tile / 2;
  const toX = arenaX(arena, snake.shotCol) + arena.tile / 2;
  const toY = arenaY(arena, snake.shotRow) + arena.tile / 2;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, fade));
  ctx.strokeStyle = snake.shotHit ? PALETTE.hullRim : PALETTE.dim;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  if (snake.shotHit) {
    ctx.strokeStyle = PALETTE.ember;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(toX, toY, arena.tile * 0.36, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.lineCap = "butt";
}
