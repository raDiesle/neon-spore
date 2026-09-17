/**
 * THE BATON's numbers — how many sockets the arm has, how long a bead is in
 * the air, how long it sits before the arm shakes it home, and when the arm
 * starts giving way (`baton.ts`, `docs/spec/bosses-choreographed.md` §10).
 *
 * Its own file for the reason `config-stare.ts` and `config-diastole.ts` give:
 * `SimConfig` extends it rather than nesting it, so every call site still
 * reads `cfg.batonFlightBeats`, and the split is about how much of one file a
 * reader has to hold at once.
 *
 * **Every number here is a handover's worth of time.** The round is one
 * player saying *going* and the other saying *got it*, over and over, with
 * the bead in the air between the two words — so the flight has to be long
 * enough for the second word to be said and answered, and the sit short
 * enough that a pair who stopped to argue loses the socket they were arguing
 * about.
 */
export interface BatonConfig {
  /**
   * Sockets along the arm, which is the number of handovers a run of the
   * fight takes. One per row of the field above the hull, so the bead's passage
   * down the arm is the same distance every other thing on the field falls.
   */
  batonSockets: number;
  /**
   * Beats a launched bead is in the air before it lands in the next socket.
   *
   * **This is THE DRAG, not THE SLOW** — the field does not slow, the bead
   * takes three real beats to cross one socket, and player 2 has all three
   * to put a shot of the right colour through it (`docs/spec/bosses-choreographed.md`,
   * the SLOW/DRAG table). Three, because a flight is player 1 saying *going*
   * and player 2 firing, which is a word and a press, and `docs/spec/latency.md`
   * puts a word at about one beat and the press after it at another.
   */
  batonFlightBeats: number;
  /**
   * Beats a bead may sit in a socket before the arm shakes it back to the
   * base. Two, at first: one to see where it is and one to say so.
   */
  batonTurnBeats: number;
  /** The same, once the arm has tightened: one beat, which is no time to argue. */
  batonTightTurnBeats: number;
  /** Handovers before the turn tightens. Four is a pair who have found the rhythm. */
  batonTightenAfter: number;
  /**
   * Beats the seat that just acted may not touch the ship — the TurnLock.
   *
   * One beat: long enough that player 1 cannot launch and immediately move
   * under the landing, and short enough that it reads as *my turn, your turn*
   * rather than as a freeze.
   */
  batonLockBeats: number;
  /**
   * Dark sockets before the arm starts swinging — landing the bead a column
   * off the base so the pair has to say where it went.
   */
  batonSwingAfter: number;
  /**
   * Dark sockets before the arm starts giving way: every `batonShedBeats`, the
   * topmost dark socket lets go of its shell, which is one rock falling down
   * the arm's column.
   */
  batonShedAfter: number;
  /** Beats between one shed socket and the next. */
  batonShedBeats: number;
  /**
   * Dark sockets before the second bead lights in the top socket, wearing
   * the other colour (the design's step 9). Three: before the swing and the
   * shed, so the pair meets the second colour on a still arm and the arm
   * moves under a rhythm they already have two beads in.
   */
  batonTwinAfter: number;
  /**
   * Beats the merged bead's last flight takes, out of the last socket — and
   * the acts the pair owe it, one a beat, alternating, with no miss: the
   * design's step 13, *the length of the whole arm in one crossing*. Eleven,
   * one for each socket the arm had.
   */
  batonFinalBeats: number;
  /**
   * Beats the arm takes to fold away once the maw has taken the bead, before
   * the wave may end under it. The picture's, and hashed like every other
   * clock here.
   */
  batonDownBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one handover: three beats in the air, two to see where it landed,
 * one locked out — six beats a socket, eleven sockets, which is about a
 * minute of play if nothing goes wrong, and something always does.
 */
export const BATON_DEFAULTS: BatonConfig = {
  batonSockets: 11,
  batonFlightBeats: 3,
  batonTurnBeats: 2,
  batonTightTurnBeats: 1,
  batonTightenAfter: 4,
  batonLockBeats: 1,
  batonSwingAfter: 4,
  batonShedAfter: 6,
  batonShedBeats: 8,
  batonTwinAfter: 3,
  batonFinalBeats: 11,
  batonDownBeats: 4,
};
