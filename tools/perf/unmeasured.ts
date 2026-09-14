import { WAVES } from "@neon-spore/content";
import { arrivalsOf } from "./arrivals.js";
import type { Run, WaveCost } from "./compare.js";
import { waveId, waveName } from "./measure.js";
import { renumber } from "./renumber.js";
import { isUnmeasured, keyOf } from "./shape.js";

/**
 * A BASELINE ROW FOR A WAVE NOBODY HAS MEASURED.
 *
 * **What it is for, and what it stopped being for.** `baseline.test.ts` used to
 * require one row per wave the game ships, so a session that added a wave
 * could not pass `bun run check` without running perf — which `CLAUDE.md` tells
 * a cloud session not to do, because it never finishes honestly there: a narrow
 * run that takes 25 seconds on the owner's machine was killed twice on a cloud
 * runner, at 400 and at 580 seconds, with nothing printed either time
 * (`docs/performance.md`). The row below was the way through that, settled on 9
 * September 2026.
 *
 * On 14 September 2026 the owner took the rule out instead: **the test no
 * longer requires a row for a wave it has never seen**, so nothing forces this
 * row and a lane that adds a wave simply lands. What is left here is still
 * worth having, in two halves. The row is how a *local* session says out loud
 * that a wave is owed a figure, rather than leaving a silence somebody has to
 * notice. And `fillUnmeasured`'s other half is load-bearing still: a row whose
 * wave no longer sends what it was measured on says something *untrue*, which
 * is a different thing from saying nothing, and `baseline.test.ts` fails it.
 * Blanking such a row is the only way out of that failure short of a perf run.
 *
 * **Why a flag and not figures of `null`.** Both were on the table. `null`
 * would put `number | null` through `shapeOf`, `medianMs`, `machineScale`,
 * `verdictFor`, `budgetPct` and the printed table — every one of them
 * arithmetic — and a nullable number that slips through becomes `NaN`, which
 * this tool has already been bitten by once: a baseline written before
 * `typical` existed made every comparison against `NaN` false, so a run called
 * all thirty-eight waves `same` and reported that nothing had changed
 * (`compare.ts`). A flag is one predicate, asked before any figure is read, and
 * `isUnmeasured` in `shape.ts` is the single copy of it.
 *
 * The figures on such a row are zeroes rather than anything cleverer, because
 * `WaveCost` requires numbers and a placeholder that looked plausible would be
 * worse than one that plainly is not.
 */

/** The row itself. `bodies` is 0 for the same reason the timings are: nobody
 * looked. */
export function unmeasuredRow(index: number): WaveCost {
  return {
    id: waveId(index),
    wave: index + 1,
    name: waveName(index),
    bodies: 0,
    typical: 0,
    mean: 0,
    p90: 0,
    unmeasured: true,
  };
}

/**
 * Every wave the baseline has no row for, given one, and every row whose wave
 * no longer sends what it sent when the row was measured, blanked to one —
 * `bun run perf --unmeasured`, which opens no browser and measures nothing.
 *
 * **The second is the half that still has to exist.** A row records what the
 * wave sent when it was weighed (`arrivalsOf`), and `baseline.test.ts` fails a
 * row whose wave sends something else now: its figures are for a wave that no
 * longer exists. That is not the case the tolerance of 14 September 2026
 * covers — a stale row says something untrue, where an absent row says nothing
 * — so the check still rejects it and this is still the way out. Re-measuring
 * is a perf run, and a lane never owes one (`CLAUDE.md`) — on 12 September
 * 2026 a content lane trimmed twenty-eight guided waves in one commit, and the
 * choice was twelve minutes of narrow runs or this. So the row says nobody has
 * weighed *this* wave yet, which is the truth, and the next sweep fills it in.
 *
 * The first half, adding a row for a wave with none, no longer answers a
 * failing check — nothing demands the row. It stays because a local session
 * may still want the file to say a figure is owed out loud.
 *
 * It is here rather than left as a hand-edit of `baseline.json` because the
 * hand-edit is the one that goes wrong: inserting a wave moves the number of
 * every wave after it, so appending a row and hoping is how a file ends up
 * with fifty-one rows, one name twice and no row at all for the wave that
 * moved. `renumber` is what the file already has for that, and this goes
 * through it — the rows come back in play order, on today's numbers and names.
 *
 * A run that adds nothing is not an error: it is the answer that the baseline
 * already covers the game, which is what the caller wanted to know.
 */
export function fillUnmeasured(baseline: Run): {
  run: Run;
  /** The waves given a row. */
  added: string[];
  /** The waves whose measured row was for something they no longer send. */
  blanked: string[];
} {
  const known = new Map(baseline.waves.map((w) => [keyOf(w), w]));
  const rows = [...baseline.waves];
  const added: string[] = [];
  const blanked: string[] = [];
  for (let index = 0; index < WAVES.length; index++) {
    const have = known.get(waveId(index));
    if (have === undefined) {
      rows.push(unmeasuredRow(index));
      added.push(`${index + 1} ${waveName(index)}`);
    } else if (!isUnmeasured(have) && have.arrivals !== arrivalsOf(index)) {
      rows[rows.indexOf(have)] = unmeasuredRow(index);
      blanked.push(`${index + 1} ${waveName(index)}`);
    }
  }
  const { run } = renumber({ ...baseline, waves: rows });
  return { run, added, blanked };
}
