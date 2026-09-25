import type { SimConfig, SnakeState } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawSnakeEnemy, drawSnakePoint, drawSnakeRock } from "./snake-items.js";

/**
 * SNAKE's arena and everything standing in it.
 *
 * **The colours are the ship's, and that is the whole argument.** The obvious
 * palette for a snake is the arcade one — acid green head, cyan body, magenta
 * apple — and it is wrong here for two reasons. Green is spoken for: nothing in
 * this game is ever green except a Simon round answered in full (`palette.ts`),
 * and a body that is green for ninety seconds would spend that colour. And the
 * body *is the ship's*: it comes out of the hull's own mouth at the top of the
 * round, so it keeps the hull's violet at the head and the shield's cyan down
 * the length, which are the two colours the pair already owns. What is
 * collected is amber,
 * because amber is what this game has always meant by "take that in".
 *
 * **Two screens, one picture.** Both are shown the whole body and everything
 * standing in the arena. Until 25 September 2026 player 1 saw the food and
 * only the ends of the body and player 2 the body and no food, and the owner
 * asked for all of it to be seen by both. The split is in the hands: player 2
 * steers, player 1 shoots and eats, and neither can do the other's half.
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

/**
 * Where SNAKE's name sits when nothing is over it, in play heights — THE
 * PULSE's own height, so the two rounds open the same way. The job line and
 * the tally hang under it, and the arena's top under those.
 */
export const SNAKE_NAME_Y = 0.07;

/** From the name's baseline to the arena's top: the job line, the round's
 * clock and a breath of air, in pixels. */
export const SNAKE_HEADER = 46;

/**
 * The arena: the widest square-tile grid that fits between the header and the
 * hull, centred on the ship.
 *
 * **The ship is on the screen**, so the arena is the air above it — from the
 * foot of the header down to the hull's real surface (`hullY`), and as wide as
 * the field's columns — which is every pixel the round has once the hull and
 * the band have theirs. The owner asked for the arena to be widened to the
 * whole of the screen (18 September 2026); this is where it stopped growing.
 * It is centred on the field, so its middle column stands over the cannon's
 * socket when the cannon is over the middle of the hull, which is where the
 * body comes out (`snake-emerge.ts`).
 *
 * Square tiles and a whole number of them: a grid whose tiles were half a
 * pixel out is a grid a pair cannot count along, and counting along it is how
 * a tile gets said out loud. Its floor is the hull.
 */
export function snakeArena(l: Layout, cfg: SimConfig): Arena {
  const top = l.playHeight * SNAKE_NAME_Y + SNAKE_HEADER;
  const bottom = l.hullY;
  const tile = Math.max(1, Math.min(l.gridWidth / cfg.snakeCols, (bottom - top) / cfg.snakeRows));
  const w = tile * cfg.snakeCols;
  const h = tile * cfg.snakeRows;
  return {
    x: l.gridLeft + (l.gridWidth - w) / 2,
    y: bottom - h,
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
 * The grid the body walks, and the three walls that cost the hull.
 *
 * No floor and no box: the floor is the hull, drawn after everything in here,
 * and the walls are THE SCOUT's faintest line — both seats want to know where
 * they stand before the first crash, and neither is ever told which way the
 * body is about to leave. The dark plate and the ember frame the arena used
 * to stand in went with the owner's request that the round be played over
 * the ship, in the open, on the field's own background.
 */
export function drawArena(ctx: CanvasRenderingContext2D, arena: Arena): void {
  const w = arena.tile * arena.cols;
  const h = arena.tile * arena.rows;
  ctx.save();
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.45;
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

  ctx.globalAlpha = 0.75;
  ctx.lineWidth = Math.max(1, arena.tile * 0.04);
  ctx.beginPath();
  ctx.moveTo(arena.x + 0.5, arena.y + h);
  ctx.lineTo(arena.x + 0.5, arena.y + 0.5);
  ctx.lineTo(arena.x + w - 0.5, arena.y + 0.5);
  ctx.lineTo(arena.x + w - 0.5, arena.y + h);
  ctx.stroke();
  ctx.restore();
}

/**
 * What is standing in the arena: the enemies to be shot and the points to be
 * swallowed.
 *
 * Drawn on both screens. What each of them looks like is `snake-items.ts`, and the short of it is that neither is
 * a new shape: an enemy is a slick or a bulb and a point is a pod, borrowed
 * whole off the field so the seat with the trigger never has to be told which
 * is which.
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
    drawSnakeEnemy(ctx, arena, tile.col, tile.row, i, pulse);
  });
  round.points.forEach((tile, i) => {
    if (snake.taken.includes(i)) return;
    drawSnakePoint(ctx, arena, tile.col, tile.row, pulse);
  });
}

/**
 * The meteors, on both screens like everything else in the arena. A meteor
 * can be neither shot nor taken, so the only answer to it is the steering.
 * Drawn *under* the body: the
 * head goes over the top of one on the frame it hits it, which is the frame
 * the pair needs to see. What one looks like is `snake-items.ts`, with the
 * other two things that stand on a tile.
 */
export function drawSnakeRocks(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  snake: SnakeState,
): void {
  const round = snake.rounds[snake.round];
  if (!round) return;
  for (const tile of round.rocks) drawSnakeRock(ctx, arena, tile.col, tile.row);
}
