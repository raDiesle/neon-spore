import type { OpeningStop } from "./opening.js";

/**
 * **Stopping on the tick something happened, instead of on a number.**
 *
 * `--ticks` is an absolute `world.tick`, which is the right primitive and the
 * wrong question. A capture is almost never after tick 1137; it is after *the
 * breach*, *the pop*, *the wave failing* — and that is a different tick in
 * every wave, on every seat, and again whenever a speed is retuned. The lane
 * that photographed a breach spent three sweeps of fourteen frames apiece
 * hunting one, and wrote the finding that became this file: half an hour of
 * captures for one frame, payable again by every lane that touches a strike,
 * a shed or a hole in the skin.
 *
 * Every one of those moments is already a `SimEvent` on the tick it happens
 * (`packages/sim/src/events.ts`), and the loop already steps the world one
 * tick at a time — so this is a predicate in the stepping loop, not a
 * mechanism. `--until breach` drives the wave until the simulation says
 * `breach` and photographs from there, with `--frames` and `--stride`
 * counting forward from that tick.
 *
 * **The event name is not checked against a list**, on purpose. The union in
 * `packages/sim` grows with every mechanic and a list here would be a second
 * copy of it going stale in the dark; what a person needs when they guess the
 * name wrong is not a spelling rule but *what did fire* — which the run knows,
 * because every tick's events are collected as it goes (`drive.ts`). So a miss
 * comes back naming the kinds that really fired and the tick of each one's
 * first, which is the sweep the finding asked for, done once and for free.
 */

/** A stopping condition: which event, and how far to look for it. */
export interface UntilSpec {
  /** The `SimEvent.type` to stop on, as a person types it. */
  event: string;
  /** How many ticks to look, counted from wherever the opening left off. */
  cap: number;
}

/** One event, on the tick it fired. Collected for every tick a capture steps. */
export interface Fired {
  tick: number;
  type: string;
  /**
   * The event's own scalar fields, as `key=value` — the socket, the column,
   * the id.
   *
   * A type and a tick say *that* something happened, and for half this game's
   * events the useful half is *which*: `scuttleLoose` names the socket a part
   * hangs off, and which socket it is was drawn from the seeded `Rng`. A
   * capture aiming `--hold scuttlePart=…,id=N` at it had no way to read that
   * number, so the press went to a socket the frame had not let go of and was
   * dropped without a sound — the silence `--hold` exists to end, arrived at
   * from the other side. Absent when the event carries nothing but its type.
   */
  detail?: string;
}

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
  had: { ticks: boolean; opening?: OpeningStop },
): UntilSpec | undefined {
  if (value === undefined) return undefined;
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
  return { event, cap: Math.floor(cap) };
}

/**
 * What fired, in the order it first did — the half of this the finding called
 * "cheaper still", and the half that turns a miss into an answer.
 *
 * One line, kinds rather than firings: `beat` fires every few ticks and a
 * capture that ran three thousand of them would otherwise print a page nobody
 * reads. The tick is the **first** of each kind, because that is the number a
 * reader is about to put after `--ticks`.
 */
export function firedNote(log: readonly Fired[]): string {
  if (log.length === 0) return "fired: nothing — the world was not stepped";
  const first = new Map<string, number>();
  const detail1 = new Map<string, string>();
  const count = new Map<string, number>();
  for (const one of log) {
    if (!first.has(one.type)) {
      first.set(one.type, one.tick);
      if (one.detail !== undefined) detail1.set(one.type, one.detail);
    }
    count.set(one.type, (count.get(one.type) ?? 0) + 1);
  }
  const said = [...first].map(([type, tick]) => {
    const n = count.get(type) ?? 1;
    // The first firing's fields and not every firing's: this line is read at a
    // glance to find a tick worth photographing, and a wave that throws forty
    // parts would otherwise print forty sockets.
    const detail = detail1.get(type);
    return `${type}@${tick}${detail === undefined ? "" : ` (${detail})`}${n > 1 ? ` (x${n})` : ""}`;
  });
  return `fired: ${said.join(", ")}`;
}

/** The words for a name that never fired: how far it looked, and what did. */
export function missedNote(until: UntilSpec, from: number, log: readonly Fired[]): string {
  return (
    `--until ${until.event}: nothing of that type fired in ${until.cap} ticks from ` +
    `world.tick ${from}. ${firedNote(log)}. Look further with --until-ticks, or name one of those`
  );
}
