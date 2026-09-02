import { type SnakeState, snakeCurrent } from "./snake.js";
import { flipSnake } from "./snake-move.js";
import type { Command, SnakeTurn } from "./types.js";
import type { World } from "./world.js";

/**
 * The four verbs of the round, and the two seats they are split between.
 *
 * Player 1 has LEFT, RIGHT and the flip; player 2 has UP, DOWN and the brake.
 * The seat check is a rule of the simulation rather than a coat of paint on
 * the picture, for the reason THE GAUGE's is: a pilot who could also take it
 * upwards would be playing both halves of a round whose entire content is that
 * he cannot, and both devices have to agree exactly which presses counted.
 *
 * **A turn is only ever accepted across the way the body is going.** That one
 * line is the round. Going up, only player 1 can steer; going sideways, only
 * player 2 — so the seat that cannot steer is the seat that has to say where,
 * and a corner is two people in an agreed order. It is also the classic rule
 * about not reversing into your own neck, arrived at from the other end, which
 * is what leaves the flip something to be for.
 */

/** Which way each named turn goes, so the wire carries a word and not two integers. */
const TURNS: Record<SnakeTurn, { col: number; row: number }> = {
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
};

export function snakeHeard(world: World, snake: SnakeState, player: 1 | 2, command: Command): void {
  if (command.kind === "snakeTurn") {
    turn(snake, player, command.dir);
    return;
  }
  if (command.kind === "snakeFlip") {
    // The pilot's, because the tail is the end their screen draws.
    if (player !== 1) return;
    if (world.beat - snake.flipBeat < world.cfg.snakeFlipRestBeats) return;
    snake.flipBeat = world.beat;
    flipSnake(snake);
    return;
  }
  if (command.kind !== "snakeSlow" || player !== 2) return;
  // The navigator's, because they are the one who can see what it is about to
  // run into. A rest between two of them, so a thumb held on the button is not
  // simply a slower snake — that would be a pair who never have to talk again.
  if (world.beat - snake.slowBeat < world.cfg.snakeSlowRestBeats) return;
  snake.slowBeat = world.beat;
  snake.slowTicks = Math.floor(
    (snakeCurrent(snake).stepTicks * world.cfg.snakeSlowPermille) / 1000,
  );
}

/**
 * A turn, queued for the next step.
 *
 * Judged against `dirCol`/`dirRow` — where the body actually went — and never
 * against the queue, so no pair of presses inside one tile can add up to a
 * reversal neither player asked for (`SnakeState.turnCol`).
 */
function turn(snake: SnakeState, player: 1 | 2, dir: SnakeTurn): void {
  const step = TURNS[dir];
  // The two sideways slabs are on one screen and the two upright ones on the
  // other, so a turn arriving from the wrong seat is not refused loudly — that
  // seat has no such button drawn at all.
  if (player === 1 ? step.row !== 0 : step.col !== 0) return;
  if (step.col !== 0 && snake.dirCol !== 0) return;
  if (step.row !== 0 && snake.dirRow !== 0) return;
  snake.turnCol = step.col;
  snake.turnRow = step.row;
}
