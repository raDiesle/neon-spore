import type { ViewRole } from "./view-role.js";

/**
 * **Whose hand a desk's one mouse is**, on the screen that shows both seats.
 *
 * `p1` and `p2` are unambiguous: the role bar has picked a seat, and the
 * pointer is that seat's only hand. `test` shows both halves on one screen,
 * and until now every press on its field was signed player 1 — so a mark
 * that wants the navigator's thumb (THE INSTAR's, THE BALLOON's right
 * handle, THE SINEW's) could not be answered there with a mouse at all, and
 * `G` was the one key that ever spoke for the other seat.
 *
 * The owner's fix, 17 September 2026: *when I press/hold 1 on the keyboard
 * it is simulating player 1, and when I press/hold 2 it is player 2 — so I
 * can use the mouse to test player 1 first, then player 2, and still proceed
 * both at the same time.* So: **while `1` or `2` is held, the pointer on the
 * test screen is that seat's**, for every gesture the field answers — a
 * press, a hold, a drag, a swipe, a turn — because the seat is decided once,
 * in `Field.seat`, before any hit test asks whose it is. With neither held
 * it is player 1's, as it was, so nothing a tester has learned changes.
 *
 * Here rather than in either host: the game (`apps/game/src/field-input.ts`)
 * and the director (`tools/director/src/stage-field.ts`) each sign their
 * pointer, and neither imports the other. What is here is the rule and a
 * memory of the keys; the listeners that feed it are each host's own.
 */

/** The seat a key names, if it is one of the two: the number row and the pad. */
export function seatKey(code: string): 1 | 2 | null {
  if (code === "Digit1" || code === "Numpad1") return 1;
  if (code === "Digit2" || code === "Numpad2") return 2;
  return null;
}

/**
 * Which of the two seat keys a desk is holding, most recent first — so `2`
 * pressed over a held `1` is player 2 until it lifts, then player 1 again.
 * Fed by the host's `keydown` and `keyup`, and cleared on `blur`, where a key
 * released over another window would otherwise stay held here for good.
 */
export class DeskSeat {
  private held: (1 | 2)[] = [];

  /** `true` when the code was a seat key, so the host can stop there. */
  down(code: string): boolean {
    const seat = seatKey(code);
    if (seat === null) return false;
    this.held = [seat, ...this.held.filter((s) => s !== seat)];
    return true;
  }

  up(code: string): void {
    const seat = seatKey(code);
    if (seat !== null) this.held = this.held.filter((s) => s !== seat);
  }

  clear(): void {
    this.held = [];
  }

  /** The seat held, or none. */
  seat(): 1 | 2 | undefined {
    return this.held[0];
  }
}

/** Whose hand the pointer is: the role's own seat, or on the test screen the held seat key's — player 1 with none. */
export function pointerSeat(role: ViewRole, held: 1 | 2 | undefined): 1 | 2 {
  if (role === "p2") return 2;
  if (role === "test" && held !== undefined) return held;
  return 1;
}
