import type { SimConfig } from "./config.js";
import { type SnakeState, type SnakeTile, snakeCurrent } from "./snake.js";
import { snakeOpenRound } from "./snake-open.js";
import type { World } from "./world.js";

/**
 * **Going home**: what the body does between a cleared arena and the next.
 *
 * The owner asked for it on 25 September 2026: once every enemy is down and
 * every point is swallowed, the snake goes back into the ship through the
 * mouth it came out of, and the mouth opens for it. The next arena opens with
 * the body coming out again, so every round starts on the same picture.
 *
 * **The mouth is one tile, and it is a gate in the floor.** The floor of the
 * arena is the hull, and it is a wall like the other three everywhere but
 * one place: the tile under the middle column, just past the bottom row, and
 * only once the arena is clear. Player 2 still steers the body there. A body
 * that misses it hits the floor, which is a crash like any other.
 *
 * **Past the gate nothing is steered.** The head goes straight down into the
 * ship, a turn is dropped, and the body follows on a quicker step
 * (`snakeHomeStepTicks`). Every tile below the arena is inside the ship, and
 * nothing inside the ship can be hit. The round's clock stopped when the arena
 * was cleared (`clearBeat`), so the way home costs only the steering.
 */

/** The tile the mouth is: under the middle column, one row past the floor. */
export function snakeGate(cfg: SimConfig): SnakeTile {
  return { col: Math.floor(cfg.snakeCols / 2), row: cfg.snakeRows };
}

/** Whether a tile is below the arena's floor, which is to say inside the ship. */
export function snakeInside(cfg: SimConfig, tile: SnakeTile): boolean {
  return tile.row >= cfg.snakeRows;
}

/** Whether the arena is clear and the body is on its way home. */
export function snakeGoingHome(snake: SnakeState): boolean {
  return snake.clearBeat >= 0;
}

/** Whether the head may enter this tile because it is the open mouth. */
export function snakeAtGate(cfg: SimConfig, snake: SnakeState, col: number, row: number): boolean {
  if (!snakeGoingHome(snake)) return false;
  const gate = snakeGate(cfg);
  return col === gate.col && row === gate.row;
}

/**
 * The next round, or the end of them, once the body is home.
 *
 * The body starts over with it, because the arena does: a round is a placed
 * map and the pair has to be able to read it from the same square every time.
 * It comes out of the ship again, so the round goes back to `morph` and the
 * emergence plays as it did the first time.
 */
export function snakeCameHome(world: World, snake: SnakeState): boolean | null {
  if (snake.round >= snake.rounds.length - 1) return true;
  snakeOpenRound(world, snake, snake.round + 1);
  snake.phase = "morph";
  snake.phaseBeat = world.beat;
  return null;
}

/** Whether the whole body is inside the ship, which is the round won. */
export function snakeHome(cfg: SimConfig, snake: SnakeState): boolean {
  if (!snakeGoingHome(snake) || snake.body.length === 0) return false;
  return snake.body.every((tile) => snakeInside(cfg, tile));
}

/**
 * Ticks between two steps this tick: the round's own, or the quicker one once
 * the head is through the mouth. One function, because the step and the
 * picture's slide between two tiles must agree on it (`render/snake-body.ts`).
 */
export function snakeStepTicks(cfg: SimConfig, snake: SnakeState): number {
  const head = snake.body[0];
  if (head !== undefined && snakeInside(cfg, head)) return cfg.snakeHomeStepTicks;
  return snakeCurrent(snake).stepTicks;
}

/**
 * The head onto a tile with nothing to check: the tail comes off it unless a
 * point is still being paid out. The last line of every step that lands.
 */
export function creep(snake: SnakeState, col: number, row: number): null {
  snake.body.unshift({ col, row });
  if (snake.grow > 0) snake.grow -= 1;
  else snake.body.pop();
  return null;
}

/** One step inside the ship: straight down, whatever the thumbs are doing. */
export function creepHome(snake: SnakeState, head: SnakeTile): null {
  snake.dirCol = 0;
  snake.dirRow = 1;
  snake.turn = 0;
  return creep(snake, head.col, head.row + 1);
}
