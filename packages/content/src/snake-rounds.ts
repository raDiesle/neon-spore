import type { SnakeRound } from "@neon-spore/sim";

/**
 * SNAKE's rounds: three maps, and the map is the fight.
 *
 * The body folds out of the ship and never stops. Player 2 turns it a quarter
 * turn at a time and can see nothing standing in the arena; player 1 sees
 * every enemy and every point and can only shoot and open the mouth. So a
 * round is read out loud — "two ahead of you, turn right after it" — and what
 * is written here is what there is to say.
 *
 * **Authored, never generated**, for the reason THE FLEET's chart is: where a
 * thing stands decides how long the pair has to say it. A random arena would
 * be a round nobody composed, and the one thing this round cannot survive is a
 * shape neither player can describe.
 *
 * **How to read a row.** `enemies` must be shot before the head reaches them —
 * touching one starts the attempt over. `points` must be driven over with the
 * mouth open, and driven over with it shut starts the attempt over too.
 * `rocks` are meteors: they cannot be shot and cannot be taken, they stop a
 * shot dead, and touching one starts the attempt over like anything else.
 * Clear the first two lists and the next round opens; the meteors are what
 * stands between the pair and doing it in a straight line.
 *
 * The arena is nine wide by eleven deep (`SnakeConfig`), `col` 0 on the left
 * and `row` 0 at the top. The body starts three long in column 4 at the bottom
 * heading up, so anything in column 4 low down is the thing the pair meets
 * before they have finished reading their screens — which is why round one
 * puts exactly one enemy there and nothing else.
 *
 * **The step, in ticks.** At 120 ticks a second, 60 is half a second a tile and
 * 38 is under a third. The body slides between tiles rather than jumping
 * (`snake-body.ts`), so these are the speeds of a thing that moves rather than
 * of a thing that ticks. The mouth stands open for 60 ticks whatever the round
 * (`snakeMawTicks`), so the press that is a whole step in round one is under
 * two thirds of one by round three — the round gets harder in the one place it
 * should, without a second number saying so.
 */
export const SNAKE_ROUNDS: SnakeRound[] = [
  // Learning what the two seats are. One enemy straight ahead — player 1 has
  // about four seconds to notice it and fire — and three points spread wide
  // enough that each one is a turn somebody has to call.
  {
    enemies: [
      { col: 4, row: 5 },
      { col: 1, row: 2 },
    ],
    points: [
      { col: 2, row: 8 },
      { col: 7, row: 7 },
      { col: 6, row: 2 },
    ],
    // Two meteors, well clear of the opening run: the first round teaches what
    // they are by putting one somewhere the pair will drive past rather than
    // into.
    rocks: [
      { col: 6, row: 5 },
      { col: 2, row: 5 },
    ],
    beats: 40,
    stepTicks: 60,
  },
  // Two enemies on the same row as a point, which is the round where "shoot it
  // first" stops being advice and starts being an order.
  {
    enemies: [
      { col: 4, row: 6 },
      { col: 2, row: 3 },
      { col: 7, row: 4 },
    ],
    points: [
      { col: 1, row: 9 },
      { col: 7, row: 9 },
      { col: 4, row: 1 },
      { col: 0, row: 5 },
    ],
    // A short wall across the middle with one way through it, and a meteor
    // standing in front of the enemy at (7,4): the shot cannot answer that one
    // from below, so the pair has to come round.
    rocks: [
      { col: 3, row: 5 },
      { col: 4, row: 5 },
      { col: 5, row: 5 },
      { col: 7, row: 5 },
    ],
    beats: 44,
    stepTicks: 48,
  },
  // Five and five at under half a second a tile, with the body long enough by
  // the end to be in its own way. This is the round the pair has to have
  // agreed about *before* the corner arrives.
  {
    enemies: [
      { col: 4, row: 7 },
      { col: 3, row: 3 },
      { col: 6, row: 3 },
      { col: 1, row: 6 },
      { col: 7, row: 7 },
    ],
    points: [
      { col: 2, row: 1 },
      { col: 6, row: 1 },
      { col: 0, row: 9 },
      { col: 8, row: 5 },
      { col: 4, row: 4 },
    ],
    // Six, in two diagonals. There is no straight line left across the middle
    // of the arena, which at this speed is the whole round: every one of the
    // five enemies has to be lined up from a place the pair chose.
    rocks: [
      { col: 2, row: 5 },
      { col: 3, row: 6 },
      { col: 6, row: 5 },
      { col: 5, row: 6 },
      { col: 1, row: 3 },
      { col: 7, row: 3 },
    ],
    beats: 48,
    stepTicks: 38,
  },
];
