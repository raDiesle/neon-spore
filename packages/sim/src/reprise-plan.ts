/**
 * **THE REPRISE's schedule, read off a script without playing it**: which
 * stretches of a wave are sent again, and after which authored row each one
 * comes down unseen.
 *
 * The director asks it, so an author can see on the map where the dark falls
 * (the owner, 25 September 2026: *the row in map editor when it's going to
 * happen*). It is `reprise.ts`'s clock run over the entries' beats alone, with
 * no bodies and no world — the one thing that clock reads besides the queue is
 * whether the field is empty, and that only decides when the mechanism leaves,
 * never when an echo opens. `packages/sim/test/reprise-plan.test.ts` plays the
 * real world beside it and holds the two to the same answer, which is what
 * lets it be a second walk of the clock rather than a guess at it.
 */

/** One echo, as the map shows it. */
export interface RepriseEcho {
  /** The queue index of the stretch's first body. */
  from: number;
  /** How many bodies it sends again. */
  count: number;
  /** The first authored row the stretch covers. */
  firstRow: number;
  /** The last authored row the stretch covers: the echo plays after it, and
   * the row below waits until the echo is over. */
  lastRow: number;
}

/**
 * Every echo a wave of these entry beats, in queue order, would send with a
 * stretch of `every` beats. The steps below are `sendEcho` and `spawnArrivals`
 * in the order `onBeat` calls them, one variable to each field of
 * `RepriseState`.
 */
export function reprisePlan(beats: readonly number[], every: number): RepriseEcho[] {
  const n = beats.length;
  const plan: RepriseEcho[] = [];
  let waveBeat = 0;
  let held = 0;
  let since = 0;
  let from = 0;
  let at = -1;
  let cursor = 0;
  let left = 0;
  let spawned = 0;
  let firstRow = 0;
  while (from < n || at >= 0) {
    waveBeat += 1;
    if (at < 0) {
      const seen = waveBeat - held;
      if (seen - since >= every) {
        const count = spawned - from;
        if (count === 0) since = seen;
        else {
          at = waveBeat;
          cursor = from;
          left = count;
          // The last row spawned was read against `seen - 1` on the beat
          // before, so the stretch runs to `seen - 2`.
          plan.push({ from, count, firstRow, lastRow: seen - 2 });
          firstRow = seen - 1;
        }
      }
    }
    if (at >= 0) {
      held += 1;
      const base = beats[from] ?? 0;
      const step = waveBeat - at;
      while (left > 0 && (beats[cursor] ?? 0) - base <= step) {
        cursor += 1;
        left -= 1;
      }
      if (left === 0) {
        at = -1;
        cursor = 0;
        since = waveBeat - held;
        from = spawned;
      }
    }
    const seen = waveBeat - held;
    while (spawned < n && (beats[spawned] ?? 0) <= seen - 1) spawned += 1;
  }
  return plan;
}
