/**
 * The arithmetic of a sharded `bun test`: which files go in which process,
 * and how their JUnit reports become one.
 *
 * Pure, so `shards.test.ts` can hold it still. `shard.ts` walks the tree,
 * spawns the processes and prints.
 */

export interface Weighed {
  /** Repository-relative, forward slashes. */
  readonly file: string;
  /** Roughly what the file costs, in whatever unit — only the ratios matter. */
  readonly weight: number;
}

/**
 * The files whose cost is nothing like their size, in seconds from
 * `docs/performance.md`'s table: a real Chrome, a walk through every
 * rehearsal, and a wait on workerd. Everything else is weighed by its bytes.
 * Balance by bytes alone and the shard that drew `opening.test.ts` finished
 * last by half a minute, whatever else it was given. A file missing from
 * here is not wrong, only slower to find its shard's end; the profile says
 * when one has earned a row.
 */
export const KNOWN_SECONDS: Readonly<Record<string, number>> = {
  "tools/frames/test/opening.test.ts": 30,
  "packages/render/test/briefing.test.ts": 24,
  "apps/server/test/room.test.ts": 8,
};

/**
 * Two rates, read off one profile on 10 September 2026 and rounded: a file
 * that draws frames ran at about 3 500 bytes a second, and everything else at
 * about 20 000 — the director, the sim, the land tool, all of it within a
 * factor of two of that figure, and the frame tests six times off it. One
 * rate put a 5 s frame test at 1.7 and filled the shard that had
 * `briefing.test.ts` with eight of them; two rates is the whole correction.
 * Only the ratio matters to `partition`.
 */
export const SECONDS_PER_BYTE = 1 / 20000;
export const DRAWN_SECONDS_PER_BYTE = 1 / 3500;

/** A file whose cases draw: the render frame tests, and the shape sheet's. */
export function draws(file: string): boolean {
  return (
    /^packages\/render\/test\/.*-frame\.test\.ts$/.test(file) ||
    file.startsWith("tools/shape-sheet/test/")
  );
}

export function weigh(file: string, bytes: number): Weighed {
  const rate = draws(file) ? DRAWN_SECONDS_PER_BYTE : SECONDS_PER_BYTE;
  return { file, weight: KNOWN_SECONDS[file] ?? bytes * rate };
}

/**
 * Longest-processing-time first: the heaviest file goes to the lightest
 * shard, and so on down. Not optimal, but within a heaviest-file of it, and
 * the heaviest file is the one thing no partition can split. Each shard's
 * list keeps the order it was filled in — heaviest first — so a slow file
 * starts early rather than being found at the end of a shard's run.
 *
 * Empty shards are dropped: a suite of three files asked for eight shards
 * gets three processes, not five that start and find nothing.
 */
export function partition(files: readonly Weighed[], shards: number): string[][] {
  const n = Math.max(1, Math.floor(shards));
  const bins: { weight: number; files: string[] }[] = Array.from({ length: n }, () => ({
    weight: 0,
    files: [],
  }));
  const sorted = [...files].sort((a, b) => b.weight - a.weight || a.file.localeCompare(b.file));
  for (const f of sorted) {
    let lightest = bins[0]!;
    for (const bin of bins) if (bin.weight < lightest.weight) lightest = bin;
    lightest.weight += f.weight;
    lightest.files.push(f.file);
  }
  return bins.filter((b) => b.files.length > 0).map((b) => b.files);
}

/**
 * Whether a path is one `bun test <filter>` would run: a filter is a
 * substring of the path, and no filter at all means every file.
 */
export function selected(file: string, filters: readonly string[]): boolean {
  if (filters.length === 0) return true;
  return filters.some((f) => file.includes(f.replaceAll("\\", "/")));
}

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
 * Null when nothing failed, which is every green run.
 */
export function firstFailure(xml: string): { file: string; line: number; name: string } | null {
  // The `<failure>` is a child of the `<testcase>` that failed, so the case is
  // the last opening tag before it. Matched as "a testcase tag, then anything
  // that is not another testcase tag, then a failure" rather than by parsing:
  // one shape, written by one reporter, and a parser here would be a second
  // thing to keep up with `bun test`'s output.
  const hit = /<testcase\b([^>]*)>(?:(?!<testcase\b)[\s\S])*?<failure\b/.exec(xml);
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
  };
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
