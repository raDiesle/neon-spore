import type { OpeningStop } from "./opening.js";
import type { UntilSpec } from "./until.js";

/**
 * **`--until` and the two numbers that ride on it, read off the command
 * line**: how far to look, and how far back from or on from the event to take
 * the picture. What the flags *mean* is `until.ts`; this is only the words for
 * each way of writing them wrong. Cut out of that file when `--until-on` took
 * it past the ceiling.
 */

/**
 * How far `--until` looks by default: twenty-five seconds of play at 120Hz,
 * which is longer than any wave takes to put a body on the hull and short
 * enough that a name nobody ever fires comes back as an error rather than as a
 * capture that seems to have hung.
 */
export const DEFAULT_UNTIL_TICKS = 3000;

/**
 * The flag, with the two refusals that belong to it.
 *
 * Both are about a picture that would otherwise be taken at a tick the caller
 * did not mean: `--ticks` names one moment and `--until` names another, and a
 * rehearsal is painted rather than stepped, so nothing in front of that camera
 * fires a `SimEvent` at all (`guide-film.ts`).
 */
export function parseUntil(
  value: string | undefined,
  cap: number,
  had: { ticks: boolean; opening?: OpeningStop; back?: string; on?: string },
): UntilSpec | undefined {
  if (value === undefined) {
    // Said rather than ignored: a run asked to step back from nothing would
    // otherwise take the ordinary `--ticks 120` picture and look like an answer.
    if (had.back !== undefined) {
      throw new Error(
        `--until-back ${had.back} needs an event to count back from: --until needWave --until-back 200`,
      );
    }
    if (had.on !== undefined) {
      throw new Error(
        `--until-on ${had.on} needs an event to count on from: --until waveFailed --until-on 150`,
      );
    }
    return undefined;
  }
  const event = value.trim();
  if (!event || event.startsWith("--")) {
    throw new Error("--until needs an event to stop on: --until breach, --until waveFailed");
  }
  if (had.ticks) {
    throw new Error(
      `--until ${event} and --ticks both say when the picture is taken, and they disagree. ` +
        "Drop one: --until drives to the tick the event fires on, --until-ticks says how far to look",
    );
  }
  if (had.opening === "guide") {
    throw new Error(
      `--until ${event} with --opening guide: a rehearsal is painted off the frame clock rather ` +
        "than stepped, so the simulation in front of the camera fires no events. Use --ticks there",
    );
  }
  if (!Number.isFinite(cap) || cap < 1) throw new Error(`--until-ticks ${cap}: at least one tick`);
  const back = had.back === undefined ? undefined : Number(had.back);
  if (back !== undefined && (!Number.isFinite(back) || back < 1)) {
    throw new Error(
      `--until-back ${had.back}: at least one tick before ${event}. The event's own tick is ` +
        "--until on its own",
    );
  }
  const on = onTicks(event, cap, had);
  return {
    event,
    cap: Math.floor(cap),
    ...(back === undefined ? {} : { back: Math.floor(back) }),
    ...(on === undefined ? {} : { on }),
  };
}

/**
 * `--until-on`'s value, refused the ways `--until-back`'s is — and once more,
 * when it runs past the look: the cap is what keeps a capture from seeming to
 * hang, and a step on longer than the whole search is a number typed wrong.
 */
function onTicks(event: string, cap: number, had: { back?: string; on?: string }) {
  if (had.on === undefined) return undefined;
  if (had.back !== undefined) {
    throw new Error(
      `--until-back ${had.back} and --until-on ${had.on} both move the picture off ${event}, ` +
        "in opposite directions. Keep one",
    );
  }
  const on = Number(had.on);
  if (!Number.isFinite(on) || on < 1) {
    throw new Error(
      `--until-on ${had.on}: at least one tick after ${event}. The event's own tick is ` +
        "--until on its own",
    );
  }
  if (on > cap) {
    throw new Error(
      `--until-on ${had.on} steps further on than --until-ticks ${cap} looks. Raise --until-ticks`,
    );
  }
  return Math.floor(on);
}
