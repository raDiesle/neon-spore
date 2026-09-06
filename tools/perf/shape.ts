import type { Run, WaveCost } from "./compare.js";

/**
 * PUTTING TWO RUNS ON THE SAME FOOTING, and one row from one of them into the
 * other.
 *
 * Split off `compare.ts` when that file went past the line limit, and the seam
 * was already there. Next door is the *verdict* — what "worse" means, what a
 * wave has to clear to earn the word — and everything here is the step before
 * it: turning a millisecond count, which is a fact about an afternoon, into a
 * figure two afternoons can be held against each other on.
 */

function median(run: Run, of: (w: WaveCost) => number): number {
  if (run.waves.length === 0) return 0;
  const sorted = run.waves.map(of).sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] as number;
}

/** The figure a whole run is summarised by, in what a player actually gets. */
export function medianMs(run: Run): number {
  return median(run, (w) => w.mean);
}

/**
 * Every wave's cost as a multiple of its own run's median.
 *
 * Two defences against the same problem, stacked. `typical` throws away the
 * frames the machine interfered with; dividing by the run's own median throws
 * away a slowdown that reached every frame evenly. What is left is the game's own
 * shape, which is comparable across machines, across days, and across a desk
 * that got busy halfway through.
 */
export function shapeOf(run: Run): Map<number, number> {
  const mid = median(run, (w) => w.typical);
  const out = new Map<number, number>();
  if (mid === 0) return out;
  for (const w of run.waves) out.set(w.wave, w.typical / mid);
  return out;
}

/** Two decimals, the same as the figures `measure.ts` writes down. */
function round(v: number): number {
  return Math.round(v * 100) / 100;
}

/**
 * How much slower this run's machine was than the one the baseline was taken
 * on, read off the waves both of them measured and neither of them changed.
 *
 * This is what the reference waves are carried for (`waves.ts`). No lane touches
 * one, so the whole of the difference between the baseline's figure for THE WALL
 * and today's is the machine and the weather — and the median of five such
 * ratios is a robust estimate of it, unbothered by the one that happened to be
 * interrupted. `null` when the two runs share no untouched wave, which is a
 * merge with nothing to stand on rather than one to guess at.
 */
export function machineScale(
  baseline: Run,
  run: Run,
  replacing: ReadonlySet<number>,
): number | null {
  const was = new Map(baseline.waves.map((w) => [w.wave, w.typical]));
  const ratios: number[] = [];
  for (const now of run.waves) {
    if (replacing.has(now.wave) || !(now.typical > 0)) continue;
    const then = was.get(now.wave);
    if (then === undefined || !(then > 0)) continue;
    ratios.push(then / now.typical);
  }
  if (ratios.length === 0) return null;
  ratios.sort((a, b) => a - b);
  return ratios[Math.floor(ratios.length / 2)] as number;
}

/**
 * One run's rows for the named waves, put into an existing baseline.
 *
 * The thing this exists to stop: `baseline.test.ts` names the waves whose
 * arrivals have changed and asks for *those* to be re-measured, which used to be
 * advice nobody could take. `--save` refused a narrow run, so the only way to
 * fix one stale row was a three-minute sweep of all forty-seven — which also
 * silently re-baselined the other forty-six off whatever the machine was doing
 * that afternoon. Forty-six good rows are worth more than that.
 *
 * **The fresh row is put on the baseline's footing before it goes in, and that
 * is the whole of why this is sound.** Every verdict is a wave's share of its
 * run's median, so a row that keeps the milliseconds of a narrow afternoon is
 * read against a median taken over five reference waves rather than over the
 * forty-seven the rest of the file was — which is a different population, and
 * comes out as a regression in a wave nobody touched. The measured ratio of the
 * untouched waves (`machineScale`) converts the row into what the baseline's own
 * run would have recorded for it.
 *
 * The row says so: `mergedFrom` carries the day, the commit and the factor, so
 * a stitched baseline is legible in the file rather than only to whoever
 * remembers stitching it. `null` when there is nothing to take a scale off.
 *
 * A wave asked for that this run did not measure is left as it was, rather than
 * dropped: a baseline missing a row is a wave nothing can notice getting slower.
 */
export function mergeInto(baseline: Run, run: Run, waves: readonly number[]): Run | null {
  const taking = new Set(waves);
  const scale = machineScale(baseline, run, taking);
  if (scale === null) return null;
  const fresh = new Map(
    run.waves
      .filter((w) => taking.has(w.wave))
      .map((w) => [
        w.wave,
        {
          ...w,
          typical: round(w.typical * scale),
          mean: round(w.mean * scale),
          p90: round(w.p90 * scale),
          mergedFrom: { measuredAt: run.measuredAt, commit: run.commit, scale: round(scale) },
        } satisfies WaveCost,
      ]),
  );
  return { ...baseline, waves: baseline.waves.map((w) => fresh.get(w.wave) ?? w) };
}

/** A finished run, ready to be printed or written down. */
export function assemble(parts: Omit<Run, "measuredAt">): Run {
  return { measuredAt: new Date().toISOString().slice(0, 10), ...parts };
}
