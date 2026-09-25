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
 * will ever be: the size of the arena, how long the mouth stands open, how far
 * the spit carries.
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
  /** Tiles the snake is long when a round opens. */
  snakeStartTiles: number;
  /** Tiles a point adds. The body is the obstacle, so this is the difficulty. */
  snakeGrowTiles: number;
  /**
   * Tiles the body has to be past before the jaws stick and MAW stops working
   * — the length `gorge` begins at (`snakeGrip`).
   *
   * 10, which is two points into a round that opens at six: early enough that
   * the pair meets the second gesture in the first round rather than reading
   * about it, and late enough that the first two points are the round teaching
   * the mouth with the press that still answers it.
   */
  snakeGorgeTiles: number;
  /**
   * And the length `shed` begins at, where the tail starts dragging.
   *
   * 14, which is four points in. Round three authors five, so the last state of
   * the body is on the way to winning the round rather than off the end of it
   * — and the two rounds before it never reach it, which is what makes the
   * third one feel like the third one.
   */
  snakeShedTiles: number;
  /**
   * How far player 1's thumb has to carry the head, in thousandths of a tile,
   * for the lift to read as prising the jaws rather than brushing them.
   *
   * 1500: a tile and a half, the travel every swipe in this game asks for
   * (`wardenThrowMilli`, `vaneHaulMilli`). The drag is measured in the
   * field's tile like every other one, not the arena's small one, so the carry
   * did not change when the arena's tiles halved.
   */
  snakeJawsMilli: number;
  /**
   * Tiles of the tail lifted clear while player 2's thumb is on it, under
   * `shed`.
   *
   * 6, against a body of sixteen by then: enough that the corner she is about to
   * cut is passable, and far short of the body — a thumb that lifted the whole
   * length would be a thumb that turned the round off.
   */
  snakeTailTiles: number;
  /**
   * Ticks the mouth stands open on one press.
   *
   * The one number in this file that decides how the round *feels*, because it
   * is measured against the step: at a shorter step the same window is a
   * smaller share of a tile, so the mouth gets harder to time exactly as the
   * body gets faster, with nothing authored to make it so.
   */
  snakeMawTicks: number;
  /**
   * Ticks between two openings, and never shorter than `snakeMawTicks`.
   *
   * A rest shorter than the window does not stop a thumb tapping the mouth
   * open forever, it only stops it tapping *every tick*: at a rest of 30
   * against a window of 84 a press every thirty ticks held the jaws apart for
   * the whole round, which is the one thing the window exists to prevent. At
   * or above the window, a press that opens the mouth is a press that cannot
   * be repeated until the mouth has shut on its own.
   */
  snakeMawRestTicks: number;
  /** Beats between two shots, so a held trigger is not a cleared row. */
  snakeFireRestBeats: number;
  /**
   * Tiles the spit carries, counted from the tile in front of the head.
   *
   * It used to carry the width of the arena, which made the shot a thing the
   * pair *aimed* rather than a thing they had to be brought to: an enemy eight
   * tiles up column four was answered from the opening tile, and the steering
   * had nothing to do with it. Then it carried three of the old tiles, and the
   * owner asked for it to go further (25 September 2026). Ten small tiles is
   * five of the old ones: still short of the arena, still a reason to steer.
   */
  snakeShotTiles: number;
  /**
   * Ticks between two steps once the head is through the ship's mouth, on the
   * way home after a cleared round. Quicker than any round's own step: there
   * is nothing left to steer, and the pair is waiting on the next arena.
   */
  snakeHomeStepTicks: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * **17x21 small tiles**, where there were 9x11 big ones. The owner asked for
 * the grid split four to a tile (25 September 2026): a body that moved a whole
 * big tile per step felt clumsy to steer. An old tile at (c, r) is the small
 * tile at (2c, 2r), so the middle column is still the middle and the arena is
 * the same size on the screen. Odd both ways, so the body starts dead centre.
 * Every length below is in small tiles, twice what it was.
 */
export const SNAKE_DEFAULTS: SnakeConfig = {
  snakeCols: 17,
  snakeRows: 21,
  snakeStartTiles: 6,
  snakeGrowTiles: 2,
  snakeGorgeTiles: 10,
  snakeShedTiles: 14,
  snakeJawsMilli: 1500,
  snakeTailTiles: 6,
  // Seven tenths of a second, about two steps in the first round and three by
  // the last. It was half a second, and the owner asked
  // for a mouth that stands open long enough to be seen standing open: at the
  // old window the jaws were swinging shut about as soon as they had finished
  // swinging apart, which read as a twitch rather than as a mouth.
  snakeMawTicks: 84,
  // The window itself: the mouth reopens the tick it shuts, and not before.
  snakeMawRestTicks: 84,
  snakeFireRestBeats: 1,
  // Ten small tiles, five of the old ones. Short enough that the shot is
  // still a reason to steer.
  snakeShotTiles: 10,
  snakeHomeStepTicks: 10,
};
