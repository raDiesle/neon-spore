/**
 * **What THE SCOUT's two hands on its picture do that neither screen already
 * says**, as three events (`scout-hand.ts`).
 *
 * Its own file on `events-pinball.ts`' terms: one round, one arm of
 * `SimEvent`, and a file `packages/audio/test/bind.test.ts` has to be told the
 * name of.
 *
 * All three cross the split, which is the whole reason they are sounds. The
 * reel and the slip are player 2's thumb going onto the line and off it, and
 * player 1 has to hear them because his own controls go dead and come back
 * with them and his screen does not show the line. The prime is his, and she
 * has to hear it because a heavy ship that has not been primed will not answer
 * the burn she is about to ask for.
 */
export type ScoutEvent =
  /** Player 2 put a line on the ship: it is being pulled home. */
  | { type: "scoutReel" }
  /** And took it off: the ship is player 1's again, wherever it has got to. */
  | { type: "scoutSlip" }
  /** Player 1 primed a labouring thruster: a burn takes for `scoutPrimeTicks`. */
  | { type: "scoutPrime" };
