import { closingLines, firstFailure, tallyOf, timeoutsOf } from "./junit.js";

/**
 * **What `shard.ts` prints once every shard is in**: the counts, the first
 * failure under them, and any slow test whose figure has drifted. Beside
 * `shard.ts` rather than in it because this is the half that reads a finished
 * run — pure, lines out — and the other half is the deal and the processes.
 *
 * A run is read from the bottom, because that is where a reader's eye is when
 * the command returns; everything here is what has to be *at* the bottom.
 */

/** The start of the line `tools/test/figure.ts` says a drifted figure in. */
export const DRIFT_MARK = "figure drift:";

/** How many lines of the first failure's message are repeated. */
const FAILURE_LINES = 12;

/** The start of the line that says a red run timed out and failed nothing
 * else — `bun run land` runs such a check once more (`tools/land/red-check.ts`). */
export const LOAD_MARK = "timed out under load:";

export interface ShardOutcome {
  /** The shard's exit code. */
  readonly code: number;
  /** Everything it wrote, stdout then stderr. */
  readonly text: string;
  /** Its JUnit report, empty when it wrote none — a shard that was killed. */
  readonly xml?: string;
}

/** How busy the machine was when the run ended: the one-minute load average, and the cores it is shared across. */
export interface Load {
  readonly avg: number;
  readonly cores: number;
}

export function closingReport(
  merged: string,
  results: readonly ShardOutcome[],
  files: number,
  wall: string,
  load: Load = { avg: 0, cores: 1 },
): string[] {
  const total = tallyOf(merged);
  const failed = results.filter((r) => r.code !== 0).length;
  const out = [
    `\n${total.tests - total.failures - total.skipped} pass, ${total.failures} fail, ${total.skipped} skipped — ` +
      `${files} files across ${results.length} shards in ${wall}s wall, ${total.seconds.toFixed(1)}s of test` +
      (failed > 0 ? `; ${failed} shard${failed === 1 ? "" : "s"} red` : ""),
  ];
  // **And what failed, under the counts.** Until 14 September 2026 the bottom
  // said only how many — the case's name was in its shard's own block,
  // hundreds of lines up (`firstFailure`).
  const first = firstFailure(merged);
  if (first) {
    const where = first.file ? `${first.file}${first.line ? `:${first.line}` : ""} — ` : "";
    const more = total.failures > 1 ? ` (+${total.failures - 1} more)` : "";
    out.push(`  first failure: ${where}${first.name}${more}`);
    // And its message, indented under the name: the `expect` line and the
    // diff, which is where a case that lists what it found puts the list.
    // Capped both ways (`closingLines`), so neither a snapshot's diff nor a
    // whole file on one `Received:` line pushes the counts off the screen.
    for (const line of closingLines(first.message, FAILURE_LINES))
      out.push(line ? `    ${line}` : "");
  }
  const timed = loadLine(merged, results, load);
  if (timed) out.push(timed);
  // **And every slow test whose declared figure no longer holds**, green or
  // red (`tools/test/figure.ts`). A shard's own block is scrolled past, and a
  // figure that drifts where nobody reads it is the next red landing.
  for (const r of results)
    for (const line of r.text.split("\n"))
      if (line.trimStart().startsWith(DRIFT_MARK)) out.push(`  ${line.trim()}`);
  return out;
}

/**
 * **A red run that only timed out, said apart from a failure.** A landing went
 * red twice in a row on 15 October 2026, each time on a different test
 * running out of time at a load average of 30 from other sessions' checks,
 * and neither near the change; the third run was green. Read as a failure, a
 * red like that sends a session into a test it did not touch. So when every
 * failure is a timeout, and no shard is red without one (a killed shard
 * writes no report and is no timeout), the line says so and says the load;
 * when only some are, it counts them, and the rest are read as ever.
 */
export function loadLine(
  merged: string,
  results: readonly ShardOutcome[],
  load: Load,
): string | null {
  const timeouts = timeoutsOf(merged);
  if (timeouts === 0) return null;
  const failures = tallyOf(merged).failures;
  const at = `load average ${load.avg.toFixed(1)} on ${load.cores} cores`;
  const silent = results.some((r) => r.code !== 0 && tallyOf(r.xml ?? "").failures === 0);
  if (timeouts === failures && !silent) {
    return `  ${LOAD_MARK} every failure is a timeout and none an assertion, at ${at} — run it again`;
  }
  return `  ${timeouts} of the ${failures} failures timed out, at ${at}; the rest are not the machine`;
}
