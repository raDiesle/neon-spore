import { breachHull } from "./hull.js";
import { resetBody, type SnakeState, snakeCurrent, snakeOccupies } from "./snake.js";
import { clearOrb, dropOrb, dropPellet } from "./snake-items.js";
import type { World } from "./world.js";

/**
 * One step of the body, and everything that can happen on one.
 *
 * The body moves on the **tick** and not on the beat, which is the whole
 * reason this round has a step of its own at all: a snake that moved once a
 * beat would take seven seconds to cross the arena, and one that moved four
 * times a beat would be a reflex game two people cannot talk through. The
 * interval is authored per round (`SnakeRound.stepTicks`) and it is still the
 * deterministic tick counter — no wall clock reaches in here, so two devices
 * step on exactly the same tick or neither does.
 *
 * **A crash is not the end of the round.** It costs the hull and the tiles the
 * body had grown, and then the same short snake is back in the middle with the
 * clock still running. A round that ended on the first wall would be ninety
 * seconds of a pair holding still, which is the opposite of what the round is
 * for; a crash that cost nothing would make the walls scenery. The round ends
 * on the clock, in `snake-round.ts`, and that is the only place it ends.
 */

/**
 * One tick of the play phase, and whether the whole round is over: `true`
 * every authored round was passed, `false` the clock ran out, `null` still
 * going. The shape `stepGauge` has, for the same reason — the phases belong to
 * the file that owns the clock, and this one owns the arithmetic.
 */
export function stepSnake(world: World, snake: SnakeState, onBeat: boolean): boolean | null {
  if (onBeat) turnOrb(world, snake);
  const round = snakeCurrent(snake);
  // The target first, so a pellet eaten on the last beat of a round passes it
  // rather than losing it by a tick.
  if (snake.points >= round.points) return openNextRound(world, snake);
  if (world.beat - snake.roundBeat >= round.beats) return false;
  if (world.tick - snake.stepTick < round.stepTicks + snake.slowTicks) return null;
  snake.stepTick = world.tick;
  // The brake is spent by the step it delayed, never by the beat: a press that
  // bought a tile has bought exactly one.
  snake.slowTicks = 0;
  advance(world, snake);
  return null;
}

/**
 * The next round, or the end of them.
 *
 * Points start again and the body does not. That is the round's whole
 * progression: the target goes up, the clock stays about the same, the step
 * gets shorter — and the pair carries into it however long they have already
 * made themselves, which is the thing that actually decides whether the last
 * round is possible.
 */
function openNextRound(world: World, snake: SnakeState): boolean | null {
  if (snake.round >= snake.rounds.length - 1) return true;
  snake.round += 1;
  snake.roundBeat = world.beat;
  snake.points = 0;
  return null;
}

/** The orb, on the beat: it expires where it stands, and the next one is a wait. */
function turnOrb(world: World, snake: SnakeState): void {
  const cfg = world.cfg;
  const standing = snake.orbCol >= 0;
  const since = world.beat - snake.orbBeat;
  if (standing && since >= cfg.snakeOrbBeats) {
    clearOrb(world, snake);
    return;
  }
  if (!standing && since >= cfg.snakeOrbEveryBeats) dropOrb(world, snake);
}

/**
 * The head onto the next tile, or into something.
 *
 * The queued turn is taken *here* and nowhere else, which is what makes it a
 * queue: everything a thumb does between two steps changes where the body is
 * going next, and nothing changes where it has already been
 * (`SnakeState.turnCol`).
 */
function advance(world: World, snake: SnakeState): void {
  const cfg = world.cfg;
  snake.dirCol = snake.turnCol;
  snake.dirRow = snake.turnRow;
  const head = snake.body[0];
  if (!head) return;
  const col = head.col + snake.dirCol;
  const row = head.row + snake.dirRow;
  if (col < 0 || row < 0 || col >= cfg.snakeCols || row >= cfg.snakeRows) {
    crash(world, snake);
    return;
  }
  // The tail is spared unless a pellet is still being paid out: it moves off
  // its tile on the same step the head arrives, so a body going round its own
  // end is a corner and not a bite.
  if (snakeOccupies(snake, col, row, snake.grow === 0)) {
    crash(world, snake);
    return;
  }

  snake.body.unshift({ col, row });
  eat(world, snake, col, row);
  if (snake.grow > 0) snake.grow -= 1;
  else snake.body.pop();
}

/** Whatever was on the tile the head just took. At most one thing ever is. */
function eat(world: World, snake: SnakeState, col: number, row: number): void {
  const cfg = world.cfg;
  if (col === snake.pelletCol && row === snake.pelletRow) {
    snake.points += cfg.snakePelletPoints;
    snake.grow += cfg.snakeGrowTiles;
    dropPellet(world, snake);
    return;
  }
  if (col === snake.orbCol && row === snake.orbRow) {
    snake.points += cfg.snakeOrbPoints;
    clearOrb(world, snake);
  }
}

/**
 * A wall, or the body's own back.
 *
 * The hull pays, in the middle column, because the round has none of its own —
 * the same call THE GAUGE, THE MIRROR and THE MAZE make when a boss with no
 * body has to cost the ship something. The scar is what makes it read: it is
 * still there when the field comes back, so a pair who crashed four times can
 * see what the round took.
 */
function crash(world: World, snake: SnakeState): void {
  snake.crashes += 1;
  snake.crashBeat = world.beat;
  const col = Math.floor(world.cfg.cols / 2);
  breachHull(world, col, "meteorFastest", 0, world.cfg.damageSnakeCrash);
  resetBody(world, snake);
}

/**
 * The ends swapped: the tail becomes the head and the body sets off the way it
 * came.
 *
 * Player 1's verb, and the round's one answer to a corner neither seat can
 * turn — a head sitting in front of a wall with its own body behind it has
 * nowhere to go, and every other snake game ever written would simply end
 * there. The new heading points *out of* the body, so a flip can never put the
 * head into the neck it just left; where the body is one tile long there is no
 * neck to read and the heading stands.
 */
export function flipSnake(snake: SnakeState): void {
  snake.body.reverse();
  const head = snake.body[0];
  const neck = snake.body[1];
  if (head && neck) {
    snake.dirCol = head.col - neck.col;
    snake.dirRow = head.row - neck.row;
  }
  snake.turnCol = snake.dirCol;
  snake.turnRow = snake.dirRow;
}
