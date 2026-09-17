/**
 * THE SCOUT's numbers — how the little ship flies, what it is allowed to touch
 * and what touching it costs (`scout.ts`, `docs/spec/interludes.md`).
 *
 * Its own file for the reason `config-claw.ts` and `config-gauge.ts` give:
 * `SimConfig` extends it rather than nesting it, so every call site still
 * reads `cfg.scoutBurnMilli`, and the split is about how much of one file a
 * reader has to hold at once.
 *
 * **Every number here is about feel**, which is the one thing a test cannot
 * judge, so each says what it feels like at its value rather than only what it
 * multiplies. The owner asked for movement that is *fluent and easy*: what
 * that means arithmetically is a ship that keeps going where it was sent
 * (`scoutDragMilli` near a thousand), cannot run away with itself
 * (`scoutMaxSpeedMilli`), and never dies of the wall it drifted into
 * (`scoutBounceMilli`) — only of the thing that was moving towards it.
 */
export interface ScoutConfig {
  /**
   * How far the nose swings in a tick while the crank is turning, in
   * thousandths of a degree.
   *
   * 9 000 is nine degrees a tick, so a whole turn takes forty ticks — a little
   * over half a beat at the tempo the game ships at, where a beat is seventy-
   * five ticks. Fast enough that "point it at the top left" is one movement and
   * not a sentence with a pause in it, slow enough that a thumb can stop on a
   * heading rather than hunting past it.
   */
  scoutTurnMilliDeg: number;
  /**
   * What one tick of burn adds to the speed, in thousandths of a tile a beat.
   *
   * The scout is not thrown: it is leaned on. At 240 a burn held for half a
   * beat is about six tiles a beat of new speed — most of the ceiling — so a
   * pair that wants to cross the arena presses and waits rather than tapping,
   * and a pair that overcooked it has the same half beat to lean the other
   * way. The drag takes its share on the same tick, so the figure is not
   * 240 × 37 but the balance the two settle at.
   */
  scoutBurnMilli: number;
  /**
   * What is left of the speed after a tick of nobody pressing anything, in
   * thousandths.
   *
   * **This is the whole feel of the round.** At 1000 the ship is on ice and
   * two people spend the wave apologising; at 900 it stops dead the moment the
   * thumb comes off and the flight is a series of hops. 976 keeps about a
   * sixth of a burn alive across a beat: the ship coasts, which is what makes
   * it read as a ship, and it is down to a fortieth of its speed by the end of
   * the second beat, which is what makes it easy.
   */
  scoutDragMilli: number;
  /**
   * The fastest it may go, in thousandths of a tile a beat.
   *
   * 7 000 crosses a fourteen-column arena in two beats. Past that the ship
   * arrives before the other seat has finished the sentence that sent it,
   * which is the one failure this round cannot recover from — it is a game
   * about two people talking, and a control that outruns talking is a control
   * for one person.
   */
  scoutMaxSpeedMilli: number;
  /**
   * What a wall gives back, in thousandths of the speed that arrived at it.
   *
   * A wall is not a hazard and never was: the owner's rule is that the
   * *enemies* cost the hull. So the edge of the arena pushes the ship back at
   * 550 — a soft, obvious bounce that loses nearly half the speed and is read
   * as a mistake without being a loss.
   */
  scoutBounceMilli: number;
  /** The scout's own half-width for a touch, in thousandths of a tile. */
  scoutRadiusMilli: number;
  /** A mote's half-width for a touch, in thousandths of a tile. */
  scoutMoteRadiusMilli: number;
  /** A hazard's half-width for a touch, in thousandths of a tile. */
  scoutHazardRadiusMilli: number;
  /**
   * How long the mother ship's mouth stands open on one press, in ticks.
   *
   * SNAKE's `snakeMawTicks` arrived at from the other end: there a mouth is
   * opened *over* a point, here it is opened for a ship coming home. 30 is
   * about half a beat — long enough that "open now" is a sentence with time in
   * it, short enough that a mouth held open the whole round is not a plan.
   */
  scoutMawTicks: number;
  /**
   * The mother ship's own half-width for a touch, in thousandths of a tile.
   *
   * Bigger than anything else in the arena, because it is the one thing the
   * pair is *aiming* at rather than avoiding: a hold that has to be threaded
   * would make the trip home the hard part, and the hard part is the trip out.
   */
  scoutHomeRadiusMilli: number;
  /** Beats of quiet before the mother ship opens and the round begins. */
  scoutLeadBeats: number;
  /** Beats the result stands before the wave gives way to the next one. */
  scoutVerdictBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * The three that decide the feel — turn, burn and drag — were chosen against
 * each other rather than one at a time. What a press is worth, burn and coast
 * together, is roughly a tile for every eighth of a beat it is held: a mote two
 * tiles away is a press of about a fifth of a beat, and the whole width of an
 * eleven-column arena is one press of about three quarters of one. So the
 * difference between the two is a *length of press*, which is the thing the
 * seat that cannot see the arena can be told — "a short one" against "hold it".
 */
export const SCOUT_DEFAULTS: ScoutConfig = {
  scoutTurnMilliDeg: 9_000,
  scoutBurnMilli: 240,
  scoutDragMilli: 976,
  scoutMaxSpeedMilli: 7_000,
  scoutBounceMilli: 550,
  scoutRadiusMilli: 420,
  scoutMoteRadiusMilli: 380,
  scoutHazardRadiusMilli: 460,
  scoutMawTicks: 30,
  scoutHomeRadiusMilli: 900,
  scoutLeadBeats: 4,
  scoutVerdictBeats: 5,
};
