import {
  budgetPct,
  compareRuns,
  FRAME_MS,
  medianMs,
  type Run,
  verdictFor,
  type WaveCost,
} from "./compare.js";
import { comparable, DRIFT_MIN_WAVES, driftIsMeasurable, NOISE_PCT } from "./noise.js";

/**
 * WHAT A RUN LOOKS LIKE WHEN IT IS PRINTED.
 *
 * Split off `run.ts` the day the reference waves arrived and took it past the
 * line limit, and the seam was already there: everything left next door is the
 * *running* — the flags, the browser, the throttle, the file the baseline is
 * written to — and all of this is one table and one comparison, read by a
 * person and by nothing else.
 *
 * `carried` is the set of wave numbers the run did not ask for and measured
 * anyway, so both halves can say which rows are the reference set rather than
 * the subject (`waves.ts`).
 */

/** How much of a frame a figure is, as a bar. */
function bar(ms: number, width = 28): string {
  const filled = Math.min(width, Math.round((ms / FRAME_MS) * width));
  return "#".repeat(filled).padEnd(width, ".");
}

export function printRun(waves: WaveCost[], carried: ReadonlySet<number>): void {
  console.log("");
  console.log(`  #  wave                  bodies     ms   p90   of a 60Hz frame`);
  for (const w of waves) {
    // A row nobody has weighed prints its name and says so, rather than a bar
    // of nothing and 0% of a frame — which is the one reading that would be
    // read as "free" (`unmeasured.ts`).
    if (w.unmeasured === true) {
      console.log(`? ${String(w.wave).padStart(2)}  ${w.name.padEnd(20).slice(0, 20)}  UNMEASURED`);
      continue;
    }
    // A wave over budget is marked before a wave that is merely carried: the
    // budget is what the column is for, and a reference wave in trouble is
    // still a wave in trouble.
    const mark =
      verdictFor(w.mean) === "fine"
        ? carried.has(w.wave)
          ? "·"
          : " "
        : verdictFor(w.mean) === "tight"
          ? "!"
          : "X";
    console.log(
      `${mark} ${String(w.wave).padStart(2)}  ${w.name.padEnd(20).slice(0, 20)}  ` +
        `${String(w.bodies).padStart(4)}  ${w.mean.toFixed(2).padStart(5)}  ` +
        `${w.p90.toFixed(1).padStart(4)}  ${bar(w.mean)} ${budgetPct(w.mean).toFixed(0).padStart(3)}%`,
    );
  }
}

/**
 * The only question this tool exists to answer twice: better or worse.
 *
 * The percentage is a wave's share of its own run's median, never its raw
 * milliseconds — `compare.ts` says why, and the short version is that a busy
 * machine moves every wave at once and only the share can tell that apart from
 * a change somebody made. The milliseconds are printed beside it because a
 * reader wants them, not because the verdict was taken on them.
 */
export function printComparison(before: Run, after: Run, carried: ReadonlySet<number>): void {
  console.log("");
  console.log(`against the baseline of ${before.measuredAt} (${before.commit.slice(0, 7)}):`);

  // Like for like, the same way `compareRuns` does it: a narrow run's median is
  // taken over six waves and the baseline's over forty-seven, so comparing them
  // whole would report the *mix* as drift and blame the machine for it.
  const covered = new Set(after.waves.map((w) => w.wave));
  const wasMedian = medianMs(
    after.waves.length === before.waves.length
      ? before
      : { ...before, waves: before.waves.filter((w) => covered.has(w.wave)) },
  );
  const nowMedian = medianMs(after);
  const drift = wasMedian === 0 ? 0 : ((nowMedian - wasMedian) / wasMedian) * 100;
  if (!comparable(before, after)) {
    console.log(
      `  not the same measurement — baseline ${before.throttle}x on a machine scoring ` +
        `${before.calibration}, this run ${after.throttle}x scoring ${after.calibration}. ` +
        `The milliseconds below are for reading, not for comparing.`,
    );
  } else if (driftIsMeasurable(after) && Math.abs(drift) > NOISE_PCT) {
    console.log(
      `  the whole run moved ${drift > 0 ? "+" : ""}${drift.toFixed(0)}% ` +
        `(median ${wasMedian.toFixed(2)} -> ${nowMedian.toFixed(2)} ms) — the machine was busier ` +
        `or quieter, not the game. The shares below already have that taken out.`,
    );
  }

  const deltas = compareRuns(before, after);

  // **A guard, not a path.** The reference set (`waves.ts`) is what keeps every
  // run at or over the floor, and `referenceWaves` throws rather than quietly
  // handing back fewer — so this fires only if somebody raises the floor above
  // the number of references, and then it says so instead of taking a verdict
  // the median cannot support.
  if (!driftIsMeasurable(after)) {
    console.log(
      `  ${after.waves.length} waves is under the ${DRIFT_MIN_WAVES} a verdict needs, and the ` +
        `reference set did not make it up — no verdict taken. See tools/perf/waves.ts.`,
    );
    return;
  }

  const worse = deltas.filter((d) => d.verdict === "worse");
  const better = deltas.filter((d) => d.verdict === "better");
  const fresh = deltas.filter((d) => d.verdict === "new");
  // A wave whose own sample was all over the place gets its milliseconds and
  // says so, rather than a `same` nothing could ever have moved past.
  const noisy = deltas.filter((d) => d.verdict === "noisy");
  // Said out loud rather than left off the list: a wave with no figure on
  // either side is a hole in the baseline, and the whole reason a hole is
  // allowed is that somebody is meant to fill it (`unmeasured.ts`).
  const blank = deltas.filter((d) => d.verdict === "unmeasured");

  // **A reference wave with a verdict is a broken run, not a finding.** Nothing
  // the lane did can have reached one — that is the whole reason they are
  // carried — so a verdict on one says the measurement moved under itself, and
  // every other verdict beside it is worth exactly as much.
  const shaken = [...worse, ...better].filter((d) => carried.has(d.wave));
  if (shaken.length > 0) {
    console.log(
      `  ⚠ ${shaken.map((d) => d.name).join(", ")} moved, and no lane touches a reference wave — ` +
        `something else was using the machine. Read nothing below as a verdict; run it again idle.`,
    );
  }

  for (const d of [...worse, ...fresh, ...better]) {
    const change =
      d.verdict === "new"
        ? `new — ${d.after.toFixed(2)} ms`
        : `${d.changePct > 0 ? "+" : ""}${d.changePct.toFixed(0)}% of the share it had ` +
          `(typical paint ${d.before.toFixed(2)} -> ${d.after.toFixed(2)} ms)`;
    console.log(
      `  ${d.verdict.toUpperCase().padEnd(7)} ${String(d.wave).padStart(2)} ${d.name.padEnd(20)} ${change}`,
    );
  }
  for (const d of noisy) {
    console.log(
      `  NOISY   ${String(d.wave).padStart(2)} ${d.name.padEnd(20)} its own sample was too ` +
        `unsteady to compare — ${d.before.toFixed(2)} -> ${d.after.toFixed(2)} ms, read them yourself`,
    );
  }
  for (const d of blank) {
    console.log(
      `  UNMEASURED ${String(d.wave).padStart(2)} ${d.name.padEnd(20)} no figure on either side — ` +
        `take one on a machine somebody is holding: bun run perf --wave "${d.name}" --save`,
    );
  }
  if (worse.length === 0 && fresh.length === 0) console.log("  nothing got dearer.");
}

/** The one line somebody reads if they read nothing else: the middle of the run
 * and the wave nearest the edge of a frame. */
export function printSummary(run: Run): void {
  const worst = [...run.waves].sort((a, b) => b.p90 - a.p90)[0] as WaveCost;
  console.log("");
  console.log(
    `median ${medianMs(run).toFixed(2)} ms; worst ${worst.name} at ${worst.p90.toFixed(1)} ms ` +
      `(${budgetPct(worst.p90).toFixed(0)}% of a 60Hz frame)`,
  );
}
