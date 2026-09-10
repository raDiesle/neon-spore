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
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { branchFor, takenMark } from "./claim.js";
import { markTaken } from "./edit.js";
import type { Item } from "./queue.js";

export const ROOT = join(import.meta.dirname, "..", "..");
export const PATHS = {
  queue: join(ROOT, "docs", "queue.md"),
  parked: join(ROOT, "docs", "parked.md"),
};
export const TRUNK = "main";

interface Ran {
  ok: boolean;
  out: string;
  err: string;
}

function gitIn(cwd: string, ...args: string[]): Ran {
  return gitWith({ cwd }, ...args);
}

/** `raw` keeps stdout as git wrote it — a file's content, not a ref's name. */
function gitWith(
  opts: { cwd: string; input?: string; env?: Record<string, string>; raw?: boolean },
  ...args: string[]
): Ran {
  const r = spawnSync("git", args, {
    cwd: opts.cwd,
    encoding: "utf8",
    input: opts.input,
    env: opts.env ? { ...process.env, ...opts.env } : process.env,
  });
  const out = r.stdout ?? "";
  return { ok: r.status === 0, out: opts.raw ? out : out.trim(), err: (r.stderr ?? "").trim() };
}

export function git(...args: string[]): { ok: boolean; out: string; err: string } {
  return gitIn(ROOT, ...args);
}

/** Whether this checkout has the branch itself, rather than origin's copy of it. */
export function hasBranch(branch: string): boolean {
  return git("rev-parse", "--verify", "--quiet", `refs/heads/${branch}`).ok;
}

/** The branch this tree is standing on, or "" when it is on a detached HEAD. */
export function headBranch(): string {
  const r = git("rev-parse", "--abbrev-ref", "HEAD");
  return r.ok && r.out !== "HEAD" ? r.out : "";
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
 */
export function onTrunk(item: Item, edit: (md: string) => string, subject: string): boolean {
  const tree = trunkTree();
  const rel = `docs/${item.source}.md`;
  if (!tree) {
    commitOnRef(ROOT, TRUNK, rel, edit, subject);
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

  if (!git("remote", "get-url", "origin").ok) return true;
  const pushed = gitIn(tree || ROOT, "push", "origin", `${TRUNK}:${TRUNK}`);
  if (pushed.ok) console.log(`  pushed   origin/${TRUNK}`);
  else console.log(`  ⚑ origin/${TRUNK} not updated — run: git push origin ${TRUNK}`);
  return true;
}

/**
 * One file, rewritten and committed onto a branch nothing has checked out.
 *
 * Plumbing rather than a checkout: the branch's tree is read into an index of
 * its own, the one path is replaced by the edited blob, and the commit that
 * results is put on the ref with the old tip as its guard, so a ref that moved
 * meanwhile is refused rather than overwritten. The working tree this runs
 * from is never read and never written — the session is standing on its lane,
 * and its lane is nothing to do with the claim.
 *
 * Fails, rather than warns, when the branch is not there at all: a clone that
 * checked out one lane by name has no `main`, and a claim that cannot be
 * written is not a claim.
 */
export function commitOnRef(
  root: string,
  ref: string,
  rel: string,
  edit: (md: string) => string,
  subject: string,
): string {
  const tip = gitIn(root, "rev-parse", "--verify", "--quiet", `refs/heads/${ref}`);
  if (!tip.ok) throw new Error(`could not write ${rel} on ${ref}: no such branch here`);
  const was = gitWith({ cwd: root, raw: true }, "show", `${ref}:${rel}`);
  if (!was.ok) throw new Error(`could not read ${rel} on ${ref}: ${was.err}`);
  const blob = gitWith({ cwd: root, input: edit(was.out) }, "hash-object", "-w", "--stdin");
  if (!blob.ok) throw new Error(`could not write ${rel}: ${blob.err}`);
  const index = join(tmpdir(), `queue-${process.pid}-${Date.now()}.index`);
  const env = { GIT_INDEX_FILE: index };
  try {
    for (const step of [
      ["read-tree", tip.out],
      ["update-index", "--cacheinfo", `100644,${blob.out},${rel}`],
    ]) {
      const r = gitWith({ cwd: root, env }, ...step);
      if (!r.ok) throw new Error(`could not stage ${rel} on ${ref}: ${r.err}`);
    }
    const tree = gitWith({ cwd: root, env }, "write-tree");
    if (!tree.ok) throw new Error(`could not write a tree for ${ref}: ${tree.err}`);
    const made = gitIn(root, "commit-tree", tree.out, "-p", tip.out, "-m", subject);
    if (!made.ok) throw new Error(`could not commit ${rel} on ${ref}: ${made.err}`);
    const moved = gitIn(root, "update-ref", `refs/heads/${ref}`, made.out, tip.out);
    if (!moved.ok) throw new Error(`could not move ${ref}: ${moved.err}`);
    return made.out;
  } finally {
    rmSync(index, { force: true });
  }
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
