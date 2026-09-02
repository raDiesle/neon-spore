import type { World } from "./world.js";

/**
 * SNAKE: one of you drives it and the other one works it.
 *
 * The ship folds into a snake and the snake never stops. **Player 2 has the
 * whole of the steering** — LEFT and RIGHT turn the body a quarter turn each,
 * the way the arcade game has always been driven — and **player 1 has the two
 * things the body does when it gets there**: a shot straight out of the head,
 * and a mouth. The arena is authored: enemies to be shot and points to be
 * swallowed, placed on the grid by whoever wrote the round
 * (`packages/content/src/snake-rounds.ts`, `tools/director`). Clear both lists
 * and the round is won.
 *
 * **The split is that neither seat can see the other's half of it.** Player 1
 * is shown the enemies and the points and both ends of the body; player 2 is
 * shown the whole body and none of the things in the arena. So the seat with
 * the wheel is driving on somebody's word, and the seat with the trigger
 * cannot line a shot up on its own. That is the whole round, and it is what
 * makes a game famously played by one person a game for two.
 *
 * **Getting it wrong repeats the round.** A wall, its own body, a touched
 * enemy, or a point swallowed with the mouth shut: all four put the body back
 * where it started with every enemy and every point standing again. The clock
 * starts over with it and the hull pays a little, so a repeat costs something
 * without being the end of anything.
 *
 * **Why the field's rule does not reach in here.** Nothing the players control
 * travels *on the field*, and this is not the field: there is no hull, no
 * cannon and no column to talk about (`docs/decisions.md` #21,
 * `docs/spec/interludes.md`). What is at stake is the same hull as ever —
 * `snake-move.ts` breaks it on a repeat and `snake-round.ts` on the clock.
 *
 * This file is the state and the shape of it. What is standing on a given
 * tile is `snake-arena.ts`, the step is `snake-move.ts`, the four verbs are
 * `snake-controls.ts`, and the clock the whole thing hangs off is
 * `snake-round.ts`. **There is no rng anywhere in the round**: every tile
 * that matters was placed by a person, which is what makes it a thing two
 * people can be told about.
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

/** One tile of the arena. Never a column of the field. */
export interface SnakeTile {
  col: number;
  row: number;
}

/**
 * One round of the round, authored rather than tuned.
 *
 * **The placement is the fight**, exactly as it is for THE FLEET: where the
 * enemies stand decides which way the body has to be driven and how long the
 * pair has to say it, and where the points are decides when the mouth has to
 * open. None of that is legible as a difficulty number, so there is no
 * difficulty number — there is a map.
 *
 * The two lists are read by index and never reordered: `struck` and `taken`
 * are indices into them, so an entry moved in the middle of a round would move
 * what has already been spent.
 */
export interface SnakeRound {
  /** Tiles the body must never touch, and the only things a shot can spend. */
  enemies: SnakeTile[];
  /** Tiles to be swallowed with the mouth open. Shut, they cost the round. */
  points: SnakeTile[];
  /** Beats one attempt lasts. Running out of them is how the round is lost. */
  beats: number;
  /** Ticks between two steps. Lower is faster — see `SnakeConfig` on the unit. */
  stepTicks: number;
}

/** Everything the round remembers between ticks. A `BossState` like the other seven. */
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
  /** `world.beat` this attempt began on — the clock it is judged against. */
  roundBeat: number;
  /** The body, head first. Its length is the difficulty and the health bar at once. */
  body: SnakeTile[];
  /** The way the last step went. */
  dirCol: number;
  dirRow: number;
  /**
   * The quarter turn queued for the next step: -1 anticlockwise, 1 clockwise,
   * 0 straight on.
   *
   * Queued rather than applied, and one number rather than a heading: a turn
   * is *relative*, so two presses inside one tile are the last one winning
   * rather than a body that has quietly turned twice. It also makes the
   * reversal the arcade game forbids unreachable — a quarter turn cannot be a
   * half turn — without a rule anybody has to write.
   */
  turn: -1 | 0 | 1;
  /** `world.tick` of the last step. The whole of the clock the body moves on. */
  stepTick: number;
  /** Tiles still owed by a point already swallowed. */
  grow: number;
  /** Indices into this round's `enemies` that are down. */
  struck: number[];
  /** Indices into this round's `points` that are swallowed. */
  taken: number[];
  /** `world.tick` the mouth was last opened. It stands for `snakeMawTicks`. */
  mawTick: number;
  /** `world.beat` of the last shot, for the rest between two and for the picture. */
  shotBeat: number;
  /** Where that shot stopped, so the picture can draw the line it took. */
  shotCol: number;
  shotRow: number;
  /** Whether it found an enemy. Render only. */
  shotHit: boolean;
  /** Attempts spent on this round beyond the first. Each one cost the hull. */
  repeats: number;
  /** `world.beat` of the last one, so the picture can flinch. -1 before the first. */
  repeatBeat: number;
}

/** Far enough back that the first shot and the first mouth are never blocked. */
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

/** The round being played. Clamped, so a state read after the last one still answers. */
export function snakeCurrent(snake: SnakeState): SnakeRound {
  const round = snake.rounds[Math.min(snake.round, snake.rounds.length - 1)];
  if (!round) throw new Error("a snake round with no rounds left to play");
  return round;
}
