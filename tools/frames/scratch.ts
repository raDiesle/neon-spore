/**
 * The throwaway checkouts `bun run frames` works out of: made, used, and — the
 * part that was missing — actually taken off disk again.
 *
 * Two callers need one of these (`serve.ts` builds a revision to photograph,
 * `wave.ts` asks the same revision what its waves are called) and both of them
 * used to tear it down the same wrong way: `git worktree remove --force`,
 * then an `rm` whose failure was swallowed. On Windows the git half
 * deregisters and then fails on a lagging `node_modules` handle, so the
 * directory outlives the registry entry and nothing ever comes back for it.
 * `%TEMP%` on this machine held five and a half thousand of them, each one a
 * checkout of this repository.
 *
 * So the order here is the one `tools/land/worktree.ts` settled on: the
 * directory goes first, retried against the transient handle, and git is only
 * told about it once there is nothing left to tell it about. The retry policy
 * itself is `tools/retry.ts`, called rather than written again.
 */

import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { REMOVE_ATTEMPTS, readdirSafe, removeUntilGone, retryOpts } from "../retry.js";
import { git } from "./exec.js";

/** Every scratch directory this tool makes starts with this, which is what
 * lets a later run recognise its own litter. */
export const SCRATCH_PREFIX = "neon-spore-frames-";

/** A scratch directory of this tool's own, under the system temp directory. */
export function scratchDir(suffix: string): Promise<string> {
  return mkdtemp(join(tmpdir(), `${SCRATCH_PREFIX}${suffix}`));
}

/**
 * A checkout of `rev` in a scratch directory, handed to `use`, and gone
 * afterwards whatever happened in there.
 *
 * `mkdtemp` then `rm` looks redundant and is not: it is how the name is
 * reserved, because `git worktree add` insists on a path that does not exist
 * yet and two of these can be running at once.
 */
export async function withScratchTree<T>(
  rev: string,
  use: (scratch: string) => Promise<T>,
): Promise<T> {
  const scratch = await scratchDir("");
  await rm(scratch, { recursive: true, force: true });
  await git(["worktree", "add", "--detach", scratch, rev]);
  try {
    return await use(scratch);
  } finally {
    await releaseScratchTree(scratch);
  }
}

/**
 * Take one scratch checkout off disk and only then tell git it is gone.
 *
 * Nothing here throws. A capture that produced its pictures has done what it
 * was asked, and a directory that will not go is worth a line on stderr rather
 * than an error that loses the frames — the next run sweeps it (`sweepScratch`).
 */
export async function releaseScratchTree(scratch: string): Promise<void> {
  const failed = await removeUntilGone(
    scratch,
    () => rm(scratch, { recursive: true, force: true }),
    retryOpts(REMOVE_ATTEMPTS),
  );
  if (failed !== undefined) {
    console.error(`could not remove ${scratch}: ${failed} — the next capture will sweep it`);
  }
  await git(["worktree", "prune"]).catch(() => {});
}

/** An hour, in milliseconds: how old a scratch directory has to be before a
 * later run is entitled to assume nobody is inside it. */
export const SCRATCH_STALE_MS = 3_600_000;

/**
 * Which of `%TEMP%`'s entries are this tool's own leavings, old enough that
 * whatever made them is long over.
 *
 * The age is the whole safety: two captures run at once often enough — a lane
 * photographing a commit and its parent does exactly that — and a sweep that
 * took a directory by name alone would delete a checkout somebody is building
 * in. Pure, and separately tested, because getting it wrong deletes things.
 */
export function staleScratch(
  entries: readonly { name: string; mtimeMs: number }[],
  now: number,
  staleMs = SCRATCH_STALE_MS,
): string[] {
  return entries
    .filter((e) => e.name.startsWith(SCRATCH_PREFIX) && now - e.mtimeMs > staleMs)
    .map((e) => e.name);
}

/**
 * Remove the scratch directories older runs left behind, best-effort.
 *
 * Called at the start of a capture rather than only at the end of one, because
 * the leavings that matter are exactly the ones whose run never reached its own
 * cleanup — a killed process, a machine restarted, a test timed out mid-build.
 */
export async function sweepScratch(now = Date.now()): Promise<number> {
  const dir = tmpdir();
  const entries: { name: string; mtimeMs: number }[] = [];
  for (const name of await readdirSafe(dir)) {
    if (!name.startsWith(SCRATCH_PREFIX)) continue;
    const info = await stat(join(dir, name)).catch(() => null);
    if (info?.isDirectory()) entries.push({ name, mtimeMs: info.mtimeMs });
  }

  let swept = 0;
  for (const name of staleScratch(entries, now)) {
    const failed = await removeUntilGone(
      join(dir, name),
      () => rm(join(dir, name), { recursive: true, force: true }),
      retryOpts(1),
    );
    if (failed === undefined) swept++;
  }
  if (swept > 0) await git(["worktree", "prune"]).catch(() => {});
  return swept;
}
