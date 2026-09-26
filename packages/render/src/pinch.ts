import type { Command } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import type { Hold } from "./touch-hold.js";

/**
 * **`SqueezeGap` from two fingers** — the one gesture in the game read off two
 * touches at once, first spent by THE VISE's lobes (§28) and written for THE
 * CYST's flanks to spend next.
 *
 * A pinch is one body held by two fingers, and what it sends is how far apart
 * they are. `touch.ts` answers one finger at a time and keeps no state, so it
 * cannot see a pair: a press on a pinch body only takes hold, flagged
 * `pinch`, and says nothing — **a thumb alone is not a pinch**, the one-thumb
 * twin §28 asks to be refused — and its move and its lift say nothing either.
 * Which two fingers make a pair is whoever owns the pointers' business
 * (`apps/game/src/pinch.ts`); what a pair *means* is this page's, so the
 * number is worked out in one place for every host.
 *
 * **The gap is the space between the fingertips, not between their middles.**
 * A browser reports each contact at its middle, and two fingertips pressed
 * together still stand a fingertip apart — about a centimetre, which is near
 * two tiles on a phone. Read straight, a pinch squeezed as hard as a hand can
 * would never get under THE VISE's shut line of eight tenths of a tile, so a
 * fingertip's width is taken off first and a pinch pressed shut reads nought
 * on every phone. On a tablet, where a tile is wider than a fingertip, the
 * same pinch reads shut a little sooner, which costs nothing.
 */

/** Two fingertips pressed together, middle to middle, in thousandths of a tile. */
export const FINGERTIPS_MILLI = 1800;

/** Whether a hold is one finger of a pinch, answered by the pair rather than by itself. */
export function pinching(hold: Hold): hold is Extract<Hold, { kind: "drag" }> & { pinch: true } {
  return hold.kind === "drag" && hold.pinch === true;
}

/** The gap between two fingertips at these two points, in thousandths of a tile, never below nought. */
export function pinchGapMilli(
  l: Layout,
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  if (l.tile <= 0) return 0;
  const apart = Math.round((Math.hypot(a.x - b.x, a.y - b.y) * 1000) / l.tile);
  return Math.max(0, apart - FINGERTIPS_MILLI);
}

/**
 * What a pinch says: held at this gap, or — with `null` — let go, the body
 * back open. No `fromYMilli` and no `id`: a pinch is one number on one body.
 */
export function pinchSays(hold: Extract<Hold, { kind: "drag" }>, gapMilli: number | null): Command {
  return gapMilli === null
    ? { kind: "drag", target: hold.target, on: false, fromMilli: 0 }
    : { kind: "drag", target: hold.target, on: true, fromMilli: gapMilli };
}
