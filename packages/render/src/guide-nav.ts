/**
 * The geometry of the bar a guide is turned by, and the two numbers everything
 * laid near it is measured against.
 *
 * **The drawing left this file on 16 September 2026.** It is TIDE's now
 * (`guide-tide.ts`), taken through `GUIDE_LOOK` — and `navButtons` went with
 * it, because the geometry and the drawing are one promise: a thumb is
 * hit-tested against `GUIDE_LOOK.buttons` (`navHit` in `guide-look.ts`, read by
 * `apps/game/src/briefing.ts` and `tools/director/src/stage-opening.ts`) and
 * the bar draws from the same call, so a button cannot be drawn where it is not
 * answered. What is left here is the vocabulary both sides are written in, and
 * two numbers that outlived the bar because other drawings measure off them.
 *
 * The four buttons themselves, and why each is what it is — NEXT saying its
 * name, REPLAY in place of a loop that restarted itself, SKIP beside NEXT, the
 * dots in place of a numbered step — are in `guide-tide-bar.ts` with the
 * drawing that makes them.
 */

/** How far the bar's shadow reaches up over the game it is lying on
 * (`nav-slab.ts`), and the line the welcome page's own row sits above. */
export const LIFT = 16;

/**
 * Seconds the bar stays lit after a press on the picture.
 *
 * **A press on a film page is answered, and the answer is this bar.** The
 * picture is the real screen at full size, so a thumb that has not read the
 * plate presses the cannon and nothing happens — which is the one thing in
 * the game that behaves like a broken control. The owner, 14 September 2026:
 * *it must be plain the picture is not live and the bar is the only way on.*
 * So the press is dropped where it lands (`apps/game/src/briefing.ts`) and
 * the slab's rim and NEXT flash for a moment, saying *here, not there*.
 */
export const NUDGE_S = 0.6;

export interface NavBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface NavButtons {
  back: NavBox;
  replay: NavBox;
  next: NavBox;
  /** The narrow »» on NEXT's right: straight to the gate, and READY there. */
  skip: NavBox;
  /** The bar itself, so a press on it never falls through to the field. */
  bar: NavBox;
}

export function inside(box: NavBox, x: number, y: number): boolean {
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

export interface NavState {
  /** The page this seat is on, and how many there are in all. */
  page: number;
  pages: number;
  /** Whether BACK answers anything — off once this seat has said READY. */
  back?: boolean;
  /** Whether REPLAY answers: a film to play again, or on the gate the guide
   * to read again from its first page. */
  replay?: boolean;
  /** Whether SKIP answers — off once this seat has said READY. */
  skip?: boolean;
  /** Whether the page has played through at least once, so NEXT can say so. */
  played?: boolean;
  /** Seconds the page has been up, for anything that breathes. */
  age?: number;
  /** Where a mouse is resting, in stage coordinates. Absent on a phone. */
  pointer?: { x: number; y: number };
  /** Seconds since a press on the picture rather than on the bar, or absent:
   * the bar flashes for `NUDGE_S` after one. */
  nudge?: number;
}
