/**
 * **THE THROAT's numbers**: how many rings the gullet has, where its mouth
 * hangs, how often it inhales and how far it slides between inhales
 * (`throat.ts`, `docs/spec/bosses-choreographed.md` §1).
 *
 * Its own file for the reason `config-stare.ts` gives: `SimConfig` extends
 * it rather than nesting it, so every call site still reads
 * `cfg.throatInhaleBeats`.
 *
 * **Every number here is a deadline said out loud**, which is what makes this
 * boss's dials different from a difficulty knob. Player 2 is shown the mouth's
 * column and the beats to the next inhale and has to *say* both; player 1 hears
 * them and decides which beat to let a gum go on. So the six beats of an inhale
 * are not "how hard it is" — they are the length of the sentence the pair has
 * time to say. Shorten them and the fight does not get harder, it gets quiet.
 */
export interface ThroatConfig {
  /**
   * Ring muscles in the gullet, which is also its health: a choked ring goes
   * slack for good and a tube of five slack rings cannot hold its own shape.
   *
   * 5, the design's number, and the count is load-bearing twice over — the
   * phases are read off how many are slack (`throatPhaseFor`), and the rings
   * are the health *bar*, so a pair reads how the fight is going off the
   * silhouette and off nothing else (THE QUEEN's bargain, `bosses.md` §11.0).
   */
  throatRings: number;
  /**
   * The row the mouth hangs on, counted from the top.
   *
   * 5 of fifteen, which is the design's "a third of the way down". It is the
   * one number here that is a *place* rather than a clock, and what it buys is
   * the space under it: a body that falls past the mouth's column while the
   * mouth is elsewhere has nine rows to be hauled back up through, and those
   * rows are where the braking hand earns its keep.
   */
  throatMouthRow: number;
  /**
   * Beats between inhales while the tube is whole.
   *
   * 6, and it is the pair's whole rhythm: an inhale swallows whatever is
   * already in the mouth and hauls everything else in the column one row
   * closer, so six beats is how long player 2 has to name the column and
   * player 1 has to answer it. THE DRAG rather than THE SLOW — these are real
   * beats and a hand has six chances to arrive, which is the design's own
   * reason for choosing a drag here (`slow.ts` says why they are two tools).
   */
  throatInhaleBeats: number;
  /**
   * What that becomes once two rings are slack.
   *
   * 4, the design's tightening. Not a fraction of six on purpose: the pair has
   * counted sixes for half the fight and has to *re-count*, which is the same
   * ask THE DIASTOLE's seven makes and for the same reason.
   */
  throatTightBeats: number;
  /** Columns the mouth steps a beat once it starts sliding. 1: a column a
   * beat is the fastest a pair can name a place and still be believed. */
  throatSlideCols: number;
  /** And once two rings are slack. 2, so the mouth crosses the field in the
   * beats an inhale now takes — the two clocks tighten together. */
  throatQuickCols: number;
  /**
   * Beats the eversion takes: the tube pulling itself through its own mouth,
   * ring by ring, with a slow window over the whole of it.
   *
   * 6, one a ring and one over, because the thing being drawn is the rings
   * going through in order (`bosses-choreographed.md` §1, step 14). It is the
   * payoff rather than a rule — the boss is already beaten when it starts.
   */
  throatEvertBeats: number;
  /**
   * The most inhales a thumb on a slack ring may take off the grid before the
   * ring tears out of it (`throatBreathes`).
   *
   * 3, and it is a length rather than a strength: half an inhale at the
   * shipped cadence, which is long enough for the pilot to get a gum a row or
   * two down and short enough that player 2 cannot simply hold the fight
   * still. Every one of the three is owed back at an inhale a beat, so the
   * cap is also the size of the bill — the pair can count what they borrowed
   * on one hand, which is the whole point of a number in this fight.
   */
  throatCinchBeats: number;
  /**
   * How far the pilot's carry on the tube must travel before it is a haul, in
   * thousandths of a tile.
   *
   * 700, THE VANE's number for the same job: a fingertip's jitter is under a
   * tenth of a tile and a deliberate sideways drag is most of one. It is a
   * threshold and not a distance — the mouth moves one column however far the
   * thumb went, because a column is the unit player 2 has already said out
   * loud and half of one is not a thing either of them can name.
   */
  throatHaulMilli: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: five rings, a mouth a third down, an inhale every six
 * beats that tightens to four, a mouth that stands still and then walks and
 * then runs, and six beats of turning inside out at the end.
 */
export const THROAT_DEFAULTS: ThroatConfig = {
  throatRings: 5,
  throatMouthRow: 5,
  throatInhaleBeats: 6,
  throatTightBeats: 4,
  throatSlideCols: 1,
  throatQuickCols: 2,
  throatEvertBeats: 6,
  throatCinchBeats: 3,
  throatHaulMilli: 700,
};
