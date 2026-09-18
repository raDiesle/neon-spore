/**
 * The arithmetic of a sharded `bun test`: which files go in which process,
 * how many processes there are, and how many of them run at once.
 *
 * Pure, so `shards.test.ts` can hold it still. `shard.ts` walks the tree,
 * spawns the processes and prints; `junit.ts` reads what they wrote.
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
 *
 * **`most` is a ceiling on a bin's file count, and it is about memory rather
 * than time** (`MAX_FILES_PER_SHARD`). Balancing by weight alone puts as many
 * light files in a bin as it takes to match one heavy one, so a bin ran to
 * forty-six files where the average was thirty-eight — and the number of files
 * in one process is what the killed shard of 15 September 2026 was about. A
 * full bin is passed over for the lightest one that is not; there is always
 * one, because `binCount` deals enough bins to hold every file.
 */
export function partition(
  files: readonly Weighed[],
  shards: number,
  most = Number.POSITIVE_INFINITY,
): string[][] {
  const n = Math.max(1, Math.floor(shards));
  const bins: { weight: number; files: string[] }[] = Array.from({ length: n }, () => ({
    weight: 0,
    files: [],
  }));
  const sorted = [...files].sort((a, b) => b.weight - a.weight || a.file.localeCompare(b.file));
  for (const f of sorted) {
    let lightest: { weight: number; files: string[] } | undefined;
    for (const bin of bins) {
      if (bin.files.length >= most) continue;
      if (!lightest || bin.weight < lightest.weight) lightest = bin;
    }
    // Every bin full is a caller that asked for fewer than its files need. The
    // deal is still made rather than half made: the overflow goes on the
    // lightest bin there is, which is what `most` meant before it was a number.
    const onto = lightest ?? bins.reduce((a, b) => (b.weight < a.weight ? b : a), bins[0]!);
    onto.weight += f.weight;
    onto.files.push(f.file);
  }
  return bins.filter((b) => b.files.length > 0).map((b) => b.files);
}

/**
 * **The most files one `bun test` is given.**
 *
 * A `bun test` process does not give a finished file's memory back: 73 of them
 * in one process reached 7.4 GB of anonymous RSS on 15 September 2026 and was
 * killed by the memory cgroup — `exit 137`, `SIGKILL`, no output past the
 * version banner, and a shard whose whole result went with it. It is the
 * drawing files that do it, and they are the files a weight-balanced deal puts
 * together: a canvas per case, held until the process ends.
 *
 * So the deal is capped by *count* as well as balanced by weight, and the cap
 * is a memory figure rather than a speed one — 40 is a little over half the
 * count that died, and the four-core web image runs two such bins side by side
 * with room over. A bin is still filled longest-processing-time first within
 * that; this only says how many there are.
 */
export const MAX_FILES_PER_SHARD = 10;

/**
 * **40 until 18 September 2026, and it was still a memory figure read off the
 * wrong quantity.** Forty files was "a little over half the count that died",
 * which bounded the *files* a process was given and not the bytes it then
 * took: on the owner's machine that day two shards of forty render tests
 * reached 10.7 GB and 11.5 GB resident, and the cap had done exactly what it
 * said it would. A shard of ten is not a claim that ten is safe — it is that
 * a process which exits four times as often hands its heap back four times as
 * often, and the leak underneath (canvas stubs and frames held across files
 * that never share a process when run alone) stops being the machine's
 * problem while it is still somebody's. `tools/check/slots.ts` bounds how many
 * such processes exist at once; this bounds how large one gets.
 */

/**
 * **How many bins to deal into, which is no longer how many run at once.**
 *
 * They were one number until the cap above: `--shards` and `defaultShards()`
 * said both how many processes ran together and how much each was given, so a
 * machine with few cores was handed *more* files per process for having fewer
 * of them — exactly backwards, and what killed the four-core shard. Now the
 * number of processes is the caller's, the size of a bin is the cap's, and
 * `shard.ts` runs the bins through a pool that many wide.
 */
export function binCount(files: number, processes: number): number {
  return Math.max(1, processes, Math.ceil(files / MAX_FILES_PER_SHARD));
}

/**
 * Run `work` over `count` items, no more than `width` at a time, and answer
 * in the items' own order.
 *
 * `bins.map(async …)` started every shard at once, which was the same number
 * as the pool while the two figures were one. They are not one any more — four
 * cores deal twelve bins and run two — so the width is kept here rather than by
 * the deal, and the memory a run costs stays `width` processes' worth however
 * many bins the suite needs.
 */
export async function pool<T>(
  count: number,
  width: number,
  work: (i: number) => Promise<T>,
): Promise<T[]> {
  const out: T[] = Array.from({ length: count });
  let next = 0;
  const lane = async (): Promise<void> => {
    for (let i = next++; i < count; i = next++) out[i] = await work(i);
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(width, count)) }, lane));
  return out;
}

/**
 * Whether a path is one `bun test <filter>` would run: a filter is a
 * substring of the path, and no filter at all means every file.
 */
export function selected(file: string, filters: readonly string[]): boolean {
  if (filters.length === 0) return true;
  return filters.some((f) => file.includes(f.replaceAll("\\", "/")));
}
