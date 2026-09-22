import { join } from "node:path";
import { type Entry, split } from "./queue-merge.js";

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
 *
 * **The three snapshots are not enough on their own, and one got through.**
 * They only see as far back as the merge base, so a removal the trunk made
 * *before* the lane branched is in none of them and the re-add reads as a
 * filing. That is what happened on 19 September 2026 (`filed`, below), and it
 * is why the second half of this file asks the trunk's history instead.
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

/**
 * **The entries this landing is adding that nobody else has a copy of**, which
 * is what filing one looks like — and what a resurrection the lane branched
 * *after* looks like too.
 *
 * The three snapshots tell those two apart only while the removal is *inside*
 * the window they cover. `base` is the merge base, so a removal made on the
 * trunk **before** the lane branched is in none of them: it is not in `base`,
 * which is what makes it invisible, and an entry missing from `base` is
 * exactly the shape `resurrected` was written to stay quiet about. That is how
 * `5780141b` put *A landing that forgot `--unverified` has no way to write the
 * entry afterwards* back on 19 September 2026, twelve commits after `6db42a92`
 * removed it, with the guard running and saying nothing — and it is why the
 * other two entries in that same commit were dropped correctly: those the
 * merge itself handled, and this one never reached the question.
 *
 * So the window has to be the trunk's whole history rather than one commit of
 * it, and that is a git question rather than a string one. It is asked only of
 * these candidates, which is nought to two per landing.
 */
export function filed(base: string, trunk: string, landed: string): Entry[] {
  const known = new Set([...titles(base), ...titles(trunk)]);
  return split(landed).entries.filter((entry) => !known.has(entry.title));
}

/**
 * Did this file, anywhere in the trunk's history, ever hold **this** entry?
 * Injected so the guard stays testable without a repository.
 */
export type EverHeld = (file: string, entry: Entry) => Promise<boolean>;

/**
 * The `- **Found:**` line, which carries an entry's date and the branch that
 * wrote it and is therefore the one line a second filing of the same title
 * cannot repeat. `undefined` for an entry that has none, and then the heading
 * is all there is to ask about.
 */
export function foundLine(block: string): string | undefined {
  return block.split("\n").find((line) => line.startsWith("- **Found:**"));
}

/**
 * That question as git answers it: the pickaxe, which names a commit where the
 * number of times a string occurs in a path *changed*. A heading the trunk
 * does not carry now and that some commit changed the count of is one it once
 * carried and took out.
 *
 * **The heading alone would be too much**, though. Two lanes may honestly file
 * the same one-line finding months apart, and refusing the second would be the
 * guard inventing work rather than saving it. What was actually seen on 19
 * September 2026 was the entry coming back *word for word*, `Taken:` line and
 * all, which is a copy rather than a re-filing — so the `Found:` line is asked
 * for as well. Both must have been there.
 *
 * One call per candidate when the answer is no, two when it is yes, and about
 * a tenth of a second apiece over this repository's own `docs/queue.md`.
 */
export function everHeldIn(run: (args: string[]) => Promise<string>, trunk: string): EverHeld {
  const seen = async (file: string, needle: string): Promise<boolean> =>
    (await run(["log", "--format=%H", "-n", "1", "-S", needle, trunk, "--", file])).length > 0;
  return async (file, entry) => {
    if (!(await seen(file, `## ${entry.title}`))) return false;
    const found = foundLine(entry.block);
    return found === undefined || (await seen(file, found));
  };
}

/**
 * The same question asked of the replayed working tree, file by file.
 *
 * `everHeld` is the second half and is optional only so the pure tests can
 * leave it out: without it this asks what the three snapshots can answer, and
 * with it a newly-filed entry is also checked against the trunk's own history.
 * A title the trunk once had and does not have now was **removed**, whatever
 * the merge base says, and a landing putting it back is putting back work.
 */
export async function resurrectedAfter(
  root: string,
  snapshots: readonly Snapshot[],
  everHeld?: EverHeld,
): Promise<{ file: string; titles: string[] }[]> {
  const out: { file: string; titles: string[] }[] = [];
  for (const shot of snapshots) {
    const landed = await Bun.file(join(root, shot.file))
      .text()
      .catch(() => "");
    const back = resurrected(shot.base, shot.trunk, landed);
    for (const entry of everHeld ? filed(shot.base, shot.trunk, landed) : []) {
      if (await everHeld?.(shot.file, entry)) back.push(entry.title);
    }
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
  lines.push(
    "  if one of them is genuinely new work, give it a heading the trunk has not finished under",
  );
  return lines;
}
