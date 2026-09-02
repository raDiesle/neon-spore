/**
 * SNAKE's numbers — the second of the twelve rounds, and everything about it
 * that is a dial rather than a design (`snake.ts`, `docs/spec/interludes.md`).
 *
 * `SimConfig` extends this the way it extends `GaugeConfig`, and for the same
 * two reasons: every call site still reads `cfg.snakeCols`, and a round is a
 * subject of its own rather than twenty more lines in the middle of the
 * field's tunables.
 *
 * **What is here and what is authored.** Where the enemies and the points
 * stand, how fast the body goes and how long an attempt lasts are *the round*,
 * not its tuning — they change per round and a wave writes them out as a map
 * (`packages/content/src/snake-rounds.ts`, and the director edits it). What is
 * here is everything that is the same in every round of every snake wave there
 * will ever be: the size of the arena, how long the mouth stands open, what
 * starting over costs.
 *
 * Times are beats, except the one that cannot be: a step is faster than a beat
 * — a snake that moved once a beat would take forty seconds to cross the
 * arena — so a step interval is in **ticks**, which is the same deterministic
 * counter one level finer. Nothing here is in milliseconds.
 */
export interface SnakeConfig {
  /** The arena, in tiles. Nothing to do with `cols`: the field is gone. */
  snakeCols: number;
  snakeRows: number;
  /** Tiles the snake is long when it opens, and again after a repeat. */
  snakeStartTiles: number;
  /** Tiles a point adds. The body is the obstacle, so this is the difficulty. */
  snakeGrowTiles: number;
  /**
   * Ticks the mouth stands open on one press.
   *
   * The one number in this file that decides how the round *feels*, because it
   * is measured against the step: at a shorter step the same window is a
   * smaller share of a tile, so the mouth gets harder to time exactly as the
   * body gets faster, with nothing authored to make it so.
   */
  snakeMawTicks: number;
  /** Ticks between two openings, so a thumb tapping it is not a mouth left open. */
  snakeMawRestTicks: number;
  /** Beats between two shots, so a held trigger is not a cleared row. */
  snakeFireRestBeats: number;
  /**
   * What running out of time takes off the hull, in whole points. The round
   * draws no hull and the hull is at stake anyway — `damageGauge`'s argument,
   * one round along.
   */
  damageSnake: number;
  /**
   * What starting the round over costs: a wall, the body's own back, a touched
   * enemy, or a point taken with the mouth shut.
   *
   * Smaller than the round, on purpose: a repeat is a thing the pair can
   * survive and talk about, and a round that ended on the first wall would be
   * ninety seconds of holding still. What it must not be is free — the clock
   * restarting is a mercy, and a mercy nobody pays for is a round with no
   * shape.
   */
  damageSnakeRepeat: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * A 9x11 arena is the field's shape without being the field's grid — portrait,
 * a couple of dozen tiles a body can be lost in, and small enough that "top
 * left, two down" is a sentence about a place both of them can find.
 */
export const SNAKE_DEFAULTS: SnakeConfig = {
  snakeCols: 9,
  snakeRows: 11,
  snakeStartTiles: 3,
  snakeGrowTiles: 1,
  // Half a second, against a step of three quarters of one in the first round
  // and under half by the last: generous where the pair is learning what the
  // mouth is for, and the whole difficulty of the last round.
  snakeMawTicks: 60,
  snakeMawRestTicks: 30,
  snakeFireRestBeats: 1,
  // THE GAUGE's number, because it is the same event: a round the pair did not
  // finish. The owner turns one, they both move.
  damageSnake: 20,
  damageSnakeRepeat: 8,
};
