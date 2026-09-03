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

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { branchFor, takenMark } from "./claim.js";
import { type Item, markTaken } from "./queue.js";

export const ROOT = join(import.meta.dirname, "..", "..");
export const PATHS = {
  queue: join(ROOT, "docs", "queue.md"),
  parked: join(ROOT, "docs", "parked.md"),
};
export const TRUNK = "main";

function gitIn(cwd: string, ...args: string[]): { ok: boolean; out: string; err: string } {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { ok: r.status === 0, out: (r.stdout ?? "").trim(), err: (r.stderr ?? "").trim() };
}

export function git(...args: string[]): { ok: boolean; out: string; err: string } {
  return gitIn(ROOT, ...args);
}

/** Whether this checkout has the branch itself, rather than origin's copy of it. */
export function hasBranch(branch: string): boolean {
  return git("rev-parse", "--verify", "--quiet", `refs/heads/${branch}`).ok;
}

/** Every branch this checkout can see — its own and, if it has one, origin's. */
export function refs(): string[] {
  const r = git("for-each-ref", "--format=%(refname:short)", "refs/heads", "refs/remotes/origin");
  return r.out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** The worktree holding the trunk, or "" when nothing has it checked out. */
export function trunkTree(): string {
  let path = "";
  for (const line of git("worktree", "list", "--porcelain").out.split("\n")) {
    if (line.startsWith("worktree ")) path = line.slice("worktree ".length).trim();
    if (line.trim() === `branch refs/heads/${TRUNK}`) return path;
  }
  return "";
}

/**
 * Rewrite one of the two files on the trunk, commit it there and push.
 *
 * `--only` so the commit carries that file and nothing else: the trunk tree may
 * have work of its own in it, and a claim must never sweep somebody's
 * uncommitted afternoon onto `main`. For the same reason it refuses outright
 * when the file it is about to write is already modified there — `--only` would
 * commit *their* version of it, and this cannot tell the two apart.
 *
 * Every refusal here is a warning rather than an error. The branch is the gate
 * and it has already been taken by the time this runs; a clone with no trunk
 * checked out is the ordinary shape of a cloud session, and it is better to
 * claim an item unmarked than not to claim it at all.
 */
export function onTrunk(item: Item, edit: (md: string) => string, subject: string): boolean {
  const tree = trunkTree();
  const rel = `docs/${item.source}.md`;
  if (!tree) {
    console.log(`  ⚑ ${rel} on ${TRUNK} left alone — nothing has ${TRUNK} checked out`);
    return false;
  }
  if (gitIn(tree, "status", "--porcelain", "--", rel).out) {
    console.log(`  ⚑ ${rel} on ${TRUNK} left alone — ${tree} has uncommitted changes to it`);
    return false;
  }
  const path = join(tree, rel);
  writeFileSync(path, edit(readFileSync(path, "utf8")));
  const made = gitIn(tree, "commit", "--only", rel, "-q", "-m", subject);
  if (!made.ok) throw new Error(`could not commit ${rel} on ${TRUNK}: ${made.err}`);
  console.log(`  ${TRUNK}     ${rel} — ${subject}`);

  if (!git("remote", "get-url", "origin").ok) return true;
  const pushed = gitIn(tree, "push", "origin", `${TRUNK}:${TRUNK}`);
  if (pushed.ok) console.log(`  pushed   origin/${TRUNK}`);
  else console.log(`  ⚑ origin/${TRUNK} not updated — run: git push origin ${TRUNK}`);
  return true;
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
 */
export function claim(item: Item): string {
  const branch = branchFor(item);
  const made = git("branch", branch, TRUNK);
  if (!made.ok) throw new Error(`could not claim ${JSON.stringify(item.title)}: ${made.err}`);
  const marked = onTrunk(
    item,
    (md) => markTaken(md, item.title, takenMark(branch, new Date().toISOString().slice(0, 10))),
    `Mark ${JSON.stringify(item.title)} taken`,
  );
  if (marked) {
    const moved = git("branch", "--force", branch, TRUNK);
    if (!moved.ok) throw new Error(`could not move the claim onto ${TRUNK}: ${moved.err}`);
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
