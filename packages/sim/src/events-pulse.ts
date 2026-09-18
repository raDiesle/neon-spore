/**
 * **What THE PULSE's hand on the bar does that neither screen already says**,
 * as three events (`pulse-hand.ts`).
 *
 * Its own file on `events-scout.ts`' terms: one round, one arm of `SimEvent`,
 * and a file `packages/audio/test/bind.test.ts` has to be told the name of.
 * The round had no events of its own until 18 September 2026.
 *
 * Both screens draw the same bar, so these are not sounds for a half somebody
 * cannot see — they are sounds for a half somebody is not *looking* at. A seat
 * reading its own falling arrows has no attention left for the other's thumb,
 * and under `flutter` that thumb is the difference between a miss costing all
 * of the bar and two fifths of it. `pulseArrest` is the moment both of them
 * are on it, which is the one thing in the round neither can do alone.
 */
export type PulseEvent =
  /** This seat's thumb went on the bar: it is out of the song and carrying. */
  | { type: "pulseBrace"; player: 1 | 2 }
  /** And came off it: the seat is back in the song and the carry is over. */
  | { type: "pulseSlip"; player: 1 | 2 }
  /** Both thumbs on an arrested bar: it climbs while neither of them plays. */
  | { type: "pulseArrest" };
