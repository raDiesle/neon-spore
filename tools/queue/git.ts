/**
 * The queue's git: one runner, and the one piece of plumbing that writes a
 * commit onto a branch nothing has checked out.
 *
 * Split out of `repo.ts` on 11 September 2026 when a claim learned to mark an
 * entry in the working tree and to take its branch back down on failure, which
 * put that file past 250 lines. What is here knows nothing about the queue —
 * no `Item`, no `ROOT`, no `main` — so it is the part of `repo.ts` a test can
 * point at a repository of its own.
 */

import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface Ran {
  ok: boolean;
  out: string;
  err: string;
}

export function gitIn(cwd: string, ...args: string[]): Ran {
  return gitWith({ cwd }, ...args);
}

/** `raw` keeps stdout as git wrote it — a file's content, not a ref's name. */
export function gitWith(
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
