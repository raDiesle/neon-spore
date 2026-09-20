/**
 * A drag across a guide's page, read as a page turn.
 *
 * **The third way through a guide, and the owner asked for all three at once**
 * (20 September 2026): *clicking on the golden lines indicating the current
 * step, as well as swiping left (= back) or right (= next), is an alternative
 * to navigate guide/briefing/tutorial wave steps besides the existing
 * buttons.* The buttons are still what the page *says* to do — a bar with
 * NEXT the width of the phone is not a thing anybody misses — and these two
 * are for the thumb that has already learned where it is going.
 *
 * **Left is back and right is next, which is his mapping and not the
 * carousel's.** A photo album moves the picture under the finger, so a drag to
 * the left brings the next one on; this moves a *cursor*, so a drag to the
 * left takes it back the way the left arrow key does at a desk
 * (`keys-guide.ts`). The two readings cannot both be had, and the one that
 * matches the arrows is the one that was asked for.
 *
 * Its own file, pure, because it is the only part of the gesture with an
 * answer worth holding: everything around it is listeners on a canvas that no
 * test in this repo has a DOM for (`apps/game/test/input-pc.test.ts`), and a
 * rule about what counts as a swipe is a rule that can be read back.
 */

/**
 * How far a thumb travels across the stage before it has swiped rather than
 * pressed, in stage pixels.
 *
 * The gate is held by a press anywhere on the page (`render/ready-page.ts`),
 * so this number is also what stops a thumb resting on the glass from turning
 * the page while it waits for its partner. Fifty-six is about a fifth of a
 * phone's width: too far to wander by accident, well short of what anybody
 * means by a swipe.
 */
export const SWIPE_MIN = 56;

/**
 * How much of the travel has to be sideways.
 *
 * A guide's pages do not scroll, so there is no up and down for a diagonal to
 * be taken from — but a thumb sliding down the glass while the circle fills is
 * a thing that happens, and it must not turn the page.
 */
export const SWIPE_SLOPE = 1.2;

/** Which way a drag turns the page, or null while it is still a press. */
export function swipeTurn(dx: number, dy: number): "back" | "next" | null {
  if (Math.abs(dx) < SWIPE_MIN) return null;
  if (Math.abs(dx) < Math.abs(dy) * SWIPE_SLOPE) return null;
  return dx < 0 ? "back" : "next";
}
