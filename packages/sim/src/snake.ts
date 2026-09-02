import type { World } from "./world.js";

/**
 * SNAKE: one body, two axes, and neither of you owns a corner.
 *
 * The ship folds into a snake and the snake never stops. Player 1 has LEFT and
 * RIGHT, player 2 has UP and DOWN, and a turn is only ever accepted across the
 * way the body is already travelling — so every corner is one seat and then
 * the other, in that order, out loud. That is the whole round, and it is why a
 * game famously played by one person is in this game at all: a snake steered
 * by one thumb pair is a snake that cannot turn a corner.
 *
 * **What each screen is not shown.** Player 1 sees the food and both ends of
 * the body and nothing between them; player 2 sees the whole body and no food.
 * So the seat that can steer towards the pellet cannot see what is in the way,
 * and the seat that can see the way is steering on somebody else's word. The
 * two buttons follow the two halves: the flip is player 1's because the tail
 * is the end they can see, and the brake is player 2's because they are the
 * one watching the body it is about to run into. `packages/render` owns that
 * split — it is a fact about a screen, not about the world.
 *
 * **Why the field's rule does not reach in here.** Nothing the players control
 * travels *on the field*, and this is not the field: there is no hull, no
 * cannon and no column to talk about (`docs/decisions.md` #21,
 * `docs/spec/interludes.md`). What is at stake is the same hull as ever —
 * `snake-move.ts` breaks it on a crash and `snake-round.ts` on the clock.
 *
 * This file is the state and the shape of it. What stands in the arena to be
 * collected is `snake-items.ts` — which reads a body out of here, so nothing
 * here reaches back for it and the first pellet is dropped by `snake-round.ts`
 * on the way in. The step is `snake-move.ts`, the three verbs are
 * `snake-controls.ts`, and the clock the whole thing hangs off is
 * `snake-round.ts`.
 */

/**
 * The three parts of the round. `morph` is the ship becoming the snake, which
 * is a picture rather than a rule and is exactly why it is a phase: the pair
 * needs the beats to read two screens that have stopped being the field.
 *
 * Choreography rather than difficulty, so the beat counts beside them are
 * constants in `snake-round.ts` and not `SimConfig` fields — the argument
 * `gauge.ts` and `mirror.ts` already make.
 */
export const SNAKE_PHASES = ["morph", "play", "verdict"] as const;
export type SnakePhase = (typeof SNAKE_PHASES)[number];

/**
 * One round of the round, authored rather than tuned.
 *
 * Three numbers, and every one of them is the design: what it takes to pass,
 * how long there is, and how fast the body goes. A wave writes them out in
 * order and the pair feels the list as one thing getting harder — which is
 * what a number in `SimConfig` could never say, because it would say it about
 * every round at once.
 */
export interface SnakeRound {
  /** Points that pass this round. Reached, the next one opens at once. */
  points: number;
  /** Beats it lasts. Running out of them is how the whole round is lost. */
  beats: number;
  /** Ticks between two steps. Lower is faster — see `SnakeConfig` on the unit. */
  stepTicks: number;
}

/** One tile of the arena. Never a column of the field. */
export interface SnakeTile {
  col: number;
  row: number;
}

/** Everything the round remembers between ticks. A `BossState` like the other six. */
export interface SnakeState {
  kind: "snake";
  phase: SnakePhase;
  /** `world.beat` the current phase began on. */
  phaseBeat: number;
  /** `world.beat` the round opened on. */
  openBeat: number;
  /** How it went. Only meaningful once the phase is `verdict`. */
  passed: boolean;
  /** The authored rounds, in order. Copied in, so content is never written to. */
  rounds: SnakeRound[];
  /** Which of them is being played. */
  round: number;
  /** `world.beat` that round opened on — the clock it is judged against. */
  roundBeat: number;
  /** Points in *this* round. It starts again at nothing when the next one opens. */
  points: number;
  /** The body, head first. Its length is the difficulty and the health bar at once. */
  body: SnakeTile[];
  /** The way the last step went. A turn is judged against this, never against the queue. */
  dirCol: number;
  dirRow: number;
  /**
   * The way the next step will go.
   *
   * Queued rather than applied, and that is not a nicety: with one axis each,
   * two presses inside one tile could otherwise turn a body straight back into
   * its own neck — she takes it up, he takes it left, and neither of them
   * asked for a reversal. Judging every turn against the direction actually
   * *travelled* makes that unreachable.
   */
  turnCol: number;
  turnRow: number;
  /** `world.tick` of the last step. The whole of the clock the body moves on. */
  stepTick: number;
  /** Tiles still owed by a pellet already eaten. */
  grow: number;
  /** Ticks player 2's brake has added to the next step, spent when it lands. */
  slowTicks: number;
  /** `world.beat` the brake was last used, for the rest between two of them. */
  slowBeat: number;
  /** `world.beat` the ends were last swapped, for the same reason. */
  flipBeat: number;
  /** Where the pellet is. There is always exactly one. */
  pelletCol: number;
  pelletRow: number;
  /** Where the orb is, or -1 for none standing. */
  orbCol: number;
  orbRow: number;
  /** `world.beat` the orb last appeared or left, whichever it last did. */
  orbBeat: number;
  /** Walls and bites taken. Each one cost the hull. */
  crashes: number;
  /** `world.beat` of the last one, so the picture can flinch. -1 before the first. */
  crashBeat: number;
}

/** Far enough back that the first flip and the first brake are never blocked. */
const LONG_AGO = -1_000_000;

export function openSnake(world: World, rounds: readonly SnakeRound[]): SnakeState {
  // A wave that carries this boss and authors nothing is a round with no way
  // to end, which is worse than a round nobody can pass: it would run its
  // clock out on a target of `undefined` and cost the hull for it.
  if (rounds.length === 0) throw new Error("a snake wave with no rounds is not a round");
  const snake: SnakeState = {
    kind: "snake",
    phase: "morph",
    phaseBeat: world.beat,
    openBeat: world.beat,
    passed: false,
    rounds: rounds.map((r) => ({ ...r })),
    round: 0,
    roundBeat: world.beat,
    points: 0,
    body: [],
    dirCol: 0,
    dirRow: -1,
    turnCol: 0,
    turnRow: -1,
    stepTick: world.tick,
    grow: 0,
    slowTicks: 0,
    slowBeat: LONG_AGO,
    flipBeat: LONG_AGO,
    pelletCol: 0,
    pelletRow: 0,
    orbCol: -1,
    orbRow: -1,
    orbBeat: world.beat,
    crashes: 0,
    crashBeat: -1,
  };
  resetBody(world, snake);
  return snake;
}

/**
 * The body back to what it opens with: short, in the middle, at the bottom,
 * heading up. Where the ship was and the way it points, which is what the
 * morph has just finished drawing — and after a crash it is the same picture
 * again, so the pair always restarts from a place they have a word for.
 *
 * Deliberately *not* a reset of the round: points, the clock and the pellets
 * all stand. A crash costs the hull and the tiles it took to get long, and
 * nothing else.
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
  snake.turnCol = 0;
  snake.turnRow = -1;
  snake.grow = 0;
  snake.slowTicks = 0;
  // A fresh interval, so the first step after a crash is a whole one rather
  // than whatever was left of the step the crash interrupted.
  snake.stepTick = world.tick;
}

/** The round being played. Clamped, so a state read after the last one still answers. */
export function snakeCurrent(snake: SnakeState): SnakeRound {
  const round = snake.rounds[Math.min(snake.round, snake.rounds.length - 1)];
  if (!round) throw new Error("a snake round with no rounds left to play");
  return round;
}

/**
 * Whether the body is on this tile. `spareTail` is the one tile that is about
 * to be vacated: the tail moves off it on the same step the head moves onto
 * it, so a body chasing its own end is a body going round a corner, not a
 * body biting itself.
 */
export function snakeOccupies(
  snake: SnakeState,
  col: number,
  row: number,
  spareTail = false,
): boolean {
  const last = snake.body.length - 1;
  for (let i = 0; i < snake.body.length; i++) {
    if (spareTail && i === last) continue;
    const tile = snake.body[i];
    if (tile && tile.col === col && tile.row === row) return true;
  }
  return false;
}
