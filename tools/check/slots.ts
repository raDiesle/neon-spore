/**
 * **How many `bun test` shards run on this machine at once, counted across
 * every worktree rather than within one run.**
 *
 * `shards.ts`'s `pool` holds a run to its width, and that was the whole of the
 * bound until 18 September 2026. It is a bound on one run, and the owner does
 * not run one: eight lanes out of nine worktrees each started a pool eight
 * wide, so the machine carried sixty-four shards' worth of intent and nothing
 * anywhere knew the number. Two of them reached 10.7 GB and 11.5 GB resident,
 * four held about 26 GB between them, and swap went from 8 GB to 26.6 GB. No
 * single run was wrong. There were simply as many of them as the owner had
 * windows open.
 *
 * So the width moves out of the process and onto the filesystem, which is the
 * one thing every worktree shares. A slot is a file named for its number in a
 * directory under `tmpdir()`; taking one is `open(…, "wx")`, which the kernel
 * makes atomic, and there is no daemon, no port and no lockfile protocol
 * beyond "the file is the claim".
 *
 * **It bounds shards, not runs.** A whole-run lock was the other shape and it
 * is worse: a lane would wait minutes for another lane's suite to finish, and
 * a check that blocks is a check people stop running. Bounding at the shard
 * lets every lane make progress at once — eight lanes share eight slots, each
 * gets one, and the pool inside each lane simply finds its width already
 * spent. Nobody waits for a whole suite; everybody waits for one shard.
 *
 * A slot is held for the length of one `bun test` process and nothing nests
 * inside it, so there is no order in which two holders can wait on each other.
 */

import {
  closeSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Where the claims live: one directory for the machine, not for the checkout.
 * Two worktrees of this repository are two clones as far as the filesystem is
 * concerned, and the whole point is that they count against one budget.
 */
export const SLOT_DIR = join(tmpdir(), "neon-spore-shard-slots");

/**
 * How long a claim with no readable pid in it is believed. A `take` writes the
 * pid immediately after the create, so a reader that finds the file empty has
 * caught it mid-write — which is a held slot, not a dead one. A crash in that
 * gap would wedge the slot forever without a second answer, so an unreadable
 * claim older than this is reclaimed.
 */
const UNREADABLE_GRACE_MS = 10_000;

/** Whether a process is still there. `kill(pid, 0)` tests without signalling. */
function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    // `EPERM` is somebody else's process, which is very much alive.
    return (e as NodeJS.ErrnoException).code === "EPERM";
  }
}

/** Whether the claim in `file` belongs to a process that is gone. */
function abandoned(file: string): boolean {
  let text: string;
  try {
    text = readFileSync(file, "utf8").trim();
  } catch {
    // Taken away underneath us; whoever did that released it.
    return true;
  }
  const pid = Number(text);
  if (!Number.isInteger(pid) || pid <= 0) {
    try {
      return Date.now() - statSync(file).mtimeMs > UNREADABLE_GRACE_MS;
    } catch {
      return true;
    }
  }
  return !alive(pid);
}

/**
 * Take slot `i` in `dir` for `pid`, or answer `false` because somebody living
 * has it. A claim whose holder is gone is cleared and the take retried once —
 * once and not in a loop, because a second failure means another caller won
 * the race for the same corpse, and that caller holding it is the right
 * outcome.
 */
export function take(dir: string, i: number, pid: number): boolean {
  const file = join(dir, String(i));
  for (const second of [false, true]) {
    try {
      const fd = openSync(file, "wx");
      try {
        writeSync(fd, String(pid));
      } finally {
        closeSync(fd);
      }
      return true;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
      if (second || !abandoned(file)) return false;
      rmSync(file, { force: true });
    }
  }
  return false;
}

/** Give slot `i` back. Safe to call on one already gone. */
export function release(dir: string, i: number): void {
  rmSync(join(dir, String(i)), { force: true });
}

/** Which slots in `dir` are claimed, in order — for tests and for reporting. */
export function held(dir: string): number[] {
  try {
    return readdirSync(dir)
      .map(Number)
      .filter((n) => Number.isInteger(n))
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

/**
 * Run `work` holding one of `budget` slots, waiting for one when they are all
 * out. The slot is given back however `work` ends, so a red shard — or a
 * killed one, which is what this whole file is about — blocks nobody.
 *
 * The wait is a poll rather than a watch: a claim can be abandoned by a
 * `SIGKILL` that fires no filesystem event anybody is listening for, and a
 * shard runs for seconds at least, so a tenth of a second costs nothing. The
 * jitter keeps eight lanes that started together from testing the same slot on
 * the same tick forever.
 */
export async function withSlot<T>(
  budget: number,
  work: () => Promise<T>,
  dir: string = SLOT_DIR,
): Promise<T> {
  const width = Math.max(1, Math.floor(budget));
  const mine = await claim(dir, width);
  try {
    return await work();
  } finally {
    release(dir, mine);
  }
}

/** Block until one of `width` slots is ours, and answer which. */
async function claim(dir: string, width: number): Promise<number> {
  // The first run on a machine finds no directory, and an absent one is an
  // empty one: nobody holds anything, so this is a take that has to make its
  // own shelf rather than a state worth reporting.
  mkdirSync(dir, { recursive: true });
  for (;;) {
    for (let i = 0; i < width; i++) if (take(dir, i, process.pid)) return i;
    await Bun.sleep(100 + Math.floor(Math.random() * 100));
  }
}
