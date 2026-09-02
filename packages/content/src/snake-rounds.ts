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
 * mouth open, and driven over with it shut starts the attempt over too. Clear
 * both and the next round opens.
 *
 * The arena is nine wide by eleven deep (`SnakeConfig`), `col` 0 on the left
 * and `row` 0 at the top. The body starts three long in column 4 at the bottom
 * heading up, so anything in column 4 low down is the thing the pair meets
 * before they have finished reading their screens — which is why round one
 * puts exactly one enemy there and nothing else.
 *
 * **The step, in ticks.** At 120 ticks a second, 90 is three quarters of a
 * second a tile and 55 is under half. The mouth stands open for 60 ticks
 * whatever the round (`snakeMawTicks`), so the same press that is comfortable
 * in round one is most of a tile by round three — the round gets harder in the
 * one place it should, without a second number saying so.
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
    beats: 40,
    stepTicks: 90,
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
    beats: 44,
    stepTicks: 70,
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
    beats: 48,
    stepTicks: 55,
  },
];
