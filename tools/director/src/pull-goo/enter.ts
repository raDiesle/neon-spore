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
 */

/** Seconds after the drop starts to grow that the first dot comes in. */
const FIRST_DOT = 0.05;
/** Seconds between one dot and the next, at most; a long path is quicker per dot. */
const DOT_GAP = 0.06;
/** Seconds all the dots together may take, however many there are. */
const DOTS_SPAN = 0.55;
/** Seconds a dot's blink lasts, and the place's pop. */
const BLINK = 0.22;
const POP = 0.28;

/** How big the drop and its arrow are, 0..1 with an overshoot that settles. */
export function grown(e: number): number {
  const u = clamp01(e / SPAWN);
  return smoothstep(u) + 0.12 * settle(Math.max(0, e - SPAWN * 0.7), 8, 20) * u;
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
    size: smoothstep(clamp01(t / 0.1)) + 0.5 * Math.sin(Math.PI * k) * (1 - k),
    blink: 1 - k,
  };
}

/** The place at the end of a path of `n` dots, `e` seconds in, after the last dot. */
export function placeIn(n: number, e: number): { size: number; blink: number } | null {
  const t = e - dotAt(n, n) - 0.06;
  if (t < 0) return null;
  const k = clamp01(t / POP);
  return { size: smoothstep(k) + 0.25 * Math.sin(Math.PI * k), blink: 1 - k };
}

/** Whether the path is still coming in, so the ghost waits for it. */
export function entering(e: number): boolean {
  return e < FIRST_DOT + DOTS_SPAN + 0.06 + POP;
}
