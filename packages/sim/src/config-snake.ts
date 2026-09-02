/**
 * SNAKE's numbers — the second of the twelve rounds, and everything about it
 * that is a dial rather than a design (`snake.ts`, `docs/spec/interludes.md`).
 *
 * `SimConfig` extends this the way it extends `GaugeConfig`, and for the same
 * two reasons: every call site still reads `cfg.snakeCols`, and a round is a
 * subject of its own rather than twenty more lines in the middle of the
 * field's tunables.
 *
 * **What is here and what is authored.** How fast the snake goes, how many
 * points pass a round and how long a round lasts are *the round*, not its
 * tuning — they change per round and a wave writes them out
 * (`packages/content/src/snake-rounds.ts`). What is here is everything that is
 * the same in every round of every snake wave there will ever be: the size of
 * the arena, what a body is worth, what a crash costs.
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
  /** Tiles the snake is long when it opens, and again after a crash. */
  snakeStartTiles: number;
  /** Tiles a pellet adds. The body is the obstacle, so this is the difficulty. */
  snakeGrowTiles: number;
  /** What a pellet is worth. */
  snakePelletPoints: number;
  /** What the orb is worth — more, and it does not last. */
  snakeOrbPoints: number;
  /** Beats between one orb leaving and the next appearing. */
  snakeOrbEveryBeats: number;
  /** Beats an orb stands before it goes. Shorter than a spoken sentence is too short. */
  snakeOrbBeats: number;
  /**
   * How much of one step player 2's brake adds to the next one, in thousandths.
   *
   * A share rather than a count of ticks, because the step interval changes
   * every round: a fixed number of ticks would be most of a step in the first
   * round and a twitch in the last, and the button would quietly stop meaning
   * what the pair learned it meant.
   */
  snakeSlowPermille: number;
  /** Beats between two brakes, so a thumb held down is not a slower snake. */
  snakeSlowRestBeats: number;
  /** Beats between two flips, for the same reason. */
  snakeFlipRestBeats: number;
  /**
   * What running out of time takes off the hull, in whole points. The round
   * draws no hull and the hull is at stake anyway — `damageGauge`'s argument,
   * one round along.
   */
  damageSnake: number;
  /**
   * What one wall or one bite of the body costs. Smaller than the round, on
   * purpose: a crash is a thing the pair can survive and talk about, and a
   * round that ended on the first one would be ninety seconds of holding still.
   */
  damageSnakeCrash: number;
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
  snakeGrowTiles: 2,
  snakePelletPoints: 1,
  snakeOrbPoints: 3,
  snakeOrbEveryBeats: 12,
  snakeOrbBeats: 8,
  snakeSlowPermille: 800,
  snakeSlowRestBeats: 3,
  snakeFlipRestBeats: 2,
  // THE GAUGE's number, because it is the same event: a round the pair did not
  // finish. The owner turns one, they both move.
  damageSnake: 20,
  damageSnakeCrash: 8,
};
