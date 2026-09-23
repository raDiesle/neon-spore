import { closingLines, firstFailure, tallyOf } from "./junit.js";

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

export interface ShardOutcome {
  /** The shard's exit code. */
  readonly code: number;
  /** Everything it wrote, stdout then stderr. */
  readonly text: string;
}

export function closingReport(
  merged: string,
  results: readonly ShardOutcome[],
  files: number,
  wall: string,
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
  // **And every slow test whose declared figure no longer holds**, green or
  // red (`tools/test/figure.ts`). A shard's own block is scrolled past, and a
  // figure that drifts where nobody reads it is the next red landing.
  for (const r of results)
    for (const line of r.text.split("\n"))
      if (line.trimStart().startsWith(DRIFT_MARK)) out.push(`  ${line.trim()}`);
  return out;
}
