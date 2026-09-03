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
   * Tiles the spit carries, counted from the tile in front of the head.
   *
   * It used to carry the width of the arena, which made the shot a thing the
   * pair *aimed* rather than a thing they had to be brought to: an enemy eight
   * tiles up column four was answered from the opening tile, and the steering
   * had nothing to do with it. A spit is short, and a short spit is what turns
   * "it is lined up" into "get me closer to it".
   */
  snakeShotTiles: number;
  /**
   * Ticks the arena holds still after a crash, before the body sets off again.
   *
   * The attempt used to start over on the same tick it ended, which is the
   * one moment of this round nobody could read: the body was somewhere, then
   * it was somewhere else, and neither seat could say what had happened. The
   * pause is the round admitting it. Nothing is judged during it — the clock
   * is pushed along with it and the trigger and the mouth are dead — so what
   * it costs is only the time it takes to watch (`snake-move.ts`).
   */
  snakeStunTicks: number;
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
  // Seven tenths of a second, against a step of half of one in the first round
  // and under a third by the last. It was half a second, and the owner asked
  // for a mouth that stands open long enough to be seen standing open: at the
  // old window the jaws were swinging shut about as soon as they had finished
  // swinging apart, which read as a twitch rather than as a mouth.
  snakeMawTicks: 84,
  snakeMawRestTicks: 30,
  snakeFireRestBeats: 1,
  // Three tiles, which is the far side of the tile the head is entering plus
  // two. Short enough that the shot is a reason to steer.
  snakeShotTiles: 3,
  // A second and a quarter: long enough for the bump, the body folding up and
  // the empty arena to be three separate things the pair sees, and short
  // enough that a repeat is still a repeat rather than an interruption.
  snakeStunTicks: 150,
  // THE GAUGE's number, because it is the same event: a round the pair did not
  // finish. The owner turns one, they both move.
  damageSnake: 20,
  damageSnakeRepeat: 8,
};
