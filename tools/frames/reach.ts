import type { Driver } from "./drive.js";
import { pressPlan } from "./press-plan.js";
import type { PressSpec } from "./press-spec.js";
import { missedNote, type UntilSpec } from "./until.js";

/**
 * **How the first picture's tick is reached** — the presses on their way, and
 * then either the rest of the ticks or the wait for something to happen.
 *
 * Cut out of `capture.ts` when `--until` needed a second way to end that first
 * run and that file stood at 237 of its 250 lines. The seam is a real one:
 * everything here walks a tick line and knows nothing about browsers, files or
 * crops, and everything left next door is about the picture taken once the
 * line has been walked. A strip's later frames do not come through here — they
 * are `--stride` ticks apiece and have nothing to reach.
 */
export interface Reach {
  /** Ticks to spend getting to the first frame, when a number says where it
   * is. Ignored when `until` is given, which says where it is instead. */
  advanceBy: number;
  /** The presses, already moved onto this run's own relative tick line. */
  press?: PressSpec[];
  /** Stop on the tick this event fires on, rather than after a count. */
  until?: UntilSpec;
  /** Whether any `--hold` waits for the end of this run rather than riding
   * it, so a miss can say it was never in it (`missedNote`). */
  holdsAfter?: boolean;
}

/**
 * Walk it, and answer with the tick the wait ended on — `null` when nothing
 * was waited for.
 *
 * A miss is an error rather than a picture: a capture asked for the breach and
 * handed back tick 3000 of a wave that never had one would be a frame the
 * reader trusts for the wrong reason. The words name what did fire, which is
 * the sweep the caller would otherwise go and do (`until.ts`).
 */
export async function reachFirstFrame(
  d: Driver,
  from: number,
  reach: Reach,
): Promise<number | null> {
  const { until } = reach;
  // The whole run, whichever thing ends it: a cap when there is an event to
  // wait for, the caller's own count when there is not. The presses are laid
  // along it either way, and `pressPlan`'s rule — a press is only heard on a
  // tick that runs after it — is the same rule under both.
  const span = until ? until.cap : reach.advanceBy;
  const plan = pressPlan(reach.press ?? [], span);
  let at: number | null = null;
  for (const [i, step] of plan.entries()) {
    const last = i === plan.length - 1;
    if (last && until) at = await d.advance(step.advance, until.event);
    else if (step.advance > 0) await d.advance(step.advance);
    if (step.press) await d.press(step.press);
  }
  if (until && at === null) throw new Error(missedNote(until, from, d.heard(), reach.holdsAfter));
  return at;
}
