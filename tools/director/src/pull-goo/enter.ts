import { smoothstep } from "@neon-spore/render";
import { SPAWN } from "./moment.js";
import { clamp01, settle } from "./noise.js";

/**
 * **How a drop and its path come onto the field** — the owner, 10 October
 * 2026: *the entering path animation must come earlier, and i want that
 * every dot appears one after another and in the blink and then at the end
 * the placeholder final position. the arrow must grow at the same time then
 * the ball control at the start appearing by growing.*
 *
 * So, `e` seconds after the drop came in (`GooMoment.enter`): the drop grows
 * at the start with its arrow growing inside it; from the first moment the
 * dots come in one after another towards the end, each with a blink; and
 * after the last of them the place at the end pops in. The PULL LAB's RETRY
 * plays it from the beginning.
 *
 * And the owner, 11 October 2026: *the first appearance of ball control is
 * most important. maybe appear small and then grow to its original size
 * quick. path and final position animation must be faster than the appearing
 * of the starting.* So the drop comes first, from a speck, alone; the dots
 * set off once it is nearly its size and run out like lightning, all of them
 * in less time than the drop took; the place pops quicker still.
 */

/** Seconds after the drop starts to grow that the first dot comes in: once it is nearly its size. */
const FIRST_DOT = SPAWN * 0.55;
/** Seconds between one dot and the next, at most; a long path is quicker per dot. */
const DOT_GAP = 0.025;
/** Seconds all the dots together may take, however many there are — well under `SPAWN`. */
export const DOTS_SPAN = 0.15;
/** Seconds a dot's blink lasts, and the place's pop — the pop shorter than the dots' run. */
const BLINK = 0.16;
export const POP = 0.13;
/** The size the drop is born at, as a share of its own: small, but there from the first frame. */
const SPECK = 0.18;

/** How big the drop and its arrow are, 0..1: a speck that grows fast, past full, and settles. */
export function grown(e: number): number {
  if (e <= 0) return 0;
  const u = clamp01(e / (SPAWN * 0.6));
  const out = 1 - (1 - u) ** 3;
  return SPECK + (1 - SPECK) * out + 0.14 * settle(Math.max(0, e - SPAWN * 0.45), 7, 18) * u;
}

/** When dot `i` (1-based) of `n` comes in. */
function dotAt(i: number, n: number): number {
  return FIRST_DOT + (i - 1) * Math.min(DOT_GAP, DOTS_SPAN / Math.max(1, n - 1));
}

/** Dot `i` of `n`, `e` seconds in: whether it is there yet, how big, and how much it blinks. */
export function dotIn(i: number, n: number, e: number): { size: number; blink: number } | null {
  const t = e - dotAt(i, n);
  if (t < 0) return null;
  const k = clamp01(t / BLINK);
  return {
    size: smoothstep(clamp01(t / 0.05)) + 0.5 * Math.sin(Math.PI * k) * (1 - k),
    blink: 1 - k,
  };
}

/** The place at the end of a path of `n` dots, `e` seconds in: one dot's gap after the
 * last, as if it were the next. */
export function placeIn(n: number, e: number): { size: number; blink: number } | null {
  const t = e - dotAt(n + 1, n);
  if (t < 0) return null;
  const k = clamp01(t / POP);
  return { size: smoothstep(k) + 0.25 * Math.sin(Math.PI * k), blink: 1 - k };
}

/** Whether the path is still coming in, so the ghost waits for it. */
export function entering(e: number): boolean {
  return e < FIRST_DOT + DOTS_SPAN + DOT_GAP + POP;
}
