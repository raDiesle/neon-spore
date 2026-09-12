import { WAVES } from "@neon-spore/content";
import { arrivalsOf } from "./arrivals.js";
import type { Run, WaveCost } from "./compare.js";
import { waveId, waveName } from "./measure.js";
import { renumber } from "./renumber.js";
import { isUnmeasured, keyOf } from "./shape.js";

/**
 * A BASELINE ROW FOR A WAVE NOBODY HAS MEASURED.
 *
 * **What it is for.** `baseline.test.ts` requires one row per wave the game
 * ships, and that rule is what keeps the baseline from comparing today against
 * a game that no longer exists. A session that adds a wave therefore cannot
 * pass `bun run check` without running perf — and running perf is what
 * `CLAUDE.md` tells a cloud session not to do, because it never finishes
 * honestly there: a narrow run that takes 25 seconds on the owner's machine
 * was killed twice on a cloud runner, at 400 and at 580 seconds, with nothing
 * printed either time (`docs/performance.md`).
 *
 * The owner settled the collision on 9 September 2026: **the test tolerates a
 * row marked unmeasured.** So a wave with no measurement gets a row saying
 * exactly that, the check passes, the session names `bun run perf` in its
 * unverified list, and the next full sweep on a machine somebody is holding
 * fills the figures in and the marker goes.
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
 * The second is the same case as the first. A row records what the wave sent
 * when it was weighed (`arrivalsOf`), and `baseline.test.ts` fails a row
 * whose wave sends something else now: its figures are for a wave that no
 * longer exists. Re-measuring it is a perf run, and a lane never owes one
 * (`CLAUDE.md`) — on 12 September 2026 a content lane trimmed twenty-eight
 * guided waves in one commit, and the choice was twelve minutes of narrow
 * runs or this. So the row says nobody has weighed *this* wave yet, which is
 * the truth, and the next sweep fills it in as it fills in a new one.
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
