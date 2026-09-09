/**
 * The replay, and the one conflict it settles on its own.
 *
 * `git rebase` is run here rather than in `run.ts` because it is no longer a
 * single call: a lane that drained a queue item conflicts on `docs/queue.md`
 * every single time — `bun run queue take` wrote the `Taken:` line on the trunk
 * and `bun run queue done` removed the entry in the lane — and that is a
 * conflict nobody authored and nobody should have to resolve. So a rebase that
 * stops on a queue file and nothing else is merged by `mergeQueue`, staged and
 * continued, as many times as there are commits that touch one.
 *
 * Anything else stops the landing exactly as before. The resolution is
 * entry-level and refuses to guess (`queue-merge.ts`), and the guard that
 * catches a finished entry coming back still runs afterwards, so this is a
 * shortcut through a known agreement rather than a new way to lose work.
 */

import { join as joinPath } from "node:path";
import { git } from "./git.js";
import { QUEUE_FILES } from "./queue-guard.js";
import { mergeQueue } from "./queue-merge.js";

export interface Replay {
  ok: boolean;
  /** Files whose conflict stopped the replay; empty when git failed some other way. */
  conflicted: string[];
  /** Queue files this settled by merging, in the order they came up. */
  resolved: string[];
  /** git's own first line, when there was no conflict to name. */
  said: string;
}

/** One stage of a conflicted path — "" when that side has no version of it. */
async function stage(root: string, n: number, file: string): Promise<string> {
  const proc = Bun.spawn(["git", "show", `:${n}:${file}`], {
    cwd: root,
    stdout: "pipe",
    stderr: "ignore",
  });
  const [out, code] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  return code === 0 ? out : "";
}

async function run(args: string[], root: string): Promise<{ code: number; err: string }> {
  const proc = Bun.spawn(["git", ...args], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, GIT_EDITOR: "true" },
  });
  const [err, code] = await Promise.all([new Response(proc.stderr).text(), proc.exited]);
  return { code, err };
}

/**
 * Replay this lane onto `trunk`, settling queue-file conflicts and stopping on
 * everything else. A failed replay is left aborted, so the worktree is on the
 * lane's own commits either way.
 */
export async function replay(root: string, trunk: string): Promise<Replay> {
  const resolved: string[] = [];
  let step = await run(["rebase", trunk], root);
  // One pass per commit that stops the replay; the rebase itself is what ends
  // the loop, and a commit that cannot be settled leaves through the `break`.
  while (step.code !== 0) {
    const listed = await git(["diff", "--name-only", "--diff-filter=U"], root);
    const conflicted = listed ? listed.split("\n") : [];
    if (conflicted.length === 0 || conflicted.some((file) => !QUEUE_FILES.includes(file))) {
      await run(["rebase", "--abort"], root);
      return { ok: false, conflicted, resolved, said: step.err.trim().split("\n")[0] ?? "" };
    }
    for (const file of conflicted) {
      const merged = mergeQueue(
        await stage(root, 1, file),
        await stage(root, 2, file),
        await stage(root, 3, file),
      );
      if (merged === null) {
        await run(["rebase", "--abort"], root);
        return { ok: false, conflicted, resolved, said: "" };
      }
      await Bun.write(joinPath(root, file), merged);
      await run(["add", "--", file], root);
      resolved.push(file);
    }
    step = await run(["rebase", "--continue"], root);
  }
  return { ok: true, conflicted: [], resolved, said: "" };
}
