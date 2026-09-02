import type { SnakeState } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";
import { type Arena, arenaX, arenaY } from "./snake-draw.js";

/**
 * The body itself: the fold it arrives as, the length it becomes, and the two
 * ends that are all one of the two screens ever sees.
 *
 * Its own file rather than the tail of `snake-draw.ts`, and the seam is the
 * one the round is built on: that file is the *place* — the arena, its wall,
 * and what is standing in it to be collected — and this is the thing that
 * moves through it. It is also the half that is drawn differently on the two
 * screens, which is worth being able to read on its own.
 */

/**
 * The body, head first.
 *
 * The length is a single stroked path through the tile centres, because a
 * snake drawn as separate squares is a queue of boxes and this is one body:
 * the corners are where the eye reads it, and a `round` join is the only thing
 * that draws a corner. The fold that puts it there is the ship shrinking, and
 * that is `snake-morph.ts` — this file draws what is underneath it.
 *
 * `showBody` is the middle of it. Without it player 1 gets the two ends and
 * nothing between them, which is exactly what they are meant to have: a pair
 * of landmarks to steer between and no idea what is strung across.
 */
export function drawSnakeBody(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  snake: SnakeState,
  showBody: boolean,
  mawOpen = false,
): void {
  if (showBody) drawLength(ctx, arena, snake);
  else drawEnds(ctx, arena, snake);
  const head = snake.body[0];
  if (!head) return;
  if (mawOpen) drawMouth(ctx, arena, head.col, head.row, snake.dirCol, snake.dirRow);
  else drawEyes(ctx, arena, head.col, head.row, snake.dirCol, snake.dirRow);
}

/**
 * The mouth, open. It replaces the eyes rather than joining them, which is the
 * cheapest way for a shape the size of a tile to say one thing at a time: a
 * head with a hole in the front of it is open, and a head with two dots is
 * not. Drawn on both screens — player 2 cannot see the point they are about to
 * drive over, but they can see whether the mouth was opened for it.
 */
function drawMouth(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  col: number,
  row: number,
  dirCol: number,
  dirRow: number,
): void {
  const cx = arenaX(arena, col) + arena.tile / 2;
  const cy = arenaY(arena, row) + arena.tile / 2;
  const out = arena.tile * 0.34;
  const side = arena.tile * 0.22;
  // A wedge from the middle of the head out to its leading edge.
  const tipX = cx + dirCol * out;
  const tipY = cy + dirRow * out;
  ctx.fillStyle = PALETTE.pod;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(tipX + dirRow * side, tipY + dirCol * side);
  ctx.lineTo(tipX - dirRow * side, tipY - dirCol * side);
  ctx.closePath();
  ctx.fill();
}

/** The centre of a tile, which is what the body's path is drawn through. */
function centre(arena: Arena, col: number, row: number): { x: number; y: number } {
  return { x: arenaX(arena, col) + arena.tile / 2, y: arenaY(arena, row) + arena.tile / 2 };
}

/**
 * The whole length, as one path. Cyan for the body and the hull's violet for
 * the head — the ship taken apart into the two colours the pair already steer
 * with, rather than the arcade green this game has spent elsewhere.
 */
function drawLength(ctx: CanvasRenderingContext2D, arena: Arena, snake: SnakeState): void {
  const width = arena.tile * 0.72;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  for (const [i, tile] of snake.body.entries()) {
    const p = centre(arena, tile.col, tile.row);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.strokeStyle = PALETTE.shield;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.strokeStyle = "#0C2C39";
  ctx.lineWidth = Math.max(1, width - 4);
  ctx.stroke();
  ctx.lineJoin = "miter";
  ctx.lineCap = "butt";
  drawCap(ctx, arena, snake.body[0], 0.78, true);
  if (snake.body.length > 1) drawCap(ctx, arena, snake.body[snake.body.length - 1], 0.5, false);
}

/**
 * The two ends and nothing between them — player 1's whole picture of the
 * body. The tail is smaller than the head, because the one thing they have to
 * be able to say about it is which end it is.
 */
function drawEnds(ctx: CanvasRenderingContext2D, arena: Arena, snake: SnakeState): void {
  drawCap(ctx, arena, snake.body[0], 0.78, true);
  if (snake.body.length > 1) drawCap(ctx, arena, snake.body[snake.body.length - 1], 0.5, false);
}

/** One end, squared off in its tile. */
function drawCap(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  tile: SnakeState["body"][number] | undefined,
  share: number,
  head: boolean,
): void {
  if (!tile) return;
  const size = arena.tile * share;
  const p = centre(arena, tile.col, tile.row);
  ctx.fillStyle = head ? "#2A1150" : "#0C2C39";
  ctx.strokeStyle = head ? PALETTE.hull : PALETTE.shield;
  ctx.lineWidth = 2;
  roundRect(ctx, p.x - size / 2, p.y - size / 2, size, size, size * 0.3);
  ctx.fill();
  ctx.stroke();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Which way it is going, said by the only part of it that has a face. */
function drawEyes(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  col: number,
  row: number,
  dirCol: number,
  dirRow: number,
): void {
  const cx = arenaX(arena, col) + arena.tile / 2;
  const cy = arenaY(arena, row) + arena.tile / 2;
  const out = arena.tile * 0.2;
  const side = arena.tile * 0.17;
  ctx.fillStyle = PALETTE.hullRim;
  for (const sign of [-1, 1]) {
    const x = cx + dirCol * out + (dirCol === 0 ? sign * side : 0);
    const y = cy + dirRow * out + (dirRow === 0 ? sign * side : 0);
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1, arena.tile * 0.08), 0, Math.PI * 2);
    ctx.fill();
  }
}
