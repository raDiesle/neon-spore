/**
 * **Everything THE WELL does that neither screen already says**, as events.
 *
 * Its own file on `events-scuttle.ts`' terms, and short for a reason: almost
 * all of what this boss does *is* the screen. The seam walking away from
 * twelve is drawn, the numerals ride round with it, and a pair looking at the
 * clock can see the whole state of the fight. What a frame does not carry is
 * the four *moments* — it started, a thumb is holding it, it has gone as far
 * as it goes, it is home — and those are what the ear is for.
 *
 * **None of them names a column**, which no other boss's events can say. The
 * seam is the one place on this face that is not a column: it is where the
 * field's two walls meet, and a pan towards it would pan towards an hour the
 * field does not have.
 */
export type WellEvent =
  /** The face has started to slip: the hours are leaving their places. */
  | { type: "wellRoll" }
  /** A thumb on the seam held the slip still for a beat; `left` beats of hold remain. */
  | { type: "wellHeld"; left: number }
  /** It has slipped as far as it slips, `sectors` from twelve, and stopped: it wants turning back. */
  | { type: "wellWound"; sectors: number }
  /** The seam is back at the top: the hours are the columns again. */
  | { type: "wellHome" };
