/**
 * Removing something from disk and then *asking* whether it went — the policy,
 * with the filesystem behind it kept swappable so a test can run it against a
 * fake disk in no time at all.
 *
 * Split out of `worktree.ts`, which had grown to hold four subjects. This is
 * the one with no git in it: everything here is a question about a path.
 */

import { readdir, stat } from "node:fs/promises";

export interface RetryOpts {
  attempts: number;
  delayMs: number;
  exists: (path: string) => Promise<boolean>;
  wait: (ms: number) => Promise<void>;
}

/**
 * Run `remove`, then ask `exists` whether it worked — never the exit code
 * alone, because on Windows `git worktree remove` and a plain `rm -rf` can
 * both report success or failure and be wrong either way while a lagging file
 * handle still holds the directory open (`node_modules` after a `bun install`
 * is the usual culprit).
 *
 * The handle is transient, not adversarial: measured on this machine, a second
 * attempt seconds later succeeded every time with nothing forced and nothing
 * killed. So this retries the same plain removal a few times with a short wait
 * between, rather than escalating to anything sharper — and it asks the
 * filesystem after *every* attempt, including ones where `remove` itself did
 * not throw, because a removal that reports success is not proof the directory
 * is actually gone.
 *
 * Returns `undefined` once the path is confirmed gone, or the last error seen
 * if every attempt left it standing. What a directory that will not go *means*
 * is the caller's decision, not this one's — this only says whether it went.
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

export async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * A directory listing where "not there" and "empty" are the same answer, which
 * is what both callers want: neither the idle window nor the orphan search has
 * anything to say about a directory that was never made.
 */
export async function readdirSafe(dir: string): Promise<string[]> {
  try {
    return await readdir(dir);
  } catch {
    return [];
  }
}

/** How many plain retries a stuck handle gets, and how long to wait between. */
export const REMOVE_ATTEMPTS = 3;
const REMOVE_DELAY_MS = 1500;

export function retryOpts(attempts: number): RetryOpts {
  return {
    attempts,
    delayMs: REMOVE_DELAY_MS,
    exists: pathExists,
    wait: (ms: number) => Bun.sleep(ms),
  };
}
