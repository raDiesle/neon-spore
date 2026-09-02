import { type SnakeState, snakeCurrent } from "./snake.js";
import type { World } from "./world.js";

/**
 * What is standing on a tile, and whether a tile is a tile at all.
 *
 * Its own file rather than the tail of `snake.ts`, and the seam is the one the
 * round is built on: next door is what the round *is* — a body, a heading, two
 * lists of what has been spent — and this is every question asked *about* the
 * arena while it is being played. `snake-move.ts` asks all of them once a
 * step, `snake-controls.ts` asks one of them on a press, and the picture asks
 * two more; keeping them together is what stops each of those growing its own
 * copy of "is this tile taken".
 */

/** Which standing enemy is on this tile, or -1. */
export function snakeEnemyAt(snake: SnakeState, col: number, row: number): number {
  const enemies = snakeCurrent(snake).enemies;
  for (let i = 0; i < enemies.length; i++) {
    const at = enemies[i];
    if (at && at.col === col && at.row === row && !snake.struck.includes(i)) return i;
  }
  return -1;
}

/** Which standing point is on this tile, or -1. */
export function snakePointAt(snake: SnakeState, col: number, row: number): number {
  const points = snakeCurrent(snake).points;
  for (let i = 0; i < points.length; i++) {
    const at = points[i];
    if (at && at.col === col && at.row === row && !snake.taken.includes(i)) return i;
  }
  return -1;
}

/** Whether the mouth is open on this tick. Player 1's whole timing problem. */
export function snakeMawOpen(world: World, snake: SnakeState): boolean {
  return world.tick - snake.mawTick < world.cfg.snakeMawTicks;
}

/** Whether the arena is clear: every enemy down and every point swallowed. */
export function snakeCleared(snake: SnakeState): boolean {
  const round = snakeCurrent(snake);
  return snake.struck.length >= round.enemies.length && snake.taken.length >= round.points.length;
}

/**
 * Whether the body is on this tile. `spareTail` is the one tile that is about
 * to be vacated: the tail moves off it on the same step the head moves onto
 * it, so a body going round its own end is a corner and not a bite.
 */
export function snakeOccupies(
  snake: SnakeState,
  col: number,
  row: number,
  spareTail = false,
): boolean {
  const last = snake.body.length - 1;
  for (let i = 0; i < snake.body.length; i++) {
    if (spareTail && i === last) continue;
    const tile = snake.body[i];
    if (tile && tile.col === col && tile.row === row) return true;
  }
  return false;
}

/** Whether this tile is inside the arena at all. */
export function snakeOnBoard(world: World, col: number, row: number): boolean {
  return col >= 0 && row >= 0 && col < world.cfg.snakeCols && row < world.cfg.snakeRows;
}
