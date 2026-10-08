import type { Color } from "./types.js";

/**
 * **What THE WARDEN does**, as events: its rope, and what its second and
 * third hands do that neither screen already says (`warden-hand.ts`).
 *
 * Its own file on `events-gorge.ts`' terms: one boss, one arm of
 * `SimEvent`. The rope's four — the line coming down, the eye opening, a
 * plate off, the ring gone — are older than the rest; three of them came
 * here from `events.ts` when that file was full, and the eye opening stays
 * there, because THE LID's plates open it too. The rest are the moments the
 * other two phases add that are not states a frame later: a thumb landing on the
 * eye, which player 1 has to hear because it is the thumb their pull is
 * waiting on; the hatch thrown, which player 2 has to hear because it is the
 * three beats they have to fire in; and the slam, which both have to hear
 * because it is a window gone. And the refusal: a press on the eye or the
 * hatch in its phase that was not the phase's to give — the other seat's
 * thumb, or a swipe too short to throw — which is how the thumb that made it
 * is told so on the mark (`render/warden-fx.ts`).
 */
export type WardenEvent =
  /**
   * THE WARDEN lowered a line out of the middle of its rim. `color` is what the
   * rim will carry until the line goes — the same colour the one shot into the
   * eye has to be.
   */
  | { type: "tether"; col: number; color: Color }
  /** A plate off the rim. `color` is the rim's, which is what took it. */
  | { type: "plate"; col: number; row: number; left: number; color: Color }
  | { type: "wardenDown"; col: number; row: number }
  /** Player 2's thumb landed on the eye under NARROW: the lids behind the hatch part. */
  | { type: "wardenHold"; col: number }
  /** Player 1 threw the hatch under GLARE: it stands open for `wardenThrowBeats`. */
  | { type: "wardenThrow"; col: number }
  /** The thrown hatch's window ran out: it slammed shut. */
  | { type: "wardenSlam"; col: number }
  /** A press on the eye or the hatch this phase does not take from `player`: refused. */
  | { type: "wardenRefuse"; col: number; player: 1 | 2 };
