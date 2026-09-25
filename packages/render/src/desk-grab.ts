import { instarMarkBoth, instarMarkSeat } from "./instar-mark-grip.js";
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
 *    THE GAUGE's band, THE GIMBAL's inner rim, THE HASP's wheel under the
 *    pilot's thumb — so the same hit test run for the second seat finds what
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

/**
 * **Every hand a desk press is**: the one `deskDown` picks and, where the
 * press wants both seats, the other seat's on the same point as well. The
 * owner, 24 September 2026: *on THE INSTAR I cannot use TEST and HOLD BOTH to
 * continue on one screen — when I hold with the mouse it should be for both
 * players.* A mark that counts only while both thumbs are on it never starts
 * from one mouse signed with one seat.
 *
 * Two ways a press wants both, and only where the pointer may speak for both
 * seats — a phone has one seat and is never given a second hand:
 *
 * 1. **The control under it says so**: THE INSTAR's `HOLD BOTH` ring
 *    (`instarMarkBoth`), with no key held at all.
 * 2. **`both` — the `3` key held** (`desk-seat.ts`): every seat that finds
 *    something there is on it. Not on a ring that names one seat, which the
 *    other would only be refused on (`sim/instar-hand.ts`), and not where the
 *    second hit test answers for the same player — a strip is signed by the
 *    half it is on, whoever asks, and the same press twice is not two hands.
 *
 * Each touch carries its own hold, so the host keeps both until the lift and
 * lets both go on it.
 */
export function deskDownAll(
  l: Layout,
  x: number,
  y: number,
  seats: readonly (1 | 2)[],
  fieldFor: (seat: 1 | 2) => Field,
  both = false,
): Touch[] {
  const first = deskDown(l, x, y, seats, fieldFor);
  if (first === null) return [];
  const other = first.player === 1 ? 2 : 1;
  if (!seats.includes(other)) return [first];
  const field = fieldFor(first.player);
  const wants =
    instarMarkBoth(l, x, y, field) || (both && instarMarkSeat(l, x, y, field) === undefined);
  if (!wants) return [first];
  const second = touchDown(l, x, y, fieldFor(other));
  return second !== null && second.player === other ? [first, second] : [first];
}

/**
 * **Who a press is from while THE HANDOVER has the two panels traded**
 * (`sim/handover.ts`): the band is drawn for the other seat then, so a press
 * on it comes back signed with the half it landed on — the peer's — and a
 * lockstep refuses a press attributed to the peer outright. The band's press
 * is therefore this device's.
 *
 * **A hand on the field is not re-signed.** It was already signed with the
 * seat the hit test was asked for, which on a phone is this device's and on
 * the test screen is the seat `deskDown` picked by what is under the thumb.
 * Re-signing that one sent the navigator's mark as player 1 all through the
 * handover, and the simulation refused it.
 *
 * Told apart by where the press *landed*, the same line `touchDown` asks
 * first, and kept for the move and the lift, since those are that press's.
 */
export function pressSeat(
  l: Layout,
  pressY: number,
  t: { player: 1 | 2 },
  handed: boolean,
  device: 1 | 2,
): 1 | 2 {
  return handed && pressY >= l.bandTop ? device : t.player;
}
