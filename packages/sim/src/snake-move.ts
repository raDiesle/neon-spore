import { roundStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { type SnakeState, snakeCurrent, snakeLifted } from "./snake.js";
import {
  snakeCleared,
  snakeEnemyAt,
  snakeMawOpen,
  snakeOccupies,
  snakeOnBoard,
  snakePointAt,
  snakeRockAt,
} from "./snake-arena.js";
import {
  creep,
  creepHome,
  snakeAtGate,
  snakeCameHome,
  snakeGoingHome,
  snakeHome,
  snakeInside,
  snakeStepTicks,
} from "./snake-home.js";
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
  // it rather than losing it by a tick. Cleared stops the clock, and the round
  // is over only once the body is home inside the ship (`snake-home.ts`).
  if (snakeCleared(snake) && !snakeGoingHome(snake)) snake.clearBeat = world.beat;
  if (snakeHome(world.cfg, snake)) return snakeCameHome(world, snake);
  if (!snakeGoingHome(snake) && world.beat - snake.roundBeat >= round.beats) return runOut(world);
  if (world.tick - snake.stepTick < snakeStepTicks(world.cfg, snake)) return null;
  snake.stepTick = world.tick;
  return advance(world, snake);
}

/**
 * What running out of time costs, and it is the hull. The middle column,
 * because the round has no columns of its own — `gauge-round.ts` argues it,
 * and a second round is not a second argument.
 */
function runOut(world: World): false {
  roundStrikesHull(world, "snake", midCol(world.cfg));
  return false;
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
 * A quarter turn, **taken on the tick it is pressed** — `false` when taking it
 * crashed the body, `null` otherwise.
 *
 * It used to be queued for the next step, and the owner found it laggy (29
 * September 2026): the picture slides the head into the tile ahead all through
 * a step (`render/snake-body.ts`), so a turn that waited for the step was seen
 * going on and then snapping round, as much as a whole step late. Now the turn
 * is taken on **the tile the head is nearer to**:
 *
 * - in the first half of a step, the one it is standing on — the heading
 *   changes now and the step keeps its time;
 * - in the second half, the one ahead — that step is taken now, straight on,
 *   and the head turns there. That step comes at most half a step early.
 *
 * The turn is relative to the way the head *came onto* its tile (head minus
 * neck), never to the heading, so two presses on one tile are still the last
 * one winning, and left-left is still not the reversal the arcade game
 * forbids.
 */
export function turnSnake(world: World, snake: SnakeState, turn: -1 | 1): false | null {
  const head = snake.body[0];
  if (!head || snakeInside(world.cfg, head)) return null;
  if (!snakeTurnsHere(world, snake)) {
    snake.stepTick = world.tick + 1;
    if (advance(world, snake) === false) return false;
  }
  const [onto, from] = snake.body;
  // Through the mouth there is nothing left to steer (`snake-home.ts`).
  if (!onto || !from || snakeInside(world.cfg, onto)) return null;
  const [dirCol, dirRow] = turned(onto.col - from.col, onto.row - from.row, turn);
  snake.dirCol = dirCol;
  snake.dirRow = dirRow;
  snake.turn = turn;
  return null;
}

/**
 * Whether a turn heard now is taken on the tile the head is standing on —
 * the first half of a step — rather than on the one ahead (`turnSnake`).
 * Exported so a hand that plans a corner from where the head stands sends it
 * while the corner is still there (`hands/boss-hands-snake.ts`).
 *
 * Commands are heard before the tick is counted (`step-round.ts`), so the
 * tick a press belongs to is the next one — the tick a step taken on it
 * would have been taken on.
 */
export function snakeTurnsHere(world: World, snake: SnakeState): boolean {
  return 2 * (world.tick + 1 - snake.stepTick) < snakeStepTicks(world.cfg, snake);
}

/**
 * The head onto the next tile, or into something — `false` when it did, the
 * round's verdict, and `null` for a step taken.
 *
 * Straight on, always: a turn has already changed the heading by the time a
 * step is taken (`turnSnake`), and the tile the head lands on has had no turn
 * taken on it yet (`SnakeState.turn`).
 */
function advance(world: World, snake: SnakeState): false | null {
  const head = snake.body[0];
  if (!head) return null;
  if (snakeInside(world.cfg, head)) return creepHome(snake, head);
  snake.turn = 0;
  const col = head.col + snake.dirCol;
  const row = head.row + snake.dirRow;
  if (snakeAtGate(world.cfg, snake, col, row)) return creep(snake, col, row);
  if (!snakeOnBoard(world, col, row)) return crash(world, snake, col, row);
  // The tail is spared unless a point is still being paid out: it moves off
  // its tile on the same step the head arrives, so a body going round its own
  // end is a corner and not a bite.
  // …and the last `snakeTailTiles` are spared outright while player 2's thumb
  // is on the tail under `shed`: they are off the arena, and the head goes
  // through where they were standing (`snakeLifted`).
  if (snakeOccupies(snake, col, row, snake.grow === 0, snakeLifted(world.cfg, snake)))
    return crash(world, snake, col, row);
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

  if (point !== -1) {
    snake.taken.push(point);
    snake.grow += world.cfg.snakeGrowTiles;
  }
  return creep(snake, col, row);
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
  roundStrikesHull(world, "snake", midCol(world.cfg), 0, "light");
  return false;
}
