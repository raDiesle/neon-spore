import { join } from "node:path";
import { claimedBranch, workedBranch } from "../queue/mark.js";
import { TAKEN } from "../queue/queue.js";
import type { Snapshot } from "./queue-guard.js";
import { type Entry, split } from "./queue-merge.js";

/**
 * **A landing must not take out a queue entry nobody closed.**
 *
 * The mirror of `queue-guard.ts`, which refuses a landing that puts back what
 * the trunk finished. On 29 September 2026 the governor's body lane rewrote
 * its own entry with one Python replace whose start anchor matched the entry
 * *above* it, and the replace took three whole entries with it — §41 THE
 * WINCH's look, both §42 THE SLUICE entries and the §43 header. `bun run land`
 * put that on the trunk without a word, and only a later `grep` found it.
 *
 * Removing an entry is ordinary, but only for the lane that closed it, and a
 * lane closes an entry one of two ways. It **claimed** it — `bun run queue
 * take` or `next` writes a `Taken:` line onto the trunk's copy naming the
 * branch the work is on, or the claim branch in brackets, and `queue done`
 * then takes the entry out of the lane's copy. `done` makes no commit of its
 * own, so the claim is the record. Or the lane **said so**: its own commit
 * messages carry the entry's title word for word. An entry the trunk still has
 * that the landing takes out, with neither, was lost rather than closed.
 *
 * An entry that moved between `docs/queue.md` and `docs/parked.md` is not
 * gone: the titles the landing keeps are read across both files.
 */

/** The branches an entry's `Taken:` line names — the worked one and the claim. */
export function takenBy(entry: Entry): string[] {
  for (const line of entry.block.split("\n")) {
    const m = TAKEN.exec(line);
    if (m) return [workedBranch(m[1] ?? ""), claimedBranch(m[1] ?? "")].filter(Boolean);
  }
  return [];
}

/** Did this lane close the entry: claimed on `branch`, or named in `laneLog`? */
export function closedBy(entry: Entry, branch: string, laneLog: string): boolean {
  return takenBy(entry).includes(branch) || laneLog.includes(entry.title);
}

/**
 * The entries the trunk has that `landed` has not, and that this lane did not
 * close. `kept` is every title the landing carries in any queue file.
 */
export function dropped(
  trunk: string,
  kept: ReadonlySet<string>,
  branch: string,
  laneLog: string,
): string[] {
  return split(trunk)
    .entries.filter((entry) => !kept.has(entry.title))
    .filter((entry) => !closedBy(entry, branch, laneLog))
    .map((entry) => entry.title);
}

/**
 * The same question asked of the replayed working tree. `laneLog` is the
 * lane's own commit messages, `git log --format=%B <trunk>..HEAD`.
 */
export async function droppedAfter(
  root: string,
  snapshots: readonly Snapshot[],
  branch: string,
  laneLog: string,
): Promise<{ file: string; titles: string[] }[]> {
  const landed = new Map<string, string>();
  for (const shot of snapshots) {
    const text = await Bun.file(join(root, shot.file))
      .text()
      .catch(() => "");
    landed.set(shot.file, text);
  }
  const kept = new Set([...landed.values()].flatMap((md) => split(md).entries.map((e) => e.title)));
  const out: { file: string; titles: string[] }[] = [];
  for (const shot of snapshots) {
    const gone = dropped(shot.trunk, kept, branch, laneLog);
    if (gone.length > 0) out.push({ file: shot.file, titles: gone });
  }
  return out;
}

/** What a refused landing says, first line already carrying the ✗. */
export function droppedRefusal(
  trunk: string,
  gone: readonly { file: string; titles: string[] }[],
): string[] {
  const lines = [
    `✗ the replay took out queue entries this lane never closed; ${trunk} was not moved`,
  ];
  for (const { file, titles } of gone) {
    for (const title of titles) lines.push(`  ${file}: ${title}`);
  }
  lines.push(`  put them back from ${trunk}'s copy of the file, and land again`);
  lines.push(
    "  if this lane did finish one, `bun run queue take` it first, or name it in a commit message",
  );
  return lines;
}
