/**
 * **The files a lane changed, as they were before it changed them** — what
 * `refresh.ts` measures a row against to decide whether a hand ever touched it.
 *
 * Two versions, where there are two: the merge base with `main`, so a lane
 * that has already committed is still measured against the trunk it started
 * from, and `HEAD`, so a row refreshed and committed mid-lane is still known
 * for the generator's own when the header moves again. On `main` they are one.
 * Only files `git diff` names are read at all; every other file answers
 * nothing, which leaves its row alone.
 *
 * **What this cannot see is a version that was never committed.** A header
 * rewritten twice between commits, with `bun run index` run after each, leaves
 * the row holding the middle sentence, which neither version derives — and it
 * is kept, as a person's words would be. Run it once the header is done.
 *
 * A checkout git cannot answer for — no `main`, a shallow clone, no git —
 * answers nothing for everything, and the generator does what it did before
 * this existed: keeps every surviving row as it is.
 */

import { execFileSync } from "node:child_process";

function git(root: string, args: readonly string[]): string | undefined {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return undefined;
  }
}

/** A reader of each changed file's earlier sources — at the base and at `HEAD`. */
export function sourceAtBase(root: string): (relPath: string) => readonly string[] {
  const base = git(root, ["merge-base", "HEAD", "main"])?.trim();
  const head = git(root, ["rev-parse", "HEAD"])?.trim();
  if (!base || !head) return () => [];
  const changed = new Set(
    (git(root, ["diff", "--name-only", base]) ?? "").split("\n").filter((l) => l.length > 0),
  );
  const shas = base === head ? [base] : [base, head];
  return (relPath) => {
    if (!changed.has(relPath)) return [];
    return shas.flatMap((sha) => git(root, ["show", `${sha}:${relPath}`]) ?? []);
  };
}
