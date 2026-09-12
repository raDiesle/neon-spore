/**
 * THE WEIGHT's one number.
 *
 * A body answered by one gesture has one tuning question — how long the gesture
 * has to hold — and the answer here is the only thing standing between "two
 * thumbs, eventually" and "two thumbs, together". Its own block for the reason
 * every creature's is: a figure spread through the code is a figure the next
 * lane cannot find, and one in `config.ts` beside the grid and the beat is a
 * figure nobody can tell apart from a rule of the game.
 *
 * **There is no score here and there was never going to be one.** What a run
 * keeps is the time played and the retries (`wave-fail.ts`), so a body is worth
 * the seconds it costs and nothing else. What a crush is credited with instead
 * is the streak — `markMoment`, the pair's own record of moments they met —
 * which is the one number this creature has any business moving.
 */
export interface WeightConfig {
  /**
   * Milliseconds both hands must be on a weight before it gives.
   *
   * **Long enough that arriving together is the skill, short enough that a pair
   * who managed it is not made to wait.** 600 ms is a little under a beat at 96
   * BPM, which is the unit the pair already counts in: "on the three" buys the
   * press, and a hand that lands a beat late has to be called again. Shorter
   * than a beat on purpose — a press that outlasted one would make the honest
   * answer *hold it through the next count*, which is a stopwatch rather than a
   * moment the two of them agree on.
   *
   * Milliseconds, converted with `msToTicks`, because a window is authored in
   * time and lived in ticks like every other one in this game
   * (`config-derived.ts`).
   */
  weightCrushMs: number;
}

export const WEIGHT_DEFAULTS: WeightConfig = {
  weightCrushMs: 600,
};
