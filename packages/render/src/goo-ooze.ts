import type { Point } from "@neon-spore/content";

/**
 * **What GOO kept of OOZE's shared helpers**: which end the pull goes to, how
 * far it has come, the wobbling contour a drop on the path is drawn with, and
 * a dot. OOZE was VERSUS's `pull:handle` candidate GOO was built on; its slot
 * closed when FIZZ went into the game (11 October 2026), and these came with
 * it from OOZE's own goo.ts.
 */

/** Close enough to the end to be the whole way. */
export const FULL = 0.985;

/** The ends a pull is going to: the far end, or for a two-way pull still at rest, both. */
export function goals(origin: number, at: number): (0 | 1)[] {
  if (origin <= 0) return [1];
  if (origin >= 1) return [0];
  if (at > origin + 0.01) return [1];
  if (at < origin - 0.01) return [0];
  return [0, 1];
}

/** How much of the way to `goal` the hand has come, 0..1. */
export function share(origin: number, at: number, goal: 0 | 1): number {
  const span = Math.abs(goal - origin) || 1;
  return Math.max(0, Math.min(1, ((at - origin) * (goal - origin > 0 ? 1 : -1)) / span));
}

/** How much a drop's rim swells at angle `a`: three slow lobes and two quicker. */
function wobble(a: number, time: number): number {
  return 1 + 0.07 * Math.sin(a * 3 + time * 5) + 0.04 * Math.sin(a * 2 - time * 3);
}

/** A drop round `at`: a circle whose rim wobbles, pushed out on the side it leans to. */
export function blob(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  time: number,
  lean: Point = { x: 0, y: 0 },
  amt = 0,
): void {
  ctx.beginPath();
  const n = 28;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const push = 1 + amt * Math.max(0, ca * lean.x + sa * lean.y);
    const d = r * wobble(a, time) * push;
    if (i === 0) ctx.moveTo(at.x + ca * d, at.y + sa * d);
    else ctx.lineTo(at.x + ca * d, at.y + sa * d);
  }
  ctx.closePath();
}

export const dot = (ctx: CanvasRenderingContext2D, at: Point, r: number): void => {
  ctx.beginPath();
  ctx.arc(at.x, at.y, Math.max(0, r), 0, Math.PI * 2);
  ctx.fill();
};
