import { nextInt } from "./rng.js";
import { type SnakeState, type SnakeTile, snakeOccupies } from "./snake.js";
import type { World } from "./world.js";

/**
 * What is standing in the arena to be collected, and where it lands.
 *
 * Its own file rather than the tail of `snake.ts` because it is the one part
 * of the round that draws from the rng, and that is worth being able to read
 * on its own. What stays random is what one player knows and the other does
 * not (`docs/spec/structure.md` 7.3) — and in this round only player 1 is
 * shown either of these, so a pellet is the thing the pair has to say out loud
 * before it can be reached. A fixed one would be a pellet the pair memorised
 * on the third playthrough, and then nobody has to say anything.
 *
 * Two kinds, and the difference between them is time rather than points. A
 * **pellet** stands until it is eaten, grows the body and is worth one; an
 * **orb** appears every so often, is worth three and leaves on its own. So the
 * pair is choosing between the sure thing and the one that expires — out loud,
 * because only one of them can see either.
 */

/** A pellet is never dropped this close to the head. */
const PELLET_REACH = 3;

/**
 * A new pellet, from the seeded rng, and never within reach of the head.
 *
 * That last clause is the rule THE GAUGE draws its band under: a pellet that
 * landed in front of the head is a point the pair got without saying anything,
 * and the saying is the round. Where the free tiles run out — a body filling
 * the arena — the reach is dropped rather than the pellet.
 */
export function dropPellet(world: World, snake: SnakeState): void {
  const tile = freeTile(world, snake);
  if (!tile) return;
  snake.pelletCol = tile.col;
  snake.pelletRow = tile.row;
}

/** An orb, worth more and gone in a few beats. */
export function dropOrb(world: World, snake: SnakeState): void {
  const tile = freeTile(world, snake);
  if (!tile) return;
  snake.orbCol = tile.col;
  snake.orbRow = tile.row;
  snake.orbBeat = world.beat;
}

/** Eaten, or expired. Both leave the same nothing behind, on the same clock. */
export function clearOrb(world: World, snake: SnakeState): void {
  snake.orbCol = -1;
  snake.orbRow = -1;
  snake.orbBeat = world.beat;
}

/**
 * A tile with nothing on it, preferring one at least `PELLET_REACH` tiles from
 * the head. One pass over the arena and one draw from the rng: at nine by
 * eleven that is a hundred cells, which is nothing — and it is the only shape
 * of this that cannot loop forever on a nearly full arena.
 */
function freeTile(world: World, snake: SnakeState): SnakeTile | null {
  const cfg = world.cfg;
  const head = snake.body[0];
  const free: SnakeTile[] = [];
  const far: SnakeTile[] = [];
  for (let row = 0; row < cfg.snakeRows; row++) {
    for (let col = 0; col < cfg.snakeCols; col++) {
      if (snakeOccupies(snake, col, row)) continue;
      if (col === snake.pelletCol && row === snake.pelletRow) continue;
      if (col === snake.orbCol && row === snake.orbRow) continue;
      free.push({ col, row });
      if (!head) continue;
      const away = Math.abs(head.col - col) + Math.abs(head.row - row);
      if (away >= PELLET_REACH) far.push({ col, row });
    }
  }
  const pool = far.length > 0 ? far : free;
  if (pool.length === 0) return null;
  return pool[nextInt(world.rng, pool.length)] ?? null;
}
