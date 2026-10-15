import { WAVES } from "@neon-spore/content";
import { keyOf, mergeInto, type Run } from "./compare.js";
import { waveId } from "./measure.js";
import { sameMeasure } from "./noise.js";
import { renumber } from "./renumber.js";

/**
 * `bun run perf --wave X --save`: a narrow run's rows put into the baseline.
 *
 * Out of `run.ts` when the measure check took that file to its line ceiling,
 * along the seam it already had — that file runs a browser, this one writes a
 * file. A refusal comes back as the lines to print rather than as an exit, so
 * `run.ts` can close the browser and the preview server before it stops.
 *
 * `asked` is the indices the command line named; the reference waves carried
 * along are not among them and are never written.
 */
export async function mergeSave(
  file: URL,
  before: Run | null,
  now: Run,
  asked: readonly number[],
): Promise<string[] | null> {
  const taken = asked.map((i) => i + 1);
  if (before && !sameMeasure(before, now)) {
    return [
      `✗ the baseline was timed under measure ${before.measure ?? 1}, this run under ` +
        `${now.measure ?? 1} — merging would mix the two in one file`,
      "  take the sweep first: bun run perf --save",
    ];
  }
  // Merging into nothing, or leaving the file short of the game afterwards,
  // would leave a baseline no comparison can be taken off. What the check
  // cannot be is "the baseline already covers every wave": a lane that adds
  // one is exactly the lane whose baseline does not, and refusing there sent
  // it to the full sweep this flag exists to spare. So the question is asked
  // about the file this run is about to *write* — every wave covered, by the
  // rows that are there plus the ones being merged in (`mergeInto`).
  // By id rather than by number, for the same reason the merge is: an
  // inserted wave moves every number after it, so a baseline's numbers are
  // yesterday's and counting today's against them says nothing.
  const covered = new Set([
    ...(before?.waves ?? []).map((w) => keyOf(w)),
    ...asked.map((i) => waveId(i)),
  ]);
  if (!before || covered.size !== WAVES.length) {
    return [
      "✗ --wave --save would leave the baseline short of the game",
      `  ${WAVES.length} waves, ${covered.size} covered — take the sweep first: bun run perf --save`,
    ];
  }
  const merged = mergeInto(before, now, taken);
  if (!merged) {
    return [
      "✗ this run shares no untouched wave with the baseline — nothing to scale it by",
      "  the reference waves are what a merged row is put on the baseline's footing with",
    ];
  }
  const { run: written, dropped } = renumber(merged);
  await Bun.write(file, `${JSON.stringify(written, null, 2)}\n`);
  const rows = written.waves.filter((w) => taken.includes(w.wave));
  const scale = rows[0]?.mergedFrom?.scale ?? 1;
  console.log(
    `\nbaseline merged: ${rows.map((w) => `${w.wave} ${w.name}`).join(", ")} — the other ` +
      `${written.waves.length - rows.length} rows are untouched`,
  );
  console.log(
    `  scaled by ${scale.toFixed(2)}x onto the baseline's footing, read off the reference waves ` +
      `neither run changed`,
  );
  if (dropped.length > 0) {
    console.log(`  dropped, no longer in the game: ${dropped.join(", ")}`);
  }
  return null;
}
