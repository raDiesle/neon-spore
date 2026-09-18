/**
 * **PINBALL's two hands on the table**: what counts as a hard launch, how far
 * a thumb has to carry the plunger to wind it again, and what a nudge does to
 * a ball in the air (`pinball-hand.ts`, `docs/spec/interludes.md`, PINBALL's
 * *Three shots, three hands*).
 *
 * Its own file next to `config-vane.ts` and for its reason: `config-pinball.ts`
 * is the round's table and its clock, and these four are the price of a
 * gesture — a different kind of number, added by a different brief, on a file
 * that was already at two thirds of its ceiling.
 */
export interface PinballHandConfig {
  /**
   * The power a launch has to reach, 0–1000, for the spring to come back
   * slack (`pinball-shot.ts`).
   *
   * 900: the top tenth of the bar, which is the part the pair has to *aim* for
   * rather than drift into — the bar runs a full cycle in 2.1 s, so nine
   * tenths is about a tenth of a second wide at each end. A shot that hard is
   * the one that reaches the far corner of the board, and the round charges
   * for it on the shot after.
   */
  pinballHardMilli: number;
  /**
   * How far player 1's thumb has to carry the plunger, in thousandths of a
   * tile, for the wind to take.
   *
   * 1500: a tile and a half, the travel every swipe in this game asks for
   * (`wardenThrowMilli`, `vaneHaulMilli`, `snakeJawsMilli`).
   */
  pinballWindMilli: number;
  /**
   * And how far player 2's has to carry the table for a nudge to count.
   *
   * 1200, which is shorter than a swipe on purpose: a nudge is a shove and not
   * a stroke, and the ball it is aimed at is falling while she makes it.
   */
  pinballNudgeMilli: number;
  /**
   * What one nudge adds to the ball's sideways speed, in thousandths of a tile
   * per tick, in the direction she shoved.
   *
   * 120: enough to move a ball a peg over by the time it has fallen a third of
   * the table, and nowhere near enough to place it. A nudge that could aim
   * would make the needle and the bar into decoration.
   */
  pinballNudgeShoveMilli: number;
  /**
   * Nudges the table takes in one flight before the next one tilts it.
   *
   * 1. Two would make the nudge a second steering control; nought would make
   * it a rule with nothing on the other side of it. One is the arcade's own
   * number and the only one that makes the pair say *not yet* out loud.
   */
  pinballNudges: number;
}

/** The defaults: the top tenth, a tile and a half, a shove and one of them. */
export const PINBALL_HAND_DEFAULTS: PinballHandConfig = {
  pinballHardMilli: 900,
  pinballWindMilli: 1500,
  pinballNudgeMilli: 1200,
  pinballNudgeShoveMilli: 120,
  pinballNudges: 1,
};
