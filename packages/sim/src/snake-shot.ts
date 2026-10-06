import type { SnakeState } from "./snake.js";
import { snakeEnemyAt, snakeOccupies, snakeOnBoard, snakeRockAt } from "./snake-arena.js";
import type { World } from "./world.js";

/**
 * A shot, straight out of the head along the way it is pointing.
 *
 * Hit-scan and not a travelling bullet, and the reason is the sentence rather
 * than the arithmetic: the head *is* the gun, so what player 1 is answering is
 * "it is lined up now", and a shot that took a few tiles to arrive would be
 * answering where the body was when they pressed. It stops at the first
 * standing enemy, its own body or the wall, whichever comes first.
 *
 * **And it is short.** `snakeShotTiles` is the whole of its reach, counted
 * from the tile in front of the head. A spit that carried the arena made the
 * steering irrelevant to the trigger; one that carries ten small tiles, five
 * of the old big ones, still makes "bring me to it" the sentence the pair
 * says most.
 *
 * Returns whether it found something, and leaves where it stopped on the state
 * for the picture to draw.
 */
export function fireSnake(world: World, snake: SnakeState): boolean {
  const stop = snakeShotStop(world, snake);
  if (stop === null) return false;
  snake.shotBeat = world.beat;
  snake.shotCol = stop.col;
  snake.shotRow = stop.row;
  snake.shotHit = stop.enemy !== -1;
  if (stop.enemy === -1) return false;
  snake.struck.push(stop.enemy);
  return true;
}

/**
 * **Where a shot taken this instant would stop, and what it would find** —
 * the walk on its own, with nothing written back.
 *
 * Lifted out of `fireSnake` on 18 September 2026 so the field could say
 * `FIRE` on an enemy that is actually reachable (`render/boss-cue-read-g.ts`).
 * A cue that walked the reach a second time would be a second copy of the one
 * rule that decides whether the pair is close enough yet, and the two copies
 * would disagree the first time a meteor moved — the shot stops at the first
 * standing enemy, its own body, a meteor or the wall, and which of those it
 * met is the whole of what player 1 learns.
 *
 * `null` only where there is no head to spit out of.
 */
export function snakeShotStop(
  world: World,
  snake: SnakeState,
): { col: number; row: number; enemy: number } | null {
  const head = snake.body[0];
  if (!head) return null;
  let col = head.col;
  let row = head.row;
  for (let reach = 0; reach < world.cfg.snakeShotTiles; reach++) {
    col += snake.dirCol;
    row += snake.dirRow;
    if (!snakeOnBoard(world, col, row)) {
      return { col: col - snake.dirCol, row: row - snake.dirRow, enemy: -1 };
    }
    const enemy = snakeEnemyAt(snake, col, row);
    if (enemy !== -1) return { col, row, enemy };
    // A meteor stops the shot and takes nothing from it. That is the whole of
    // what makes one worth *placing*: it is a wall between the trigger and its
    // target, and the only answer to it is the steering.
    if (snakeRockAt(snake, col, row) || snakeOccupies(snake, col, row)) {
      return { col, row, enemy: -1 };
    }
  }
  // Nothing inside the reach. The spit still lands, and where it lands is the
  // whole of what player 1 learns: the picture draws it stopping in mid-air,
  // which is the pair being told they are not close enough yet.
  return { col, row, enemy: -1 };
}
