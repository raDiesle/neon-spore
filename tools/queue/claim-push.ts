/**
 * The push that makes a `Taken:` line a claim, and what a claim does when
 * origin refuses it.
 *
 * Until 26 September 2026 a refused push printed `⚑ origin/main not updated`
 * and the claim went on as if it had been made. That day a cloud session's
 * `main` was an hour behind `origin/main`, so its push was refused as not a
 * fast-forward. The warning scrolled off under the prompt, a second session
 * claimed the same item on origin, and §25 THE VALVE was built twice.
 * So a claim origin refuses is now either made again over origin's trunk or
 * given up with the name of whoever holds the item. It is never left standing
 * where only this clone can see it.
 */

import { takenIn } from "./edit.js";
import { gitIn, gitWith } from "./git.js";
import type { Item } from "./queue.js";
import { TRUNK } from "./tree.js";

/** Sent to origin, kept here because there is no origin, or refused. */
export type Sent = "pushed" | "local" | "refused";

/** Push the trunk, from the worktree holding it or from the clone. */
export function pushTrunk(root: string, tree: string): Sent {
  if (!gitIn(root, "remote", "get-url", "origin").ok) return "local";
  const pushed = gitIn(tree || root, "push", "origin", `${TRUNK}:${TRUNK}`);
  if (pushed.ok) {
    console.log(`  pushed   origin/${TRUNK}`);
    return "pushed";
  }
  const why = pushed.err.split("\n").find((l) => l.includes("rejected")) ?? pushed.err;
  console.log(`  ⚑ origin/${TRUNK} not updated — ${why.trim()}`);
  return "refused";
}

/**
 * The claim's mark came back refused: look at origin's copy of the entry.
 *
 * - **Origin cannot be reached**: the mark stays, since the branch still
 *   holds the item for every worktree on this machine, and the warning says so.
 * - **Origin's entry has a `Taken:` line**: the mark comes off and this
 *   throws with the holder's name. `claim` then drops the branch.
 * - **It has none**: the mark comes off, `main` is moved up to origin's, and
 *   `redo` marks and pushes once more. A second refusal throws.
 *
 * `main` is moved only when origin's trunk already contains it. A trunk with
 * landings nobody pushed yet is the owner's to bring up (`bun run push`),
 * and moving it here would drop them.
 */
export function settleRefused(
  item: Item,
  redo: () => Sent | false,
  root: string,
  tree: string,
): void {
  if (!gitIn(root, "fetch", "-q", "origin", TRUNK).ok) {
    console.log(`  ⚑ origin cannot be reached — the claim holds on this machine only`);
    return;
  }
  const theirs = gitWith(
    { cwd: root, raw: true },
    "show",
    `origin/${TRUNK}:docs/${item.source}.md`,
  );
  const holder = theirs.ok ? takenIn(theirs.out, item.title) : "";
  unmarkTip(root, tree);
  const title = JSON.stringify(item.title);
  if (holder) throw new Error(`${title} is already taken on origin — ${holder}`);
  if (!gitIn(root, "merge-base", "--is-ancestor", TRUNK, `origin/${TRUNK}`).ok) {
    throw new Error(
      `origin refused the claim on ${title}, and ${TRUNK} has commits origin has not — ` +
        "run `bun run push`, then claim it again",
    );
  }
  catchUp(root, tree);
  const again = redo();
  if (again === "refused") unmarkTip(root, tree);
  if (again !== "pushed" && again !== "local") {
    throw new Error(`origin refused the claim on ${title} twice — nothing is claimed`);
  }
}

/** Take the mark just committed off the trunk's tip. */
function unmarkTip(root: string, tree: string): void {
  const r = tree
    ? gitIn(tree, "reset", "-q", "--keep", "HEAD~1")
    : gitIn(root, "update-ref", `refs/heads/${TRUNK}`, rev(root, `${TRUNK}~1`), rev(root, TRUNK));
  if (!r.ok) throw new Error(`could not take the refused mark off ${TRUNK}: ${r.err}`);
}

/** Fast-forward the trunk to origin's. */
function catchUp(root: string, tree: string): void {
  const r = tree
    ? gitIn(tree, "merge", "-q", "--ff-only", `origin/${TRUNK}`)
    : gitIn(
        root,
        "update-ref",
        `refs/heads/${TRUNK}`,
        rev(root, `origin/${TRUNK}`),
        rev(root, TRUNK),
      );
  if (!r.ok) throw new Error(`could not bring ${TRUNK} up to origin/${TRUNK}: ${r.err}`);
}

function rev(root: string, ref: string): string {
  const r = gitIn(root, "rev-parse", "--verify", "--quiet", ref);
  if (!r.ok) throw new Error(`no ${ref} here`);
  return r.out;
}
