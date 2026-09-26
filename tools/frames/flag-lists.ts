import { parseHoldFlag } from "./hold.js";
import { parsePress } from "./press.js";
import type { HoldSpec, PressSpec } from "./spec.js";

/**
 * **The flags that repeat**: `--hold` and `--press`, each read every time it
 * is written, and the one tick line they are walked on. Cut from `flags.ts`
 * on 26 September 2026 at its line limit, along the seam between a flag read
 * once and a flag read as a list.
 */

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
 * **Every `--press` on the command line, not the first one**, for the reason
 * above and found the same way.
 *
 * This flag was read with one `after("press")`, so a capture written as
 * `--press 300:1:cannonCol=5 --press 320:2:fire=red` ran with one of the two
 * and dropped the other without a word. The lane that drew THE HUSK lost two
 * captures and a read through `press-command.ts` to it, looking for a verb
 * that was never wrong: what came back was a wave playing itself, which is
 * exactly what a capture of a wave nobody pressed anything into looks like.
 *
 * Two flags is the natural way to write a line of gestures — it is how
 * `--hold` is written, one neighbour along — and the comma form goes on
 * working unchanged, because `parsePress` splits on commas and every value is
 * put through it. They are concatenated and `tickLine` sorts the lot, so the
 * order the flags are typed in never has to be the order they are sent.
 */
export function collectPresses(argv: readonly string[], wave: number): PressSpec[] {
  // `argv[i + 1] ?? ""` rather than a skip: `--press` at the end of the line
  // is a flag with nothing after it, and `parsePress` refuses an empty value
  // by name. A silent skip there would be this file's own bug again.
  return argv.flatMap((a, i) => (a === "--press" ? parsePress(argv[i + 1] ?? "", wave) : []));
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
