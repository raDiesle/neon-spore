/**
 * **The shas a reconcile rewrote, stamped again where the records name them.**
 *
 * `bun run land` stamps a release note with the sha of the commit it just put
 * on the trunk, and until 30 September 2026 `land --unverified` headed a
 * queue entry `Unverified at <sha>:`. Both are right until `bun run push`
 * finds `origin/main` ahead and replays the trunk onto it (`reconcile.ts`): every commit origin had not seen
 * gets a new sha, and the records go on naming the old one. Of the twelve
 * newest notes on 26 September 2026, five named a commit no history held.
 *
 * A rebase keeps a commit's author, author date and subject, so that triple is
 * the commit's name across it. A commit the rebase dropped as empty has no
 * partner and keeps its old stamp — there is nothing true to put there.
 *
 * Only a hex word that is a prefix of a rewritten sha is touched, and it is
 * replaced by the same number of characters of the new one, so a 9-character
 * stamp stays 9 characters and nothing else in the file moves.
 */

import { join } from "node:path";
import { git, gitOrDie } from "./git.js";
import { NOTES_FILE } from "./notes-merge.js";
import { QUEUE_FILES } from "./queue-guard.js";

/** The files that carry a landing's sha. */
export const STAMPED_FILES = [NOTES_FILE, ...QUEUE_FILES];

/** A commit as the rebase sees it: its sha and what survives a replay. */
export interface Rewritable {
  sha: string;
  /** Author, author date and subject — the same before a rebase and after. */
  key: string;
}

/** `git log` format that `readCommits` parses: the full sha, then the key. */
const FORMAT = "%H%x09%an%x09%at%x09%s";

/** Parse `git log --format=FORMAT` output. */
export function parseCommits(out: string): Rewritable[] {
  return out
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [sha = "", ...rest] = line.split("\t");
      return { sha, key: rest.join("\t") };
    });
}

/** The commits in `range`, newest first. */
export async function readCommits(range: string, cwd: string): Promise<Rewritable[]> {
  return parseCommits(await git(["log", `--format=${FORMAT}`, range], cwd));
}

/**
 * Old full sha → new full sha, for every commit whose key appears exactly once
 * on each side. A key seen twice is ambiguous and is left alone.
 */
export function rewrites(
  before: readonly Rewritable[],
  after: readonly Rewritable[],
): Map<string, string> {
  const once = (list: readonly Rewritable[]) => {
    const seen = new Map<string, string | null>();
    for (const c of list) seen.set(c.key, seen.has(c.key) ? null : c.sha);
    return seen;
  };
  const was = once(before);
  const now = once(after);
  const map = new Map<string, string>();
  for (const [key, old] of was) {
    const fresh = now.get(key);
    if (old && fresh && old !== fresh) map.set(old, fresh);
  }
  return map;
}

/** `text` with every stamp of a rewritten commit replaced by its new sha. */
export function restampText(text: string, map: ReadonlyMap<string, string>): string {
  if (map.size === 0) return text;
  const olds = [...map.keys()];
  return text.replace(/\b[0-9a-f]{7,40}\b/g, (word) => {
    const hits = olds.filter((old) => old.startsWith(word));
    if (hits.length !== 1) return word;
    return (map.get(hits[0] as string) as string).slice(0, word.length);
  });
}

/**
 * Restamp the records in `root` and commit them on whatever it has checked
 * out. Returns the files it changed — none when no stamp named a rewritten
 * commit, and then nothing is committed.
 */
export async function restamp(root: string, map: ReadonlyMap<string, string>): Promise<string[]> {
  const changed: string[] = [];
  for (const file of STAMPED_FILES) {
    const at = Bun.file(join(root, file));
    if (!(await at.exists())) continue;
    const text = await at.text();
    const next = restampText(text, map);
    if (next === text) continue;
    await Bun.write(join(root, file), next);
    changed.push(file);
  }
  if (changed.length === 0) return changed;
  await gitOrDie(["add", "--", ...changed], root);
  await gitOrDie(["commit", "--quiet", "-m", "Restamp the records a push's replay rewrote"], root);
  return changed;
}
