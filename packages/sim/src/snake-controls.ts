import type { SnakeState } from "./snake.js";
import { turnSnake } from "./snake-move.js";
import { fireSnake } from "./snake-shot.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Whether the trigger is still resting from its last shot. The panel greys the
 * slab by the same rule the controls refuse the press by.
 */
export function snakeResting(world: World, snake: SnakeState): boolean {
  return world.beat - snake.shotBeat < world.cfg.snakeFireRestBeats;
}

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
 *
 * **Nothing player 1 has works while the body is folded up.** During the pause
 * after a crash there is no head to spit out of and no mouth to open, so a
 * press that counted would be a shot leaving a body that is not on the arena.
 * The wheel is refused with them: the round is over from the crash.
 *
 * **There are no hands on the body.** From 18 September 2026 the jaws stuck
 * past a length and player 1 prised them open on the neck in place of the MAW
 * press; the owner took that out on 10 October 2026, and MAW answers the whole
 * round. Player 2's thumb holding the tail clear went out on 6 October.
 */

export function snakeHeard(
  world: World,
  snake: SnakeState,
  player: 1 | 2,
  command: Command,
): false | null {
  if (command.kind === "snakeTurn") {
    // The wheel is player 2's whole seat. A turn from player 1 is not refused
    // loudly — that screen has no wheel drawn on it at all. A turn is taken
    // the tick it is pressed, so it is the one press here that can crash the
    // body, and the verdict goes back to the round (`turnSnake`).
    if (player !== 2) return null;
    return turnSnake(world, snake, command.dir === "left" ? -1 : 1);
  }
  heardHands(world, snake, player, command);
  return null;
}

/** Everything but the wheel: nothing player 1 does moves the body. */
function heardHands(world: World, snake: SnakeState, player: 1 | 2, command: Command): void {
  if (command.kind === "snakeFire") {
    if (player !== 1) return;
    // A rest between two shots, so a thumb held on the trigger is not a way of
    // clearing a row without having been told where to point.
    if (snakeResting(world, snake)) return;
    fireSnake(world, snake);
    return;
  }
  if (command.kind !== "snakeMaw" || player !== 1) return;
  // The mouth is a *window* and not a hold: it opens on the press and shuts on
  // its own a fraction of a step later (`snakeMawTicks`), which is what makes
  // it a thing to time rather than a thing to leave on. The rest is at least
  // as long as the window, so the press that opens the mouth cannot be
  // repeated until the mouth has shut: a shorter rest stops a thumb tapping
  // every tick and nothing more, which is not the same thing at all.
  if (world.tick - snake.mawTick < world.cfg.snakeMawRestTicks) return;
  snake.mawTick = world.tick;
}
