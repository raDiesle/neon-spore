/**
 * **The one thing THE REPRISE's picture has to remember**: that the count just
 * went down.
 *
 * Everything else about the mechanism is read off the world every frame — how
 * many bodies the running echo still owes, whether one is running at all — and
 * a number read fresh says nothing about the moment it changed. The owner's
 * brief asks for exactly that moment: *it moves each time a new echoed body
 * enters the field — a pulse, a twitch, a swallow — so the pair knows
 * something has arrived and nothing about where*. That is the only signal
 * either seat gets while the field is dark, and a body sent again is otherwise
 * drawn nowhere at all (`sim/reprise.ts`).
 *
 * It is driven from the draw pass rather than fed by a `SimEvent`, which is
 * `ghost-trail.ts`'s and `coord-grid.ts`'s arrangement and is here for their
 * reason: an unseen arrival deliberately says nothing — `sendDue` cuts the
 * events it would have pushed, so that nothing anywhere can announce a body
 * the pair is not meant to see — and a transient fed off a count is the shape
 * left over when a fact has no event behind it.
 *
 * It lives in `Effects` because it outlives its frame, and it is cleared in
 * `Effects.reset()` because a restarted wave that inherited a half-spent
 * swallow would show the pair a body arriving that never did
 * (`packages/render/test/restart.test.ts` is what holds it to that).
 */

/**
 * Seconds a swallow takes to go out. A little over a quarter of a beat at the
 * shipped tempo: long enough to be caught out of the corner of an eye that is
 * on the field, short enough that two bodies a beat apart are two twitches
 * rather than one long one.
 */
const SWALLOW = 0.42;

export class RepriseFx {
  /** The count this pass last saw, or -1 for *nothing has been seen yet* —
   * which is also what a fresh instance and a reset one read as, so the first
   * frame of an echo never lands as a swallow of its own. */
  private seen = -1;
  private left = 0;

  /**
   * How far through a swallow the mechanism is, 1 on the frame a body went and
   * 0 once it is over. Eased on the way out rather than linear, so the clench
   * is sharp and the recovery is not.
   */
  get swallow(): number {
    return this.left <= 0 ? 0 : (this.left / SWALLOW) ** 0.7;
  }

  /**
   * What the mechanism owes as of this frame. A count that has **gone down**
   * is a body that has just been sent; one that has gone up is an echo
   * opening, which is not an arrival and does not twitch; and -1 means there
   * is no echo running, which forgets the count so that the first body of the
   * next one is not compared against the last body of the one before.
   */
  note(left: number): void {
    if (left < 0) {
      this.seen = -1;
      return;
    }
    if (this.seen > left) this.left = SWALLOW;
    this.seen = left;
  }

  update(dt: number): void {
    if (this.left > 0) this.left = Math.max(0, this.left - dt);
  }

  clear(): void {
    this.seen = -1;
    this.left = 0;
  }
}
