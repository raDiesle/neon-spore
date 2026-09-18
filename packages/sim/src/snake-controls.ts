import { type SnakeState, snakeGrip } from "./snake.js";
import { fireSnake } from "./snake-move.js";
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
 * The wheel is left alone: a turn is queued rather than taken, and the queue
 * is the one thing the pair may usefully agree about while they wait.
 *
 * **And since 18 September 2026 the body asks for two more, on itself.** Past
 * `snakeGorgeTiles` the jaws stick: the MAW press does nothing at all and
 * player 1 has to prise them apart on the head (`snakeJaws`), a carry of at
 * least `snakeJawsMilli` that opens the same window the press used to. Past
 * `snakeShedTiles` the tail drags, and player 2 may lift its last
 * `snakeTailTiles` clear with a thumb on it (`snakeTail`) — with the hand she
 * steers with, which is the only reason it is not simply free
 * (`docs/spec/interludes.md`, SNAKE's *Three bodies, three gestures*).
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
    if (snakeResting(world, snake)) return;
    fireSnake(world, snake);
    return;
  }
  if (command.kind === "drag") {
    dragHeard(world, snake, player, command);
    return;
  }
  if (command.kind !== "snakeMaw" || player !== 1) return;
  // The jaws stick once the body is past `snakeGorgeTiles`: from there the
  // press is a dead button and the mouth is a thing to be pulled open.
  if (snakeGrip(world.cfg, snake) !== "crawl") return;
  // The mouth is a *window* and not a hold: it opens on the press and shuts on
  // its own a fraction of a step later (`snakeMawTicks`), which is what makes
  // it a thing to time rather than a thing to leave on. The rest is at least
  // as long as the window, so the press that opens the mouth cannot be
  // repeated until the mouth has shut: a shorter rest stops a thumb tapping
  // every tick and nothing more, which is not the same thing at all.
  if (world.tick - snake.mawTick < world.cfg.snakeMawRestTicks) return;
  snake.mawTick = world.tick;
}

/**
 * The two hands on the body itself: player 1 prising the jaws and player 2
 * holding the tail off the arena.
 *
 * Both are refused outside the grip that has them, and each is refused to the
 * other seat — the same rule of the simulation the four verbs above are held
 * to, and for the same reason: two devices have to agree exactly which presses
 * counted, and a driver who could also open the mouth would be playing both
 * halves of a round whose whole content is that she cannot.
 */
function dragHeard(
  world: World,
  snake: SnakeState,
  player: 1 | 2,
  command: Extract<Command, { kind: "drag" }>,
): void {
  const grip = snakeGrip(world.cfg, snake);
  if (command.target === "snakeJaws") {
    if (player !== 1 || grip === "crawl") return;
    // The press says nothing; the prise is the lift, and only one that
    // travelled — a thumb resting on the head is not a mouth being opened.
    if (command.on) return;
    if (Math.abs(command.fromYMilli ?? 0) < world.cfg.snakeJawsMilli) return;
    // The same rest as the press it replaces. A mouth that could be hauled
    // open again the tick it shut would be a mouth held open all round, which
    // is the one thing `snakeMawRestTicks` exists to stop.
    if (world.tick - snake.mawTick < world.cfg.snakeMawRestTicks) return;
    snake.mawTick = world.tick;
    const head = snake.body[0];
    world.events.push({ type: "snakePrise", col: head?.col ?? 0, row: head?.row ?? 0 });
    return;
  }
  if (command.target !== "snakeTail" || player !== 2 || grip !== "shed") return;
  if (snake.tailHeld === command.on) return;
  snake.tailHeld = command.on;
  const tail = snake.body[snake.body.length - 1];
  world.events.push({
    type: command.on ? "snakeLift" : "snakeDrop",
    col: tail?.col ?? 0,
    row: tail?.row ?? 0,
  });
}
