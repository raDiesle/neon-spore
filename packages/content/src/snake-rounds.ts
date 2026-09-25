import type { SnakeRound } from "@neon-spore/sim";

/**
 * SNAKE's rounds: three maps, and the map is the fight.
 *
 * The body folds out of the ship and never stops. Player 2 turns it a quarter
 * turn at a time; player 1 can only shoot and open the mouth. Both see the
 * whole arena. So a round is agreed out loud — "two ahead of you, turn right
 * after it" — and what is written here is what there is to say.
 *
 * **Authored, never generated**, for the reason THE FLEET's chart is: where a
 * thing stands decides how long the pair has to say it. A random arena would
 * be a round nobody composed, and the one thing this round cannot survive is a
 * shape neither player can describe.
 *
 * **How to read a row.** `enemies` must be shot before the head reaches them —
 * touching one starts the attempt over, and the spit only carries ten small
 * tiles (`snakeShotTiles`), so an enemy has to be driven *at* before it can be
 * answered. `points` must be driven over with the
 * mouth open, and driven over with it shut starts the attempt over too.
 * `rocks` are meteors: they cannot be shot and cannot be taken, they stop a
 * shot dead, and touching one starts the attempt over like anything else.
 * Clear the first two lists and the next round opens; the meteors are what
 * stands between the pair and doing it in a straight line.
 *
 * The arena is seventeen small tiles wide by twenty-one deep (`SnakeConfig`),
 * `col` 0 on the left and `row` 0 at the top. Every map was written on the old
 * 9x11 grid and doubled: the old tile (c, r) is (2c, 2r) here, and a wall of
 * meteors is filled in between so the body cannot slip through the gap the
 * doubling opened. The body starts six long in column 8 at the bottom heading
 * up, so anything in column 8 low down is the thing the pair meets before they
 * have finished reading their screens.
 *
 * **The step, in ticks.** At 120 ticks a second, 45 is under two fifths of a
 * second a small tile and 28 under a quarter. A small tile is half a big one,
 * so the body crosses the screen about a third slower than it did on the old
 * grid, which the owner asked for (25 September 2026). The body slides between
 * tiles rather than jumping (`snake-body.ts`). The mouth stands open for 84
 * ticks whatever the round (`snakeMawTicks`), so the press that is two steps
 * in round one is three by round three.
 */
export const SNAKE_ROUNDS: SnakeRound[] = [
  // Learning what the two seats are. One enemy straight ahead and inside the
  // spit's reach from the tile the body opens on, so the first thing player 1
  // ever does is fire at something already in range. Three points spread wide
  // enough that each one is a turn somebody has to call.
  {
    enemies: [
      { col: 8, row: 10 },
      { col: 2, row: 4 },
    ],
    points: [
      { col: 4, row: 16 },
      { col: 14, row: 14 },
      { col: 12, row: 4 },
    ],
    // Two meteors, well clear of the opening run: the first round teaches what
    // they are by putting one somewhere the pair will drive past rather than
    // into.
    rocks: [
      { col: 12, row: 10 },
      { col: 4, row: 10 },
    ],
    beats: 60,
    stepTicks: 45,
  },
  // Two enemies on the same row as a point, which is the round where "shoot it
  // first" stops being advice and starts being an order.
  {
    enemies: [
      { col: 8, row: 12 },
      { col: 4, row: 6 },
      { col: 14, row: 8 },
    ],
    points: [
      { col: 2, row: 18 },
      { col: 14, row: 18 },
      { col: 8, row: 2 },
      { col: 0, row: 10 },
    ],
    // A short wall across the middle with one way through it, and a meteor
    // standing in front of the enemy at (14,8): the shot cannot answer that
    // one from below, so the pair has to come round.
    rocks: [
      { col: 6, row: 10 },
      { col: 7, row: 10 },
      { col: 8, row: 10 },
      { col: 9, row: 10 },
      { col: 10, row: 10 },
      { col: 14, row: 10 },
    ],
    beats: 66,
    stepTicks: 36,
  },
  // Five and five at the fastest step, with the body long enough by the end
  // to be in its own way. This is the round the pair has to have agreed about
  // *before* the corner arrives.
  {
    enemies: [
      { col: 8, row: 12 },
      { col: 6, row: 6 },
      { col: 12, row: 6 },
      { col: 2, row: 12 },
      { col: 14, row: 14 },
    ],
    points: [
      { col: 4, row: 2 },
      { col: 12, row: 2 },
      { col: 0, row: 18 },
      { col: 16, row: 10 },
      { col: 8, row: 8 },
    ],
    // Two diagonals of three and two singles. There is no straight line left
    // across the middle of the arena, which at this speed is the whole round:
    // every one of the five enemies has to be lined up from a place the pair
    // chose.
    rocks: [
      { col: 4, row: 10 },
      { col: 5, row: 11 },
      { col: 6, row: 12 },
      { col: 12, row: 10 },
      { col: 11, row: 11 },
      { col: 10, row: 12 },
      { col: 2, row: 6 },
      { col: 14, row: 6 },
    ],
    beats: 72,
    stepTicks: 28,
  },
];
