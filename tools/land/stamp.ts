/**
 * What the lane actually took, measured rather than estimated.
 *
 * `docs/time-log.md`'s five rows are what a session estimates about itself,
 * rounded to five, and they do not agree with the trunk: 3 385 logged minutes
 * on 15 September 2026 against an 860-minute span of that day's own commits,
 * 2 395 against 969 on the 14th, 1 790 against 634 on the 16th. The ratio is
 * the estimate, and it is between two and a half and four. The shares survive
 * that — the tail is still the tail — and the minutes do not, which matters
 * because **every speed question this repository asks next is asked in
 * minutes**: whether a split lane is shorter than the sitting it replaces,
 * whether the line-ceiling hook took its 375 minutes off.
 *
 * `bun run land` is already holding both ends of the measurement at the moment
 * it writes the release note — the lane's first commit and the trunk moving —
 * so it stamps one line into the entry the session just wrote. The five rows
 * stay exactly as they are beside it: **an estimate next to a measurement is
 * how the estimate gets better rather than replaced.**
 *
 * Pure, for `notes.ts`'s reason: the wording and the arithmetic are the part
 * worth testing and neither needs a repository behind it.
 *
 * **What it does not measure, said in the line itself.** The span is first
 * commit to trunk, so it holds no reading, no thinking and no writing before
 * the first commit, and it holds every minute a lane spent waiting on
 * something else. It is a floor with a known shape, which is worth more than
 * an estimate with an unknown one.
 *
 * **And it does not prefill the entry's skeleton**, which the queue entry
 * offered as the other half of the same minute. `land` runs at the end: a
 * heading, a date and five empty rows written then are scaffolding for a lane
 * that has not started, in a file that is append-only and read as a record. The
 * eleven lines of scaffolding are worth taking off a session somewhere, and
 * that somewhere is where a lane *opens* — `tools/queue/prompt.ts` — not here.
 */

/** The elapsed minutes between two git author timestamps, in seconds. */
export function minutesBetween(from: number, to: number): number {
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
  return Math.max(0, Math.round((to - from) / 60));
}

/**
 * The one line stamped under the entry.
 *
 * Marked as a measurement in the same breath as the number, because the rows
 * above it are not one and a reader two months from now has no way to tell
 * them apart from the shape. Under a minute is said in words rather than as
 * `0 min`, which reads as a failed measurement.
 */
export function stampLine(minutes: number): string {
  const said = minutes < 1 ? "under a minute" : `${minutes} min`;
  return `*Measured: ${said} from this lane's first commit to the trunk moving, by \`bun run land\`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*`;
}

/** Whether this text already carries a stamp, so a second landing adds none. */
export function stamped(markdown: string): boolean {
  return /^\*Measured: /m.test(lastEntry(markdown));
}

/** The last `## ` block, which is the entry the landing session just wrote. */
function lastEntry(markdown: string): string {
  const at = markdown.lastIndexOf("\n## ");
  return at < 0 ? "" : markdown.slice(at);
}

/**
 * The ledger with the line under its last entry, or unchanged.
 *
 * The last `## ` block and not a named one: the entry a lane writes is the
 * entry it appends, and `note-commit.ts` only calls this when the landing's
 * own commits touched this file — which is what makes "the last one" mean
 * "this lane's". A file with no entry at all, or one already stamped, comes
 * back exactly as it went in, so a landing can never rewrite the record.
 */
export function stampInto(markdown: string, minutes: number): string {
  if (markdown.lastIndexOf("\n## ") < 0 || stamped(markdown)) return markdown;
  return `${markdown.trimEnd()}\n\n${stampLine(minutes)}\n`;
}
