import { instarMarkSeat } from "./instar-mark-grip.js";
import type { Layout } from "./layout.js";
import { type Field, type Touch, touchDown } from "./touch.js";

/**
 * **A press on the screen that shows both seats**, where the desk's one mouse
 * has not been told whose hand it is.
 *
 * `desk-seat.ts` says which seats the pointer may speak for; this says what a
 * press does with more than one of them, and it is the owner's ask of 24
 * September 2026 — *I expect in TEST mode to decide, like players, which
 * control to pull first.* Until now the unasked seat was player 1 and nothing
 * else, so on THE INSTAR's first pose the pilot's mark was the only one a
 * mouse could take, and the navigator's alone had to wait for a key. The
 * order was the rig's, not the pair's.
 *
 * Two questions, in this order, because a control that is not this seat's
 * answers in two different ways:
 *
 * 1. **A control that names a seat and answers either thumb**: THE INSTAR's
 *    marks, which are *there* for the wrong seat and refused by the
 *    simulation (`sim/instar-hand.ts`). Trying one seat and then the other
 *    would never reach the second, so the ring is asked whose it is first
 *    (`instar-mark-grip.ts` `instarMarkSeat`).
 * 2. **Every other handle a seat does not own is simply not there for it** —
 *    THE GAUGE's band, THE GIMBAL's inner rim, THE BELLOWS's handle in the
 *    other's beat — so the same hit test run for the second seat finds what
 *    the first could not, and the press is signed with the seat that found it.
 *
 * **A seat key still pins the pointer**, which is how a tester asks for the
 * refusal on purpose, and how they play a seat that would lose a race for a
 * mark either thumb may take.
 *
 * Here rather than in either host: the game's test screen
 * (`apps/game/src/input.ts`) and the director's stage
 * (`tools/director/src/stage-touch.ts`) each answer their own pointer, and
 * neither imports the other — the same reason `pointerSeat` is next door.
 */
export function deskDown(
  l: Layout,
  x: number,
  y: number,
  /** The seats this pointer may speak for, most preferred first (`pointerSeats`). */
  seats: readonly (1 | 2)[],
  /** The field as each of those seats sees it — built per seat, because whose
   * hand it is decides what half of the hit tests below answer at all. */
  fieldFor: (seat: 1 | 2) => Field,
): Touch | null {
  const first = seats[0] ?? 1;
  if (seats.length < 2) return touchDown(l, x, y, fieldFor(first));
  const named = instarMarkSeat(l, x, y, fieldFor(first));
  if (named !== undefined) return touchDown(l, x, y, fieldFor(named));
  for (const seat of seats) {
    const t = touchDown(l, x, y, fieldFor(seat));
    if (t) return t;
  }
  return null;
}
