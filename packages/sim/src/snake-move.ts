import { midCol } from "./config.js";
import { breachHull } from "./hull.js";
import { type SnakeState, snakeCurrent } from "./snake.js";
import {
  snakeCleared,
  snakeEnemyAt,
  snakeMawOpen,
  snakeOccupies,
  snakeOnBoard,
  snakePointAt,
  snakeRockAt,
} from "./snake-arena.js";
import { snakeOpenRound } from "./snake-open.js";
import type { World } from "./world.js";

/**
 * One step of the body, and the four ways an attempt ends badly.
 *
 * The body moves on the **tick** and not on the beat, which is the whole
 * reason this round has a step of its own: a snake that moved once a beat
 * would take seven seconds to cross the arena, and one that moved four times a
 * beat would be a reflex game two people cannot talk through. The interval is
 * authored per round (`SnakeRound.stepTicks`) and it is still the
 * deterministic tick counter — no wall clock reaches in here, so two devices
 * step on exactly the same tick or neither does.
 *
 * **A wall, its own back, a touched enemy, a struck meteor and a point taken
 * with the mouth shut all do the same thing**, and that is deliberate: one
 * failure, one word, one picture. The body stops where it stood, the hull is
 * hit, and a hit is the wave lost (`wave-fail.ts`): the field holds so the
 * crash is seen, then the whole wave is played again. The round used to start
 * the attempt over itself — body back, everything standing, a pause to watch
 * — and none of that could be reached once a hit stopped the field, so it is
 * gone. The clock running out is the other way to lose, and it is paid for
 * here too, so `snake-round.ts` only has to record which.
 */

/**
 * One tick of the play phase, and whether the whole round is over: `true`
 * every authored round was cleared, `false` the clock ran out, `null` still
 * going. The shape `stepGauge` has, for the same reason — the phases belong to
 * the file that owns the clock, and this one owns the arithmetic.
 */
export function stepSnake(world: World, snake: SnakeState): boolean | null {
  const round = snakeCurrent(snake);
  // Cleared first, so the last enemy shot on the last beat of a round wins
  // it rather than losing it by a tick.
  if (snakeCleared(snake)) return openNextRound(world, snake);
  if (world.beat - snake.roundBeat >= round.beats) return runOut(world);
  if (world.tick - snake.stepTick < round.stepTicks) return null;
  snake.stepTick = world.tick;
  return advance(world, snake);
}

/**
 * What running out of time costs, and it is the hull. The middle column,
 * because the round has no columns of its own — `gauge-round.ts` argues it,
 * and a second round is not a second argument.
 */
function runOut(world: World): false {
  breachHull(world, midCol(world.cfg), "meteorFastest", 0, "heavy");
  return false;
}

/**
 * The next round, or the end of them.
 *
 * The body starts over with it, because the arena does: a round is a placed
 * map and the pair has to be able to read it from the same square every time.
 */
function openNextRound(world: World, snake: SnakeState): boolean | null {
  if (snake.round >= snake.rounds.length - 1) return true;
  snakeOpenRound(world, snake, snake.round + 1);
  return null;
}

/**
 * A quarter turn, clockwise for 1 and anticlockwise for -1, in screen
 * coordinates where a row runs down the arena.
 *
 * Written out rather than derived from an angle for the reason
 * `purity.test.ts` bans `Math.sin` in this package: a heading is two integers
 * and it stays two integers, so two devices cannot round a corner differently.
 */
export function turned(dirCol: number, dirRow: number, turn: number): [number, number] {
  if (turn > 0) return [zero(-dirRow), zero(dirCol)];
  if (turn < 0) return [zero(dirRow), zero(-dirCol)];
  return [zero(dirCol), zero(dirRow)];
}

/**
 * Negating a zero gives `-0`, which is the same number to every arithmetic
 * this package does and a different one to `JSON`, to `Object.is` and to a
 * test that reads a heading back. The simulation stores integers, and `-0` is
 * not one of the integers anybody meant to store.
 */
function zero(n: number): number {
  return n === 0 ? 0 : n;
}

/**
 * The head onto the next tile, or into something — `false` when it did, the
 * round's verdict, and `null` for a step taken.
 *
 * The queued turn is taken *here* and nowhere else, which is what makes it a
 * queue: everything a thumb does between two steps changes where the body is
 * going next, and nothing changes where it has already been
 * (`SnakeState.turn`).
 */
function advance(world: World, snake: SnakeState): false | null {
  const [dirCol, dirRow] = turned(snake.dirCol, snake.dirRow, snake.turn);
  snake.dirCol = dirCol;
  snake.dirRow = dirRow;
  snake.turn = 0;
  const head = snake.body[0];
  if (!head) return null;
  const col = head.col + dirCol;
  const row = head.row + dirRow;
  if (!snakeOnBoard(world, col, row)) return crash(world, snake, col, row);
  // The tail is spared unless a point is still being paid out: it moves off
  // its tile on the same step the head arrives, so a body going round its own
  // end is a corner and not a bite.
  if (snakeOccupies(snake, col, row, snake.grow === 0)) return crash(world, snake, col, row);
  // An enemy is a hazard as well as a target, and touching one is the same
  // mistake as a wall: the shot was player 1's to take and nobody took it.
  // A meteor is the same mistake with nobody to blame but the steering —
  // there was never anything either of them could have done to it.
  if (snakeEnemyAt(snake, col, row) !== -1 || snakeRockAt(snake, col, row)) {
    return crash(world, snake, col, row);
  }

  const point = snakePointAt(snake, col, row);
  if (point !== -1 && !snakeMawOpen(world, snake)) {
    // Reached with the mouth shut. This is the one failure that is nobody's
    // reflex and both of their timing: player 2 drove them onto it and player
    // 1 was the only one who could see it coming.
    return crash(world, snake, col, row);
  }

  snake.body.unshift({ col, row });
  if (point !== -1) {
    snake.taken.push(point);
    snake.grow += world.cfg.snakeGrowTiles;
  }
  if (snake.grow > 0) snake.grow -= 1;
  else snake.body.pop();
  return null;
}

/**
 * A shot, straight out of the head along the way it is pointing.
 *
 * Hit-scan and not a travelling bullet, and the reason is the sentence rather
 * than the arithmetic: the head *is* the gun, so what player 1 is answering is
 * "it is lined up now", and a shot that took three tiles to arrive would be
 * answering where the body was when they pressed. It stops at the first
 * standing enemy, its own body or the wall, whichever comes first.
 *
 * **And it is short.** `snakeShotTiles` is the whole of its reach, counted
 * from the tile in front of the head. A spit that carried the arena made the
 * steering irrelevant to the trigger; one that carries three tiles makes
 * "bring me to it" the sentence the pair says most.
 *
 * Returns whether it found something, and leaves where it stopped on the state
 * for the picture to draw.
 */
export function fireSnake(world: World, snake: SnakeState): boolean {
  const head = snake.body[0];
  if (!head) return false;
  let col = head.col;
  let row = head.row;
  snake.shotBeat = world.beat;
  snake.shotHit = false;
  for (let reach = 0; reach < world.cfg.snakeShotTiles; reach++) {
    col += snake.dirCol;
    row += snake.dirRow;
    if (!snakeOnBoard(world, col, row)) {
      snake.shotCol = col - snake.dirCol;
      snake.shotRow = row - snake.dirRow;
      return false;
    }
    const enemy = snakeEnemyAt(snake, col, row);
    if (enemy !== -1) {
      snake.struck.push(enemy);
      snake.shotCol = col;
      snake.shotRow = row;
      snake.shotHit = true;
      return true;
    }
    // A meteor stops the shot and takes nothing from it. That is the whole of
    // what makes one worth *placing*: it is a wall between the trigger and its
    // target, and the only answer to it is the steering.
    if (snakeRockAt(snake, col, row) || snakeOccupies(snake, col, row)) {
      snake.shotCol = col;
      snake.shotRow = row;
      return false;
    }
  }
  // Nothing inside the reach. The spit still lands, and where it lands is the
  // whole of what player 1 learns: the picture draws it stopping in mid-air,
  // which is the pair being told they are not close enough yet.
  snake.shotCol = col;
  snake.shotRow = row;
  return false;
}

/**
 * The body met something, and that is the round's verdict.
 *
 * The hull pays, in the middle column, because the round has none of its own —
 * the same call THE GAUGE, THE MIRROR and THE MAZE make when a boss with no
 * body has to cost the ship something — and the hit is the wave lost. The body
 * is left exactly as it stood: the field holds from this tick so the pair sees
 * where it went wrong (`wave-fail.ts`), and what the picture needs besides is
 * only when, and which tile the head was going for (`render/snake-crash.ts`).
 */
function crash(world: World, snake: SnakeState, col: number, row: number): false {
  snake.crashTick = world.tick;
  snake.bumpCol = col;
  snake.bumpRow = row;
  breachHull(world, midCol(world.cfg), "meteorFastest", 0, "light");
  return false;
}
