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
   * rather than drift into — the bar runs a full cycle in 4.2 s, so nine
   * tenths is about a fifth of a second wide at each end. A shot that hard is
   * the one that reaches the far corner of the board, and the round charges
   * for it on the shot after.
   */
  pinballHardMilli: number;
  /**
   * How far player 1's thumb has to carry the plunger, in thousandths of a
   * tile, for the wind to take.
   *
   * 1500: a tile and a half, the travel every swipe in this game asks for
   * (`wardenThrowMilli`, `vaneHaulMilli`).
   */
  pinballWindMilli: number;
  /**
   * What one nudge adds to the ball's sideways speed, in thousandths of a tile
   * per tick, in the direction the table was shoved.
   *
   * 60 (120 until the flight was halved in speed on 30 September 2026):
   * enough to move a ball a peg over by the time it has fallen a third of
   * the table, and nowhere near enough to place it. A nudge that could aim
   * would make the needle and the bar into decoration.
   */
  pinballNudgeShoveMilli: number;
  /**
   * Nudges the table takes in one flight, from both seats together, before
   * the next one tilts it.
   *
   * 3. It was 1, player 2's, until the owner asked on 1 October 2026 that
   * *any player can bump the ball to lead the direction a little*: one shove
   * between two seats is a race to it rather than a lead. Three is a flight
   * led a little — a shove moves the ball a peg over and no more — and still
   * a count the pair have to share out loud, because the fourth tilts.
   */
  pinballNudges: number;
}

/** The defaults: the top tenth, a tile and a half, and three shoves of a peg. */
export const PINBALL_HAND_DEFAULTS: PinballHandConfig = {
  pinballHardMilli: 900,
  pinballWindMilli: 1500,
  pinballNudgeShoveMilli: 60,
  pinballNudges: 3,
};
