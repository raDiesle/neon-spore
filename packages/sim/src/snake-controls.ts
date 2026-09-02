import type { SnakeState } from "./snake.js";
import { fireSnake } from "./snake-move.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * The four verbs of the round, and the two seats they are split between.
 *
 * **Player 2 drives.** LEFT and RIGHT are a quarter turn each, relative to
 * wherever the body is already pointing — the arcade game's own controls, and
 * the only ones that need no reading of the screen to press correctly. There
 * is no up and down, because a heading is not a place: "left" said out loud
 * means the same thing to both of them whatever the body is doing, and
 * "column four" does not exist in here.
 *
 * **Player 1 works it.** FIRE puts a shot straight out of the head; MAW opens
 * the mouth for a moment. Neither of them moves anything, which is the whole
 * of the split: the seat that can see the enemies and the points cannot reach
 * them, and the seat that can reach them cannot see them.
 *
 * The seat check is a rule of the simulation and not a coat of paint on the
 * picture, for the reason THE GAUGE's is: a driver who could also fire would
 * be playing both halves of a round whose entire content is that he cannot,
 * and both devices have to agree exactly which presses counted.
 */

export function snakeHeard(world: World, snake: SnakeState, player: 1 | 2, command: Command): void {
  if (command.kind === "snakeTurn") {
    // The wheel is player 2's whole seat. A turn from player 1 is not refused
    // loudly — that screen has no wheel drawn on it at all.
    if (player !== 2) return;
    snake.turn = command.dir === "left" ? -1 : 1;
    return;
  }
  if (command.kind === "snakeFire") {
    if (player !== 1) return;
    // A rest between two shots, so a thumb held on the trigger is not a way of
    // clearing a row without having been told where to point.
    if (world.beat - snake.shotBeat < world.cfg.snakeFireRestBeats) return;
    fireSnake(world, snake);
    return;
  }
  if (command.kind !== "snakeMaw" || player !== 1) return;
  // The mouth is a *window* and not a hold: it opens on the press and shuts on
  // its own a fraction of a step later (`snakeMawTicks`), which is what makes
  // it a thing to time rather than a thing to leave on. The rest is what stops
  // a thumb tapping it every tick from being the same as leaving it open.
  if (world.tick - snake.mawTick < world.cfg.snakeMawRestTicks) return;
  snake.mawTick = world.tick;
}
