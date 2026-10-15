import { spawnSync } from "node:child_process";

/**
 * **The source files that could name something, asked of `git grep`** rather
 * than read one by one — `importers.ts` and `take-function-fs.ts` ask it before
 * they read anything, and read only what it names.
 *
 * On 15 October 2026 `bun run versus drop blister:turn` sat three minutes
 * silent in a fresh worktree, and its importer scan alone took 3:16 wall
 * clock on 0.15 s of CPU. Timed by halves in another fresh tree: listing the
 * 5,750 sources took 2.9 s, and reading them 128 s — 17 ms an open, waiting
 * and not working, against 1 ms the run after. Sixty-four at a time
 * (`tools/test/tree-text.ts`) brought that to 20 s. `git grep` over the same
 * never-read tree answered in 0.2 s, so it is the first question and a read
 * is only ever of a file it named.
 *
 * `--untracked` so a file not yet added still counts — the lane that writes an
 * importer and runs `drop` before committing is the case this guards — and
 * `.gitignore` keeps it out of `node_modules`, `dist` and the rest. `null` where
 * git cannot answer (a directory that is no checkout, as the tests' temporary
 * trees are), and the caller walks the tree as before.
 */
export function filesHolding(
  root: string,
  dirs: readonly string[],
  needles: readonly string[],
): string[] | null {
  const args = ["grep", "-l", "-z", "-F", "--untracked"];
  for (const n of needles) args.push("-e", n);
  const run = spawnSync("git", [...args, "--", ...dirs], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  // 1 is git grep's "nothing matched"; anything else is git unable to answer.
  if (run.status === 1) return [];
  if (run.status !== 0) return null;
  return run.stdout.split("\0").filter((f) => f.length > 0 && /\.(ts|tsx)$/.test(f));
}
