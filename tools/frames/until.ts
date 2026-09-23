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
 *
 * **The other end of a rest is `--until-back N`.** Stopping on the tick an
 * event fires is the wrong end of everything that *stands between* two of
 * them, and that is half of what a capture is for — the screen between the
 * waves, the pause before a boss turns. So the flag keeps the frame N ticks
 * before the event instead, by driving the wave a second time to the number
 * the first drive found (`backTick`).
 *
 * **And `--until-on N` is the rest after one**, the pair's other half: the
 * lost wave's own screen comes up about 150 ticks after `waveFailed` and its
 * whole arrival is 31 ticks long, so photographing it was four runs of
 * `--ticks` bisecting for the window. A world does go forwards, so this one is
 * the same drive stepped N further on from the event, not a second run.
 */

/** A stopping condition: which event, and how far to look for it. */
export interface UntilSpec {
  /** The `SimEvent.type` to stop on, as a person types it. */
  event: string;
  /** How many ticks to look, counted from wherever the opening left off. */
  cap: number;
  /**
   * **Photograph the tick `back` before the event**, rather than the one it
   * fired on. Undefined is the plain flag, and the event's own tick.
   *
   * Half of what a person wants to see *stands between* two events rather than
   * happening at one: the screen between the waves is up for the 450 ticks
   * that end when `needWave` fires, so `--until needWave` is a picture of the
   * field after it has gone. One capture of that screen cost a sweep of all
   * ninety-seven waves in the headless simulation, hunting the single one that
   * clears with nothing pressed (THE FENCE, wave 50, at tick 2475) so that a
   * hand-counted offset could go after `--ticks`.
   */
  back?: number;
  /** **Photograph the tick `on` after the event** — `back`'s mirror, for a
   * screen that arrives a fixed rest after something happens. */
  on?: number;
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
 * **Where the second pass stops**, for a run that asked to step back.
 *
 * A world only goes forwards, so the run that found the event cannot
 * photograph anything before it. It is a second run of the same seed told to
 * stop on a number — the tool restarts a world from a seed every capture
 * anyway, which makes the drive the cheap half and a ring of the last N
 * painted frames memory kept for nothing.
 *
 * Refused rather than clamped when the step back reaches past the wave's own
 * opening: a picture quietly taken at the first tick there was would be one a
 * reader trusts for the wrong reason, which is the rule `--ticks` is already
 * held to (`capture.ts`).
 */
export function backTick(until: UntilSpec, at: number, from: number): number {
  const back = until.back ?? 0;
  if (at - back < from) {
    throw new Error(
      `--until-back ${back}: ${until.event} fired on world.tick ${at}, and the wave's opening ` +
        `already leaves it at ${from} — ${at - from} ticks to step back through, not ${back}`,
    );
  }
  return at - back;
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

/**
 * The words for a name that never fired: how far it looked, and what did.
 *
 * **A bare `--hold` is not in that wait.** It goes on after the run, for the
 * picture (`hold.ts`), so an event only the hold could cause never comes: THE
 * SURGE's two thumbs on the bulb looked like a flag that did nothing
 * (`docs/queue.md`, 21 September 2026). When there were any, the words say
 * where to put them.
 */
export function missedNote(
  until: UntilSpec,
  from: number,
  log: readonly Fired[],
  holdsAfter = false,
): string {
  const holds = holdsAfter
    ? ". Every bare --hold goes on only after this wait; " +
      "write --hold <name>=<distance>@<tick> to hold during it"
    : "";
  return (
    `--until ${until.event}: nothing of that type fired in ${until.cap} ticks from ` +
    `world.tick ${from}. ${firedNote(log)}. Look further with --until-ticks, or name one of those` +
    holds
  );
}
