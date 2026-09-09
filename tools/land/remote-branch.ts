/**
 * The lane's branch on `origin`, after the landing has taken it locally
 *
 * A landing in a clone with no worktrees — which is every cloud session — has
 * pushed its branch to `origin` so the turn had somewhere to report from, and
 * then puts the work on `main`. The branch is spent at that moment, and
 * nothing was deleting it: `git ls-remote --heads origin` in the session that
 * found this was mostly graveyard, three dead lanes deep before it added its
 * own. Nothing is broken by that — the commits are on `main` and a landed
 * branch is never revived — but a branch list that is mostly finished work
 * stops being a list of live work.
 *
 * So the landing asks for the deletion, **once**. The git proxy a cloud session
 * runs behind answers 403 to a branch deletion specifically — an ordinary push
 * of the same branch had gone through minutes earlier — and three attempts with
 * backoff produce three copies of the same refusal, ending in git's
 * `Everything up-to-date`, which is the other half of the command and reads
 * like success. After a landing that worked, four lines of that say the landing
 * did not.
 *
 * One try, and one line either way.
 */

import type { Run } from "./shallow.js";

export interface Deletion {
  /** Whether `origin` no longer has the branch. */
  ok: boolean;
  /** git's first line of complaint, for the caller to decide about. */
  said: string;
}

/** Ask `origin` to drop a branch this landing has finished with. */
export async function deleteRemote(run: Run, branch: string): Promise<Deletion> {
  const out = await run(["push", "origin", "--delete", branch]);
  return { ok: out.ok, said: out.out.trim().split("\n")[0] ?? "" };
}

/**
 * What to print. A refusal is one line naming the one thing left to do by hand,
 * and deliberately not git's own text: the useful part of a 403 here is not
 * what the proxy said but that nobody has to try again.
 */
export function deletionLine(deletion: Deletion, branch: string): string {
  if (deletion.ok) return `  swept    origin/${branch}`;
  return `  ⚑ ${branch} stays on origin — the deletion was refused; take it out in GitHub`;
}
