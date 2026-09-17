/**
 * **The shards' JUnit reports, read and merged.**
 *
 * `bun test --reporter=junit` is how a shard says what it ran, and how several
 * shards become one run: `shard.ts` reads each report's header for the marks it
 * prints, merges them for the closing tally, and `profile.ts` parses the merge
 * as though one process had written it.
 *
 * Apart from `shards.ts`, which is the *deal* — which file goes in which
 * process — because the two halves grew past one file's limit on 15 September
 * 2026 and share nothing but the word shard. Neither imports the other.
 */

/** What one shard's `<testsuites>` header counts. */
export interface Tally {
  tests: number;
  failures: number;
  skipped: number;
  seconds: number;
}

const HEADER = /<testsuites\b([^>]*)>([\s\S]*)<\/testsuites>/;

function attribute(attrs: string, name: string): number {
  // A leading space rather than `\b`: every attribute in the header follows
  // one, and `name="bun test"` puts the word `test` in front of `tests=`.
  return Number(attrs.match(new RegExp(` ${name}="([0-9.]+)"`))?.[1] ?? 0);
}

/**
 * **The first case that failed, as one line a reader can act on.**
 *
 * `shard.ts` closes with the counts and which shard was red, and on 14
 * September 2026 a run ended `1668 pass, 1 fail … 1 shard red` with nothing
 * under it — the failing case's name was inside that shard's own block,
 * hundreds of lines above the last thing printed, and the block still on
 * screen was the *green* shard saying `0 failed`, which reads as a
 * contradiction. A red run is read from the bottom, because that is where a
 * reader's eye is when the command returns, and a red that has to be hunted
 * for is a red that gets run again instead.
 *
 * Off the report rather than off the printed output, so it says the same thing
 * whatever a shard wrote to its own stdout — and out of the **merged** report,
 * so "first" is the earliest failure of the earliest red shard rather than
 * whichever one happened to finish first.
 *
 * **And what it said**, since 17 September 2026: `message` is the failure's
 * own text — the `expect` line and the diff under it — because a name alone
 * was still a rerun. `loop-once.test.ts` went red once in eight shards with
 * *only stage-loop.ts accumulates a fixed-timestep carry*, and which file it
 * had found was in the received array the case printed, in the shard's block,
 * and nowhere in the line a reader had (`docs/queue.md`, 17 September 2026).
 *
 * Null when nothing failed, which is every green run.
 */
export function firstFailure(
  xml: string,
): { file: string; line: number; name: string; message: string } | null {
  // The `<failure>` is a child of the `<testcase>` that failed, so the case is
  // the last opening tag before it. Matched as "a testcase tag, then anything
  // that is not another testcase tag, then a failure" rather than by parsing:
  // one shape, written by one reporter, and a parser here would be a second
  // thing to keep up with `bun test`'s output.
  const hit = /<testcase\b([^>]*)>(?:(?!<testcase\b)[\s\S])*?<failure\b([^>]*)>/.exec(xml);
  if (!hit) return null;
  const attrs = hit[1] ?? "";
  const text = (name: string): string => attrs.match(new RegExp(` ${name}="([^"]*)"`))?.[1] ?? "";
  const group = text("classname");
  const own = text("name");
  return {
    file: text("file"),
    line: attribute(attrs, "line"),
    // `classname` is the `describe` a case sits in, and it is the half that
    // says what the case was about; a case written at the top level has none.
    name: group && group !== own ? `${group} > ${own}` : own,
    message: readEntities((hit[2] ?? "").match(/ message="([^"]*)"/)?.[1] ?? ""),
  };
}

/** The five entities the reporter writes into an attribute, read back. */
function readEntities(attr: string): string {
  return attr
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export function tallyOf(xml: string): Tally {
  const attrs = xml.match(HEADER)?.[1] ?? "";
  return {
    tests: attribute(attrs, "tests"),
    failures: attribute(attrs, "failures"),
    skipped: attribute(attrs, "skipped"),
    seconds: attribute(attrs, "time"),
  };
}

/**
 * Several reports as one, the shape `profile-report.ts` reads: every
 * `<testsuite>` from every shard under one `<testsuites>` whose counts are
 * the sum. Its `time` is the sum too — what the suite *costs*, which is the
 * figure a file's share is read against, not what the wall clock waited,
 * which `shard.ts` prints on its own line. A report that is not a `bun test`
 * report contributes nothing rather than breaking the merge, so a shard that
 * died before writing one still leaves the others readable.
 */
export function mergeJunit(reports: readonly string[]): string {
  const total: Tally = { tests: 0, failures: 0, skipped: 0, seconds: 0 };
  let assertions = 0;
  const bodies: string[] = [];
  for (const xml of reports) {
    const m = xml.match(HEADER);
    if (!m) continue;
    const t = tallyOf(xml);
    total.tests += t.tests;
    total.failures += t.failures;
    total.skipped += t.skipped;
    total.seconds += t.seconds;
    assertions += attribute(m[1] ?? "", "assertions");
    bodies.push((m[2] ?? "").trim());
  }
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<testsuites name="bun test" tests="${total.tests}" assertions="${assertions}" ` +
    `failures="${total.failures}" skipped="${total.skipped}" time="${total.seconds.toFixed(3)}">\n` +
    `${bodies.join("\n")}\n</testsuites>\n`
  );
}
