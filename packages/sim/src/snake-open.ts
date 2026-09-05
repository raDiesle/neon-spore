import type { SnakeRound, SnakeState } from "./snake.js";
import type { World } from "./world.js";

/**
 * Opening a round and starting an attempt over — the two places a `SnakeState`
 * is written from nothing.
 *
 * Split off `snake.ts` when the pause after a crash took that file past the
 * 250-line ceiling, and the seam is the one the round already reads on: next
 * door is the *shape* of the state, which is types and needs no world, and
 * here is everything that has to ask the world what tick it is to fill one in.
 * `snakeCurrent` stays with the shape, because a round read out of the list is
 * a fact about the list rather than about the world.
 */

/** Far enough back that the first shot, the first mouth and the first step are never blocked. */
const LONG_AGO = -1_000_000;

export function openSnake(world: World, rounds: readonly SnakeRound[]): SnakeState {
  // A wave that carries this boss and authors nothing is a round with no way
  // to end, which is worse than one nobody can pass: it would run its clock
  // out on an empty arena and cost the hull for it.
  if (rounds.length === 0) throw new Error("a snake wave with no rounds is not a round");
  const snake: SnakeState = {
    kind: "snake",
    phase: "morph",
    phaseBeat: world.beat,
    openBeat: world.beat,
    passed: false,
    rounds: rounds.map((r) => ({
      beats: r.beats,
      stepTicks: r.stepTicks,
      enemies: r.enemies.map((t) => ({ ...t })),
      points: r.points.map((t) => ({ ...t })),
      rocks: r.rocks.map((t) => ({ ...t })),
    })),
    round: 0,
    roundBeat: world.beat,
    body: [],
    dirCol: 0,
    dirRow: -1,
    turn: 0,
    stepTick: world.tick,
    grow: 0,
    struck: [],
    taken: [],
    mawTick: LONG_AGO,
    shotBeat: LONG_AGO,
    shotCol: -1,
    shotRow: -1,
    shotHit: false,
    repeats: 0,
    repeatBeat: -1,
    repeatTick: LONG_AGO,
    bumpCol: -1,
    bumpRow: -1,
    ghost: [],
    ghostDirCol: 0,
    ghostDirRow: -1,
  };
  resetBody(world, snake);
  return snake;
}

/**
 * The body back to what it opens with: short, in the middle, at the bottom,
 * heading up. Where the ship was and the way it points, which is what the
 * morph has just finished drawing — and after a repeat it is the same picture
 * again, so the pair always starts from a place they have a word for.
 */
export function resetBody(world: World, snake: SnakeState): void {
  const cfg = world.cfg;
  const col = Math.floor(cfg.snakeCols / 2);
  const bottom = cfg.snakeRows - 1;
  snake.body = [];
  for (let i = 0; i < cfg.snakeStartTiles; i++) {
    snake.body.push({ col, row: Math.max(0, bottom - cfg.snakeStartTiles + 1 + i) });
  }
  snake.dirCol = 0;
  snake.dirRow = -1;
  snake.turn = 0;
  snake.grow = 0;
  // A fresh interval, so the first step of an attempt is a whole one rather
  // than whatever was left of the step the last one ended on.
  snake.stepTick = world.tick;
}

/**
 * Open a numbered round, arena and body together.
 *
 * The one way in, so the fight's own `openNextRound` and a caller jumping to
 * an arena cannot disagree about what a round is: the body starts over because
 * the map does, and what was struck or taken belongs to the round that is over.
 */
export function snakeOpenRound(world: World, snake: SnakeState, round: number): void {
  snake.round = Math.max(0, Math.min(snake.rounds.length - 1, round));
  snake.roundBeat = world.beat;
  snake.struck = [];
  snake.taken = [];
  resetBody(world, snake);
}
