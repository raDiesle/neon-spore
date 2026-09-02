import type { SimConfig, SnakeState } from "@neon-spore/sim";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * SNAKE's arena and everything standing in it.
 *
 * **The colours are the ship's, and that is the whole argument.** The obvious
 * palette for a snake is the arcade one — acid green head, cyan body, magenta
 * apple — and it is wrong here for two reasons. Green is spoken for: nothing in
 * this game is ever green except a Simon round answered in full (`palette.ts`),
 * and a body that is green for ninety seconds would spend that colour. And the
 * body *is the ship*: it folds out of the hull at the top of the round, so it
 * keeps the hull's violet at the head and the shield's cyan down the length,
 * which are the two colours the pair already owns. What is collected is amber,
 * because amber is what this game has always meant by "take that in".
 *
 * **Two screens, two pictures.** Player 1 is shown the food and both ends of
 * the body; player 2 is shown the whole body and no food. So neither seat can
 * play a corner alone even in the frame, and the two verbs follow the two
 * halves — the flip is player 1's because the tail is theirs to see, the brake
 * is player 2's because the body about to be hit is.
 *
 * Stateless, like every other draw here: everything is read off the world, so
 * nothing outlives a frame and `Effects.reset` has nothing of it to clear.
 */

/** Where the arena is on the stage, and how big a tile of it is. */
export interface Arena {
  x: number;
  y: number;
  tile: number;
  cols: number;
  rows: number;
}

/** Player 1 is the one who can see what there is to eat. */
export const showsSnakeFood = (role: ViewRole): boolean => role !== "p2";
/** Player 2 is the one who can see the body between its two ends. */
export const showsSnakeBody = (role: ViewRole): boolean => role !== "p1";

/**
 * The arena, centred in the play half. Square tiles and a whole number of
 * them: a grid whose tiles were half a pixel out is a grid a pair cannot count
 * along, and counting along it is how a tile gets said out loud.
 */
export function snakeArena(l: Layout, cfg: SimConfig): Arena {
  const tile = Math.max(
    1,
    Math.min((l.width * 0.92) / cfg.snakeCols, (l.playHeight * 0.66) / cfg.snakeRows),
  );
  const w = tile * cfg.snakeCols;
  const h = tile * cfg.snakeRows;
  return {
    x: (l.width - w) / 2,
    y: l.playHeight * 0.56 - h / 2,
    tile,
    cols: cfg.snakeCols,
    rows: cfg.snakeRows,
  };
}

export function arenaX(arena: Arena, col: number): number {
  return arena.x + col * arena.tile;
}

export function arenaY(arena: Arena, row: number): number {
  return arena.y + row * arena.tile;
}

/**
 * The floor and the wall around it. The wall is drawn as a wall rather than as
 * an absence, because it is the one thing in here that costs the hull and
 * neither seat is ever told which way the body is about to leave.
 */
export function drawArena(ctx: CanvasRenderingContext2D, arena: Arena): void {
  const w = arena.tile * arena.cols;
  const h = arena.tile * arena.rows;
  ctx.fillStyle = "#0B0820";
  ctx.fillRect(arena.x, arena.y, w, h);

  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let c = 1; c < arena.cols; c++) {
    ctx.moveTo(Math.round(arenaX(arena, c)) + 0.5, arena.y);
    ctx.lineTo(Math.round(arenaX(arena, c)) + 0.5, arena.y + h);
  }
  for (let r = 1; r < arena.rows; r++) {
    ctx.moveTo(arena.x, Math.round(arenaY(arena, r)) + 0.5);
    ctx.lineTo(arena.x + w, Math.round(arenaY(arena, r)) + 0.5);
  }
  ctx.stroke();

  ctx.strokeStyle = PALETTE.ember;
  ctx.lineWidth = 2;
  ctx.strokeRect(arena.x - 1, arena.y - 1, w + 2, h + 2);
}

/**
 * What is standing in the arena: the enemies to be shot and the points to be
 * swallowed.
 *
 * Drawn only on the screen that is allowed to see them, which is player 1's —
 * the seat that can shoot and open the mouth and cannot steer. Both are hard
 * shapes rather than blobs, because a round is machinery where the field is
 * bodies (`docs/spec/interludes.md`): an enemy is a barbed square in the ember
 * this game already spends on damage, and a point is the amber ring it already
 * spends on "take that in".
 */
export function drawSnakeItems(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  snake: SnakeState,
  pulse: number,
): void {
  const round = snake.rounds[snake.round];
  if (!round) return;
  round.enemies.forEach((tile, i) => {
    if (snake.struck.includes(i)) return;
    drawEnemy(ctx, arena, tile.col, tile.row);
  });
  round.points.forEach((tile, i) => {
    if (snake.taken.includes(i)) return;
    drawPoint(ctx, arena, tile.col, tile.row, pulse);
  });
}

/** One enemy: a square with its sides bitten in, which nothing else here is. */
function drawEnemy(ctx: CanvasRenderingContext2D, arena: Arena, col: number, row: number): void {
  const x = arenaX(arena, col) + arena.tile / 2;
  const y = arenaY(arena, row) + arena.tile / 2;
  const r = arena.tile * 0.3;
  ctx.fillStyle = "#2A0F04";
  ctx.strokeStyle = PALETTE.ember;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - r, y - r);
  ctx.lineTo(x, y - r * 0.55);
  ctx.lineTo(x + r, y - r);
  ctx.lineTo(x + r * 0.55, y);
  ctx.lineTo(x + r, y + r);
  ctx.lineTo(x, y + r * 0.55);
  ctx.lineTo(x - r, y + r);
  ctx.lineTo(x - r * 0.55, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/** One point: an amber ring that breathes, so it reads as a thing to be taken. */
function drawPoint(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  col: number,
  row: number,
  pulse: number,
): void {
  const x = arenaX(arena, col) + arena.tile / 2;
  const y = arenaY(arena, row) + arena.tile / 2;
  const r = arena.tile * (0.24 + 0.04 * pulse);
  ctx.fillStyle = PALETTE.podDark;
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(x, y, arena.tile * 0.09, 0, Math.PI * 2);
  ctx.fill();
}

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
