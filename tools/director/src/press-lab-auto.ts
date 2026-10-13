import type { Point } from "@neon-spore/content";
import { LAPSE, PRESS_AT, type PressAsk } from "./press-lab-rule.js";

/**
 * **AUTO's finger in THE PRESS LAB**, as `hold-lab-auto.ts` is THE HOLD LAB's:
 * the presses a mark asks, quick, one after another, and it is counted; then,
 * on a mark that asks more than one, half of them and the finger left resting
 * on the last, until the count lapses — the hold a press is not. Over and
 * over, so every state passes under the eye with no mouse.
 */

/** Seconds between AUTO's presses — a quick, easy tapping, four a second — and how
 * long its finger is down for each. */
export const TAP_GAP = 0.24;
const DOWN = 0.08;

/** One time the finger is down, from `at` to `until`. */
interface Down {
  at: number;
  until: number;
}

/** The loop for `ask`, and its landmarks for the sheet. */
export function loopOf(ask: PressAsk) {
  const n = ask.times;
  // Long enough for the call to be seen, KNOCK's rattle of ten included.
  const take = 1.9;
  const downs: Down[] = [];
  for (let i = 0; i < n; i++)
    downs.push({ at: take + i * TAP_GAP, until: take + i * TAP_GAP + DOWN });
  const counted = take + (n - 1) * TAP_GAP;
  const second = counted + 1.3;
  if (n === 1)
    return { take, counted, second, half: 0, rest: second, lapseAt: second, end: second, downs };
  const half = Math.floor(n / 2);
  for (let i = 0; i < half - 1; i++)
    downs.push({ at: second + i * TAP_GAP, until: second + i * TAP_GAP + DOWN });
  // The last of them is pressed and the finger left there, past the lapse.
  const rest = second + (half - 1) * TAP_GAP;
  const lapseAt = rest + LAPSE;
  downs.push({ at: rest, until: lapseAt + 0.3 });
  return { take, counted, second, half, rest, lapseAt, end: lapseAt + 1.0, downs };
}

export interface AutoFinger {
  at: Point;
  down: boolean;
}

/** Where the finger is `t` seconds into `ask`'s loop. */
export function autoFinger(ask: PressAsk, t: number): AutoFinger {
  const loop = loopOf(ask);
  const s = ((t % loop.end) + loop.end) % loop.end;
  const down = loop.downs.some((d) => s >= d.at && s < d.until);
  // Never quite the same place twice: a finger lands a pixel or two about.
  const at = { x: PRESS_AT.x + 2 * Math.sin(s * 7.3), y: PRESS_AT.y + 1.5 * Math.cos(s * 5.1) };
  return { at, down };
}
