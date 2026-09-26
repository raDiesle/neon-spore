/**
 * Everything the queue does to the repository: reading the branches, making and
 * dropping a claim, and writing the trunk's own copy of `docs/queue.md`.
 *
 * Split out of `run.ts` when the `Taken:` line took that file past its
 * 250-line limit, along the seam it already had — `run.ts` is the commands and
 * what they print, and every `git` in the tool is now on this side of the wall.
 * The parsing is in `queue.ts` and the shape of a claim is in `claim.ts`;
 * neither of those needs a repository to be tested, and this one is all
 * repository, which is why it is worth keeping them apart.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { branchFor } from "./claim.js";
import { pushTrunk, type Sent, settleRefused } from "./claim-push.js";
import { clearTaken, hasEntry, markTaken, takenIn } from "./edit.js";
import { commitOnRef, gitIn, gitWith } from "./git.js";
import { takenMark } from "./mark.js";
import type { Item } from "./queue.js";
import { git, ROOT, TRUNK, trunkTree, workedOn } from "./tree.js";

// The facts about the checkout live in `tree.ts` now; they are said again here
// because this file is the door the tool comes in by.
export {
  git,
  hasBranch,
  headBranch,
  mainCheckout,
  PATHS,
  ROOT,
  refs,
  TRUNK,
  trunkRef,
  trunkTree,
  trunkView,
} from "./tree.js";

/**
 * Rewrite one of the two files on the trunk, commit it there and push.
 *
 * `--only` so the commit carries that file and nothing else: the trunk tree may
 * have work of its own in it, and a claim must never sweep somebody's
 * uncommitted afternoon onto `main`. For the same reason it refuses outright
 * when the file it is about to write is already modified there — `--only` would
 * commit *their* version of it, and this cannot tell the two apart.
 *
 * **A clone with nothing on the trunk is written the same way.** No worktree
 * holds `main` there — that is the ordinary shape of a cloud session
 * (`docs/cloud-session.md`), where the one checkout stands on the lane and the
 * trunk is a ref beside it — and until 10 September 2026 this printed `⚑ left
 * alone` and `take` went on to report the item ongoing anyway. Half a claim:
 * the branch, which no other clone can see, and no line, which is the half
 * that was written for exactly those clones. So the ref is written to directly
 * (`commitOnRef`), and the working tree is not touched.
 *
 * The one refusal left is a warning rather than an error: the trunk tree has
 * the file modified. The branch is the gate and it has already been taken by
 * the time this runs, and `--only` would commit *their* version of the file.
 *
 * What the push did is returned rather than only printed: a claim origin
 * refused is not a claim, and `claim` settles it (`claim-push.ts`).
 */
export function onTrunk(
  item: Item,
  edit: (md: string) => string,
  subject: string,
  root = ROOT,
): Sent | false {
  const tree = trunkTree(root);
  const rel = `docs/${item.source}.md`;
  if (!tree) {
    commitOnRef(root, TRUNK, rel, edit, subject);
  } else {
    if (gitIn(tree, "status", "--porcelain", "--", rel).out) {
      console.log(`  ⚑ ${rel} on ${TRUNK} left alone — ${tree} has uncommitted changes to it`);
      return false;
    }
    const path = join(tree, rel);
    writeFileSync(path, edit(readFileSync(path, "utf8")));
    const made = gitIn(tree, "commit", "--only", rel, "-q", "-m", subject);
    if (!made.ok) throw new Error(`could not commit ${rel} on ${TRUNK}: ${made.err}`);
  }
  console.log(`  ${TRUNK}     ${rel} — ${subject}`);

  return pushTrunk(root, tree);
}

/** Whether the trunk's own copy of the file has an entry under this title. */
export function trunkHas(item: Item, root = ROOT): boolean {
  const md = gitWith({ cwd: root, raw: true }, "show", `${TRUNK}:docs/${item.source}.md`);
  return md.ok && hasEntry(md.out, item.title);
}

/**
 * The mark the **trunk's** copy of the file carries for this item, or "".
 *
 * The one question `release` cannot answer from the item it was handed: that
 * was parsed out of this checkout's working copy, and a claim made where no
 * worktree holds `main` is written onto the ref with the working tree left
 * alone (`onTrunk`). So a cloud session asking its own file whether the item is
 * marked is asking the copy the mark was never written into.
 */
export function trunkTaken(item: Item, root = ROOT): string {
  const md = gitWith({ cwd: root, raw: true }, "show", `${TRUNK}:docs/${item.source}.md`);
  return md.ok ? takenIn(md.out, item.title) : "";
}

/**
 * The same edit in *this* checkout's copy, when it has the entry to make it in.
 *
 * The other half of the same trap. A lane that is editing `docs/queue.md` —
 * which every lane that finishes an item is — holds its own copy of the file,
 * and a line taken off the trunk alone comes back the moment `bun run land`
 * rebases the lane over it. Cheap and silent when there is nothing to change,
 * so callers need not ask first.
 */
export function alsoHere(item: Item, edit: (md: string) => string, root = ROOT): void {
  const path = join(root, `docs/${item.source}.md`);
  const md = readFileSync(path, "utf8");
  if (!hasEntry(md, item.title)) return;
  const next = edit(md);
  if (next !== md) writeFileSync(path, next);
}

/**
 * Take a `Taken:` line off so that a fresh claim can write one — **only ever
 * this lane's own line**, which `run.ts` settles with `heldElsewhere` before it
 * calls here.
 *
 * `markTaken` refuses to overwrite a holder, and it is right to: a claim that
 * could be silently re-stamped is not a claim. But after a retitle the holder
 * *is* the caller under the name the entry used to have, and the line is about
 * a title nothing carries any more (`claimedBranch`). So the line comes off
 * first, in both copies for `alsoHere`'s reason, and the trunk's only when the
 * trunk is carrying one — an edit that changes nothing there has no commit to
 * make and `onTrunk` would throw on the empty one.
 */
export function unmark(item: Item, root = ROOT): void {
  const cut = (md: string): string => clearTaken(md, item.title);
  if (trunkTaken(item, root)) {
    onTrunk(item, cut, `Re-stamp ${JSON.stringify(item.title)}`, root);
  }
  alsoHere(item, cut, root);
}

/**
 * Both halves of a claim. Fails, rather than overwrites, if somebody got there
 * first — that is the branch's job and the reason it is made before anything is
 * written down.
 *
 * The branch is then moved onto the marking commit. A lane based on the trunk
 * as it stood *before* its own `Taken:` line deletes an entry that `main` has
 * since edited, and its landing rebase conflicts inside the very entry it is
 * draining — a conflict nobody could read as anything but the tool's fault.
 *
 * **An entry the trunk has not got yet is marked where it is.** The owner asks
 * for an item to be queued and worked in the same sitting, so the entry is in
 * the lane's working tree and nowhere else. Until 11 September 2026 this made
 * the branch, went to write the line onto `main` — where there was no entry to
 * write it into — and threw, and the branch it left standing made the second
 * `take` say the item was already taken. Now the line goes into the working
 * copy, the lane commits it with the work, and the branch is still made,
 * because it is the gate every other worktree on this machine reads.
 *
 * **And a claim that fails to mark is not a claim.** Whatever throws between
 * the branch and the line, the branch goes before the error does, so the next
 * attempt starts from nothing rather than from a ghost.
 */
export function claim(item: Item, root = ROOT, dealt = false): string {
  const branch = branchFor(item);
  const made = gitIn(root, "branch", branch, TRUNK);
  if (!made.ok) throw new Error(`could not claim ${JSON.stringify(item.title)}: ${made.err}`);
  const mark = takenMark(
    branch,
    new Date().toISOString().slice(0, 10),
    workedOn(branch, root, dealt),
  );
  const edit = (md: string) => markTaken(md, item.title, mark);
  try {
    if (!trunkHas(item, root)) {
      const rel = `docs/${item.source}.md`;
      const path = join(root, rel);
      writeFileSync(path, edit(readFileSync(path, "utf8")));
      console.log(`  here     ${rel} — marked in this tree; ${TRUNK} has no such entry yet,`);
      console.log(`           so the line lands with the work that queued it`);
      return branch;
    }
    const put = () => onTrunk(item, edit, `Mark ${JSON.stringify(item.title)} taken`, root);
    const marked = put();
    if (marked === "refused") settleRefused(item, put, root, trunkTree(root));
    if (marked) {
      const moved = gitIn(root, "branch", "--force", branch, TRUNK);
      if (!moved.ok) throw new Error(`could not move the claim onto ${TRUNK}: ${moved.err}`);
    }
  } catch (e) {
    gitIn(root, "branch", "-D", branch);
    throw e;
  }
  return branch;
}

/**
 * Gives a claim back, and says what happened to it.
 *
 * `git branch -d` asks the wrong question here: it wants to know whether the
 * branch is merged into *HEAD*, and the session dropping a claim is standing on
 * its own lane rather than on the claim. A claim carries no commits by
 * construction, so the question worth asking is whether its tip is already on
 * `main` — if it is, nothing can be lost. If it is not, somebody committed on
 * the claim itself and it stays, which is a `queue next` lane mid-work.
 */
export function drop(branch: string): { ok: boolean; note: string } {
  if (git("rev-parse", "--abbrev-ref", "HEAD").out === branch) {
    return { ok: true, note: `${branch} is checked out here — landing deletes it` };
  }
  if (!git("merge-base", "--is-ancestor", branch, "main").ok) {
    return { ok: false, note: `${branch} holds commits that are not on main — left standing` };
  }
  const gone = git("branch", "-D", branch);
  return gone.ok
    ? { ok: true, note: `${branch} deleted` }
    : { ok: false, note: `${branch} left standing: ${gone.err}` };
}
