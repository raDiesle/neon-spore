import { join } from "node:path";

/**
 * **A landing must not put back a queue entry another lane took out.**
 *
 * Twice on 5 September 2026 it did. The trunk carried `tools/land/refusal.ts`,
 * `--settle` and the frames tests' shared browser — all landed, all with their
 * entries removed in the commit that closed them — and `docs/queue.md` went on
 * listing every one of them as waiting. A session that believed the file,
 * which is the whole point of the file, would have done them a second time.
 * That is the failure the queue's own preamble records happening on 3
 * September, arriving by a different road.
 *
 * The road is a **rebase resolving `docs/queue.md` in the lane's favour**. A
 * lane that branched before the removals holds a copy of the file that still
 * has the entries in it; the conflict is in a document rather than in code, so
 * it reads as prose to be kept rather than as a deletion to be honoured, and
 * taking "ours" puts every one of them back in one move. Nothing fails: the
 * file is still valid, the format test still passes, and the only sign is a
 * queue that has grown.
 *
 * So the check is **after the replay and before the fast-forward**, where it
 * is a fact rather than a prediction: what the trunk had removed is read
 * before the rebase, and what the lane is about to put on the trunk is read
 * after it. Adding an entry is ordinary and removing one is ordinary. Only
 * re-adding one is the mistake, and the three snapshots are what tell them
 * apart.
 */

/** The two files `bun run queue` reads, both of them entry-per-`##`. */
export const QUEUE_FILES = ["docs/queue.md", "docs/parked.md"];

/** One file, as the trunk and the merge base had it before the replay. */
export interface Snapshot {
  file: string;
  /** The version the lane branched from. */
  base: string;
  /** The version on the trunk, which is what the replay is landing onto. */
  trunk: string;
}

/**
 * Every `##` heading, which is one entry each.
 *
 * The format example inside the preamble's fenced block is a heading too, and
 * is deliberately not filtered out: it stands in all three snapshots, so it
 * can never be something the trunk removed and is never reported.
 */
export function titles(md: string): string[] {
  return md
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.slice(3).trim());
}

/**
 * The entries the trunk had taken out and the landing is putting back.
 *
 * `base` says what was there when the lane branched, so an entry missing from
 * `trunk` was *removed* rather than never written — and an entry the lane
 * itself filed is absent from `base` and therefore never reported.
 */
export function resurrected(base: string, trunk: string, landed: string): string[] {
  const onTrunk = new Set(titles(trunk));
  const removed = titles(base).filter((title) => !onTrunk.has(title));
  const back = new Set(titles(landed));
  return removed.filter((title) => back.has(title));
}

/** What a landing has to read *before* it replays, so it can ask afterwards. */
export async function queueSnapshots(
  trunk: string,
  show: (rev: string, file: string) => Promise<string>,
  mergeBase: string,
): Promise<Snapshot[]> {
  const out: Snapshot[] = [];
  for (const file of QUEUE_FILES) {
    out.push({
      file,
      base: await show(mergeBase, file),
      trunk: await show(trunk, file),
    });
  }
  return out;
}

/** The same question asked of the replayed working tree, file by file. */
export async function resurrectedAfter(
  root: string,
  snapshots: readonly Snapshot[],
): Promise<{ file: string; titles: string[] }[]> {
  const out: { file: string; titles: string[] }[] = [];
  for (const shot of snapshots) {
    const landed = await Bun.file(join(root, shot.file))
      .text()
      .catch(() => "");
    const back = resurrected(shot.base, shot.trunk, landed);
    if (back.length > 0) out.push({ file: shot.file, titles: back });
  }
  return out;
}

/** What a refused landing says, first line already carrying the ✗. */
export function refusal(
  trunk: string,
  back: readonly { file: string; titles: string[] }[],
): string[] {
  const lines = [`✗ the replay put back work the trunk had finished; ${trunk} was not moved`];
  for (const { file, titles } of back) {
    for (const title of titles) lines.push(`  ${file}: ${title}`);
  }
  lines.push(
    "  take those out of your copy of the file — the trunk has already had them — and land again",
  );
  return lines;
}
