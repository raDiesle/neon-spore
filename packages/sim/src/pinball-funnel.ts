import { isqrt, type PinBall } from "./pinball-contact.js";
import type { PinPhysics } from "./pinball-physics.js";

/**
 * The two funnels low on the table: a slope down from each side wall to a
 * third of the way in, so a falling ball reaches the ship only across its
 * middle third.
 *
 * The owner, 1 October 2026: *add on the sides low some funnel which reduces
 * the ball can hit hull around only for ⅓, so ⅓ left and ⅓ right, so it's
 * easier to catch the ball again.* A third of eleven columns is the cannon
 * standing in one of three, and three is a number a pair can say.
 *
 * **One-way, upward.** The cannon still slides the whole hull and fires from
 * wherever it stands, including from under a funnel, so a ball whose centre
 * starts below the slope passes up through it untouched. Only a ball that
 * began the tick above the slope and is moving into it is turned. That is
 * what a pinball table's inlane does with its one-way gate, and the reason it
 * is a gate is the same: a shot from the corner is still a shot.
 *
 * **The slope keeps what runs along it.** `reflect` scales the whole velocity,
 * which is right for a peg and wrong for a ramp: a ball landing on a slope at
 * 39° would stop dead on it and sit there until the flight timed out. So only
 * the part of the velocity *into* the slope is reversed and damped, and the
 * part along it is kept — the ball lands, rolls down and leaves the bottom of
 * the funnel towards the middle, which is the picture the owner described.
 */

/** One funnel's slope: from the wall at `a` down to the floor at `b`, and its outward normal. */
export interface PinFunnel {
  axMilli: number;
  ayMilli: number;
  bxMilli: number;
  byMilli: number;
  /** Unit normal in thousandths, pointing up out of the slope into the table. */
  nxMilli: number;
  nyMilli: number;
}

/** The left funnel, then the right, or none when the table has none. */
export function pinFunnels(phys: PinPhysics): PinFunnel[] {
  const f = phys.funnelMilli;
  if (f <= 0) return [];
  const w = phys.widthMilli;
  const h = phys.heightMilli;
  const third = Math.trunc(w / 3);
  const len = Math.max(1, isqrt(f * f + third * third));
  const nx = Math.trunc((f * 1000) / len);
  const ny = -Math.trunc((third * 1000) / len);
  return [
    { axMilli: 0, ayMilli: h - f, bxMilli: third, byMilli: h, nxMilli: nx, nyMilli: ny },
    { axMilli: w, ayMilli: h - f, bxMilli: w - third, byMilli: h, nxMilli: -nx, nyMilli: ny },
  ];
}

/** How far a point stands above a funnel's slope, in thousandths; negative is under it. */
function above(fun: PinFunnel, xMilli: number, yMilli: number): number {
  return Math.trunc(
    ((xMilli - fun.axMilli) * fun.nxMilli + (yMilli - fun.ayMilli) * fun.nyMilli) / 1000,
  );
}

/** Whether a point is over a funnel's own stretch of the floor. */
function over(fun: PinFunnel, xMilli: number): boolean {
  const lo = Math.min(fun.axMilli, fun.bxMilli);
  const hi = Math.max(fun.axMilli, fun.bxMilli);
  return xMilli >= lo && xMilli <= hi;
}

/**
 * Turn a ball that came down onto either funnel this tick. `fromX`/`fromY` is
 * where its centre was before this tick's motion — the gate's one memory, and
 * it is the ball's own, not the table's.
 */
export function stepFunnels(ball: PinBall, fromX: number, fromY: number, phys: PinPhysics): void {
  const r = phys.ballMilli;
  for (const fun of pinFunnels(phys)) {
    if (!over(fun, ball.xMilli)) continue;
    if (above(fun, fromX, fromY) <= 0) continue;
    const s = above(fun, ball.xMilli, ball.yMilli);
    if (s >= r) continue;
    const dot = Math.trunc((ball.vxMilli * fun.nxMilli + ball.vyMilli * fun.nyMilli) / 1000);
    if (dot >= 0) continue;
    // Out to the surface first, for the reason `stepBall` gives for pieces.
    ball.xMilli += Math.trunc(((r - s) * fun.nxMilli) / 1000);
    ball.yMilli += Math.trunc(((r - s) * fun.nyMilli) / 1000);
    const back = Math.trunc((dot * (1000 + phys.funnelPermille)) / 1000);
    ball.vxMilli -= Math.trunc((back * fun.nxMilli) / 1000);
    ball.vyMilli -= Math.trunc((back * fun.nyMilli) / 1000);
    return;
  }
}
