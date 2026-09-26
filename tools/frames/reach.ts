import type { Driver } from "./drive.js";
import { pressPlan } from "./press-plan.js";
import type { PressSpec } from "./press-spec.js";
import { pressNote } from "./report.js";
import { missedNote, type UntilSpec } from "./until.js";

/**
 * **How the first picture's tick is reached** — the presses on their way, and
 * then either the rest of the ticks or the wait for something to happen.
 *
 * Cut out of `capture.ts` when `--until` needed a second way to end that first
 * run and that file stood at 237 of its 250 lines. The seam is a real one:
 * everything here walks a tick line and knows nothing about browsers, files or
 * crops, and everything left next door is about the picture taken once the
 * line has been walked. A strip's later frames are `strideOn`, below: `--stride`
 * ticks apiece, with nothing to reach but the presses that fall inside them.
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
  // **Watched on every stretch between two presses, not only the last.** A
  // run that goes on pressing after the event — a guard every beat, and
  // `--until shieldPush` — once walked past it blind and called it missed.
  let sent = 0;
  for (const step of plan) {
    if (step.advance > 0) at = await d.advance(step.advance, until?.event);
    if (at !== null) break;
    if (step.press) await d.press(step.press);
    sent++;
  }
  // `--until-on` steps on from the event, and a press that falls inside those
  // ticks is still heard, on the same rule as the search's.
  const on = until?.on;
  if (at !== null && on !== undefined) {
    const into = at - from;
    const rest = plan
      .slice(sent)
      .flatMap((s) => (s.press ? [{ ...s.press, tick: s.press.tick - into }] : []))
      .filter((p) => p.tick >= 0 && p.tick <= on);
    await strideOn(d, on, rest);
  }
  if (until && at === null) {
    // The presses the round refused are the likeliest reason, and the report
    // that names them is never printed when the run ends here.
    const unheard = pressNote(d.sent(), d.heard());
    const missed = missedNote(until, from, d.heard(), reach.holdsAfter);
    throw new Error(unheard === null ? missed : `${missed}\n${unheard}`);
  }
  return at;
}

/** A strip's later frame: `by` ticks on, with the presses that fall inside
 * them heard on the way (`pressesByFrame`). */
export async function strideOn(d: Driver, by: number, press: readonly PressSpec[]): Promise<void> {
  for (const step of pressPlan(press, by)) {
    if (step.advance > 0) await d.advance(step.advance);
    if (step.press) await d.press(step.press);
  }
}
