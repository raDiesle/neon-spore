/**
 * **What THE DIASTOLE's clamp does that neither screen already says**, as
 * two events (`diastole-hand.ts`).
 *
 * Its own file on `events-stare.ts`' terms: one boss, one arm of `SimEvent`,
 * and a file `packages/audio/test/bind.test.ts` has to be told the name of.
 * For a week the boss had no events of its own at all — every hit it takes
 * is a `metColor`, every collapse is read off `struckBeat`, and the burst is
 * the phase. The clamp added two moments that are not states a frame later:
 * the thumb catching a contraction, which the other seat has to hear
 * because it is the beat they are about to lance on, and the chamber going
 * into spasm, which both have to hear because eight beats of silence is
 * otherwise eight beats of wondering whether the count is wrong.
 */
export type DiastoleEvent =
  /** A clamp caught a contraction: the right chamber is held open under `player`'s thumb. */
  | { type: "diastoleClamp"; col: number; player: 1 | 2 }
  /** A clamp on the wrong beat, or one held too long: the chamber has gone into spasm. */
  | { type: "diastoleSpasm"; col: number };
