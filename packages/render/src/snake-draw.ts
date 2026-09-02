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
 * What there is to eat. Drawn only on the screen that is allowed to see it —
 * and the orb pulses, because the thing player 1 has to say about it is that
 * it is going.
 */
export function drawSnakeItems(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  snake: SnakeState,
  pulse: number,
): void {
  if (snake.pelletCol >= 0) {
    const x = arenaX(arena, snake.pelletCol) + arena.tile / 2;
    const y = arenaY(arena, snake.pelletRow) + arena.tile / 2;
    ctx.fillStyle = PALETTE.podDark;
    ctx.strokeStyle = PALETTE.pod;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, arena.tile * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PALETTE.podRim;
    ctx.beginPath();
    ctx.arc(x, y, arena.tile * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  if (snake.orbCol < 0) return;
  const x = arenaX(arena, snake.orbCol) + arena.tile / 2;
  const y = arenaY(arena, snake.orbRow) + arena.tile / 2;
  const r = arena.tile * (0.24 + 0.08 * pulse);
  ctx.fillStyle = "#2A1204";
  ctx.strokeStyle = PALETTE.ember;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
