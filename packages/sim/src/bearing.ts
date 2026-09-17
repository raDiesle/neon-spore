/**
 * **A bearing**: where a hand is round a circle, in thousandths of a turn
 * clockwise from the top.
 *
 * Every other thing a hand carries in this game reports a **displacement**
 * from where it grabbed (`Command`'s `drag`), because a wheel is turned by how
 * far the finger has travelled and a lost message has to heal itself. A hand
 * going round a circle cannot be written that way: a finger that has been
 * round the same ring four times is back where it grabbed four times over, so
 * the displacement is nought at exactly the moments the most has been turned.
 * What such a hand has to say is where it *is*, and that is an absolute the way
 * `cannonCol` is — the next one supersedes the last, a message coalesced away
 * costs nothing, and the device with the circle's centre under its own finger
 * is the only one that ever knew a pixel.
 *
 * **Its own file because there are two of them now.** THE CLAW's crank was the
 * first (`crank.ts`) and these three numbers lived there; THE ORRERY's rings
 * are the second, and a thumb goes round one of those on the *field* rather
 * than on the panel (`orrery-hand.ts`). Importing them from the crank would
 * have been a boss reaching into a control's file for a unit — and it does not
 * even work: `crank.ts` reaches the field through `reach.ts`, the field reaches
 * every boss through `boss-others.ts`, and the cycle left `TURN` undefined at
 * the moment THE ORRERY's module body read it. A shared vocabulary in a file
 * that imports nothing cannot do that to anybody.
 *
 * Anything that turns is welcome here. Nothing that *winds* is: what a bearing
 * step is worth — rope, organs, anything — belongs to the mechanism it turns.
 */

/** A full turn, in thousandths. Bearings are `0`..`TURN - 1`. */
export const TURN = 1000;

/**
 * No hand on it, and the value a press carries instead of a bearing.
 *
 * One value for the two states, because they are one state: a hand that has
 * just gone on has no reference yet, and neither has a circle nobody is
 * touching. Anything negative reads as this, so a caller has nothing to get
 * wrong (`crankHeard`, `orreryRingHeard`).
 */
export const NO_BEARING = -1;

/**
 * The largest step read as turning **forward** rather than as a hand that has
 * come round the other way: half a turn.
 *
 * Past it, the shorter way round is backward, and the sample is read as that
 * much of a turn the other way. A real finger reports many times a second and
 * cannot cover half a circle between two of them, so the shorter way round is
 * always the way it actually went; a synthetic one — the desk keyboard, a
 * rehearsal — is written to stay well inside it.
 */
export const MAX_BEARING_STEP = TURN / 2;
