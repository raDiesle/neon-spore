import { WAVES } from "@neon-spore/content";
import type { Run, WaveCost } from "./compare.js";
import { waveId, waveName } from "./measure.js";

/**
 * Its own file rather than the tail of `run.ts`, which is where the queue item
 * asked for it: that file is a script and was one line under its 250-line
 * ceiling. The constraint the item was actually about is kept — this is a file
 * allowed to import `@neon-spore/content`, and `shape.ts` still is not.
 */

/**
 * **Every row put back on today's numbers, and any row whose wave is gone
 * dropped.**
 *
 * `mergeInto` matches a row on its id, which is what stops a wave that moved
 * from being written twice — but it renumbers nothing. A merged row carries
 * today's `wave` because it was just measured, and every row beside it keeps
 * whatever number the baseline was written with. That converges by itself
 * whenever the waves that moved are the waves being re-measured, and it does
 * not converge for a wave that merely *shifted*: its arrivals are identical,
 * nothing asks for it, and `baseline.test.ts` then fails on play order with no
 * advice but the three-minute sweep this merge exists to spare.
 *
 * So the numbers are read off the game rather than off the file, here, in the
 * one file `tools/perf` allows to import `@neon-spore/content` — `shape.ts`
 * deliberately does not, because a content import there would make a cycle
 * (`arrivals.ts`). `waveId` and `waveName` are called rather than spelled out:
 * both carry a fallback for a wave that has neither, and a second copy of
 * either would drift.
 *
 * A row with an id nothing answers to is a wave that has been deleted. It is
 * dropped and named on the way out, because a baseline is compared against the
 * game and a row for a wave nobody can play is a row nothing will ever measure
 * again.
 */
export function renumber(run: Run): { run: Run; dropped: string[] } {
  const today = new Map(WAVES.map((_, i) => [waveId(i), { wave: i + 1, name: waveName(i) }]));
  const dropped: string[] = [];
  const rows: WaveCost[] = [];
  for (const w of run.waves) {
    // A row written before `Wave.id` existed cannot be looked up at all, and is
    // left exactly where it is: it is already stale by its arrivals, and
    // dropping it would read as "this wave was deleted", which is not what
    // happened (`keyOf`).
    if (w.id === undefined) {
      rows.push(w);
      continue;
    }
    const now = today.get(w.id);
    if (now === undefined) {
      dropped.push(`${w.wave} ${w.name}`);
      continue;
    }
    rows.push({ ...w, ...now });
  }
  rows.sort((a, b) => a.wave - b.wave);
  return { run: { ...run, waves: rows }, dropped };
}
