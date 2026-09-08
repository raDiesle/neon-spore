import { parseHoldFlag } from "./hold.js";
import type { HoldSpec, PressSpec } from "./spec.js";

/**
 * **Every `--hold` on the command line, not the first one.**
 *
 * `run.ts` read this flag with `argv.indexOf("--hold")` and took the one value
 * after it, so a second `--hold` was silently ignored — and THE BALLOON is a
 * creature whose whole gesture is *two hands at once*, the skin giving only
 * while both sides are taut on the same body (`sim/balloon-pull.ts`). Neither
 * the stretched-both-ways skin nor the split it causes could be photographed,
 * and the lane that gave that body a new skin had to argue half of it in
 * words. So the flag repeats, in argument order, and the command lists
 * `parseHoldFlag` returns are concatenated.
 *
 * A value carrying `@TICK` is a hold that joins the **press** line rather than
 * the one that runs after the wave's ticks, so the two come back separated:
 * `hold` is what `capture.ts` presses at the end with `holdTicks` to show in,
 * and `pressed` is what belongs on the sorted tick line beside `--press`.
 */
export function collectHolds(argv: readonly string[]): {
  hold?: HoldSpec[];
  pressed: PressSpec[];
} {
  const values = argv.flatMap((a, i) => (a === "--hold" ? [argv[i + 1] ?? ""] : []));
  const hold: HoldSpec[] = [];
  const pressed: PressSpec[] = [];
  for (const value of values) {
    const parsed = parseHoldFlag(value);
    for (const one of parsed.commands) {
      if (parsed.tick === undefined) hold.push(one);
      else pressed.push({ ...one, tick: parsed.tick });
    }
  }
  return { hold: hold.length > 0 ? hold : undefined, pressed };
}

/**
 * The one tick line a capture walks: the presses and the ticked holds, in the
 * order they are heard.
 *
 * Sorted here rather than in `parsePress`, because a hold and a press written
 * on the same tick have an order that matters — the hand goes on before the
 * shot is fired, which is the order they are concatenated in — and
 * `Array.prototype.sort` keeps it.
 */
export function tickLine(press: readonly PressSpec[], held: readonly PressSpec[]): PressSpec[] {
  if (press.length === 0 && held.length === 0) return [];
  return [...held, ...press].sort((a, b) => a.tick - b.tick);
}
