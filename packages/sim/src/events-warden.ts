/**
 * **What THE WARDEN's second and third hands do that neither screen already
 * says**, as three events (`warden-hand.ts`).
 *
 * Its own file on `events-gorge.ts`' terms: one boss, one arm of
 * `SimEvent`, and a file `packages/audio/test/bind.test.ts` has to be told
 * the name of. The rope's four — the line coming down, the eye opening, a
 * plate off, the ring gone — are older than this file and stay in
 * `events.ts`, where `bind.ts` reads them. These are the moments the other
 * two phases add that are not states a frame later: a thumb landing on the
 * eye, which player 1 has to hear because it is the thumb their pull is
 * waiting on; the hatch thrown, which player 2 has to hear because it is the
 * three beats they have to fire in; and the slam, which both have to hear
 * because it is a window gone.
 */
export type WardenEvent =
  /** Player 2's thumb landed on the eye under NARROW: the lids behind the hatch part. */
  | { type: "wardenHold"; col: number }
  /** Player 1 threw the hatch under GLARE: it stands open for `wardenThrowBeats`. */
  | { type: "wardenThrow"; col: number }
  /** The thrown hatch's window ran out: it slammed shut. */
  | { type: "wardenSlam"; col: number };
