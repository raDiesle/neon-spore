/**
 * The retry-and-verify shape a worktree removal needs on Windows, and the
 * pure half of finding worktree directories git has forgotten about.
 *
 * Split out of `repo.ts` for the same reason `checks.ts` is: the decision of
 * how many times to retry and when to give up should be tested without a
 * filesystem or a git process behind it.
 */

export interface RetryOpts {
  attempts: number;
  delayMs: number;
  exists: (path: string) => Promise<boolean>;
  wait: (ms: number) => Promise<void>;
}

/**
 * Run `remove`, then ask `exists` whether it worked — never the exit code
 * alone, because on Windows `git worktree remove` and a plain `rm -rf` can
 * both report success or failure and be wrong either way while a lagging
 * file handle still holds the directory open (`node_modules` after a `bun
 * install` is the usual culprit).
 *
 * The handle is transient, not adversarial: measured on this machine, a
 * second attempt seconds later succeeded every time with nothing forced and
 * nothing killed. So this retries the same plain removal a few times with a
 * short wait between, rather than escalating to anything sharper — and it
 * asks the filesystem after *every* attempt, including ones where `remove`
 * itself did not throw, because a removal that reports success is not
 * proof the directory is actually gone.
 *
 * Returns `undefined` once the path is confirmed gone, or the last error
 * seen if every attempt left it standing. What a directory that will not go
 * *means* is the caller's decision, not this one's — this only says whether
 * it went.
 */
export async function removeUntilGone(
  path: string,
  remove: () => Promise<void>,
  opts: RetryOpts,
): Promise<string | undefined> {
  let lastError = "";
  for (let attempt = 1; attempt <= opts.attempts; attempt++) {
    try {
      await remove();
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    if (!(await opts.exists(path))) return undefined;
    if (attempt < opts.attempts) await opts.wait(opts.delayMs);
  }
  return lastError || "still on disk after removal";
}

/**
 * Directories on disk that git's own worktree list does not mention — the
 * litter a half-finished removal leaves once the directory survives a
 * `remove` that reported success, or a `prune` runs before anyone checked
 * the directory was actually gone. Plain set difference; both lists are
 * pre-resolved to absolute paths by the caller so a trailing slash or a
 * different case does not read as a mismatch.
 */
export function orphanPaths(onDisk: readonly string[], registered: readonly string[]): string[] {
  const known = new Set(registered);
  return onDisk.filter((path) => !known.has(path));
}
