import type { SnakeState } from "@neon-spore/sim";
import { type Arena, arenaX, arenaY } from "./snake-draw.js";
import { drawSnakeHead } from "./snake-head.js";
import { drawJointRibbon } from "./snake-ribbon.js";

/**
 * The body: where it is *between* two tiles, and what it looks like.
 *
 * **It slides.** The simulation stores whole tiles and steps between them on a
 * tick, which is right and is not what a player should see: a body that jumped
 * a tile every half second read as a thing stuttering rather than a thing
 * moving. So the drawing carries an offset — how far through the current step
 * the world is — and every segment is drawn between where it is and where the
 * segment ahead of it is. Nothing about that is stored and nothing is guessed:
 * `world.tick` against the round's own `stepTick` is the whole of it, so two
 * devices draw the same body on the same tick and `Effects.reset` has nothing
 * to clear.
 *
 * **It tapers.** The owner asked for a snake rather than a tube, so the width
 * falls from behind the head to the tail and the spine carries a row of
 * markings — the two things that read as *snake* at tile size. The colours
 * stay the ship's violet and cyan: the body is the ship, and green is spent
 * elsewhere (`palette.ts`).
 *
 * **And it crawls.** The owner asked for the tail to move the way a snake's
 * does, and the way a snake's does is that the *body follows the head's path*:
 * the animal lays a wave down and every part of it behind travels through the
 * same wave. So the offset is a sine of `i + t` — the segment index plus how
 * far through the step the body is — which means a segment arriving where the
 * one ahead of it was arrives at the same excursion the one ahead of it had.
 * The wave stands still on the arena and the body moves through it, which is
 * the difference between a snake crawling and a rope being shaken. The head is
 * spared it: the head is the gun, and a muzzle that wandered off the line of
 * the tiles would be lying to the seat holding the trigger.
 */

/** Where a tile's centre is, in pixels. */
function centre(arena: Arena, col: number, row: number): { x: number; y: number } {
  return { x: arenaX(arena, col) + arena.tile / 2, y: arenaY(arena, row) + arena.tile / 2 };
}

/**
 * How far through the current step the body is, 0..1.
 *
 * Reads the world and nothing else. While the ship is still folding there is
 * no step to be part-way through, so it is 0 and the body sits on its tiles.
 */
export function snakeSlide(snake: SnakeState, tick: number): number {
  if (snake.phase !== "play") return 0;
  const round = snake.rounds[snake.round];
  if (!round || round.stepTicks <= 0) return 0;
  return Math.max(0, Math.min(1, (tick - snake.stepTick) / round.stepTicks));
}

/** Radians of the crawl wave one segment of body covers. */
const CRAWL_STEP = 1.15;
/** How far the widest part of the wave carries a joint sideways, in tiles. */
const CRAWL_TILES = 0.13;

/**
 * Every joint of the body, in pixels, slid forward by `t` and carried through
 * the crawl.
 *
 * The head runs on ahead into the tile it is entering and every other segment
 * moves towards the one in front of it, which is what a snake does: the shape
 * flows along itself rather than every part of it jumping at once. The
 * sideways offset is added on top, across whichever way that joint is
 * travelling, and it grows over the first couple of segments so the neck
 * leaves the head cleanly.
 */
export function snakeJoints(
  arena: Arena,
  snake: SnakeState,
  t: number,
): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (const [i, tile] of snake.body.entries()) {
    const here = centre(arena, tile.col, tile.row);
    if (i === 0) {
      out.push({
        x: here.x + snake.dirCol * arena.tile * t,
        y: here.y + snake.dirRow * arena.tile * t,
      });
      continue;
    }
    const ahead = snake.body[i - 1];
    if (!ahead) continue;
    const to = centre(arena, ahead.col, ahead.row);
    const x = here.x + (to.x - here.x) * t;
    const y = here.y + (to.y - here.y) * t;
    // Across the way this joint is going, which on a body that has turned a
    // corner is not the way the one behind it is going — the wave bends round
    // the corner with the body rather than running through the wall.
    const dx = to.x - here.x;
    const dy = to.y - here.y;
    const len = Math.hypot(dx, dy) || 1;
    const swing = Math.sin((i + t) * CRAWL_STEP) * arena.tile * CRAWL_TILES * ease(i);
    out.push({ x: x - (dy / len) * swing, y: y + (dx / len) * swing });
  }
  return out;
}

/** Nothing at the head, all of it by the third segment back. */
function ease(i: number): number {
  return Math.min(1, i / 2.5);
}

/**
 * The body, head first.
 *
 * `showBody` is the middle of it. Without it player 2's screen is all there is
 * of the length and player 1 gets the two ends and nothing between them, which
 * is exactly what they are meant to have: a pair of landmarks to steer between
 * and no idea what is strung across.
 */
export function drawSnakeBody(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  snake: SnakeState,
  showBody: boolean,
  t: number,
  gape = 0,
  flick = 0,
): void {
  const joints = snakeJoints(arena, snake, t);
  const head = joints[0];
  if (!head) return;
  drawJointRibbon(ctx, arena, joints, showBody);
  drawSnakeHead(ctx, arena, head, snake.dirCol, snake.dirRow, gape, flick);
}
