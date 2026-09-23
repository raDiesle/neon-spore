import { describe, expect, it } from "bun:test";
import { fileURLToPath } from "node:url";
import { fileCosts } from "../../test/figure.js";

// What this file is allowed to take, scaled to how busy the machine is
// (`tools/test/repo-time.ts`), because bun's five-second default is a flat number and
// these cases are not. A supervisor and its child, both `bun`, and the case waits for
// both of them to be gone: 18 ms alone on the cloud image on 18 September 2026, and
// 270 ms alone on the slower of the two machines this runs on. The slower one is what
// is written down — the claim has to hold wherever the file runs, and being generous
// with a ceiling on patience costs nothing.
fileCosts(300);

/**
 * A supervisor that is told to stop takes its child with it.
 *
 * It did not, and the shape of the failure is why this test spawns rather than
 * asserting about a function: `child.kill()` followed by `process.exit(0)` sent
 * the signal and left before the kernel delivered it, so the supervised server
 * was reparented to init and went on holding its port. Nothing in the process
 * said so — `stop()` had returned — and the only thing that can tell the two
 * apart is a real process, killed, and then asked whether it is there.
 *
 * `bun run shot --serve` and `bun run versus:shot` are the callers that paid
 * for it: both start a director, kill one process and wait for it, which is
 * all a caller outside the tree can do. A person's Ctrl-C never showed it,
 * because a terminal signals the whole foreground group.
 *
 * **It found the same bug a second time, from the other end.** This case went
 * red on one shard of a 67-shard run and passed in 50 ms on its own, which
 * reads like a flaky test and was not: the handler used to be registered
 * twenty lines and a `watch()` below `spawn()`, so a stop arriving in that
 * window met the default disposition and left the child behind. Load widens
 * the window; nothing else about the run had anything to do with it. The
 * assertion below is strict on purpose and stays strict — the supervisor
 * awaits its child on every path out, so there is nothing here to poll for.
 */

// `fileURLToPath`, not `.pathname`: on Windows the latter is `/C:/…`, which is
// no directory to spawn in.
const SUPERVISOR = fileURLToPath(new URL("../supervise.ts", import.meta.url));
const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
/** The child prints its own pid and then does nothing for a long time. */
const CHILD = "console.log('child ' + process.pid); setInterval(() => {}, 60_000);";

/** Whether a pid is still there. Signal 0 is the ask with no signal sent. */
function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function pidOfChild(stdout: ReadableStream<Uint8Array>): Promise<number> {
  const reader = stdout.getReader();
  const decoder = new TextDecoder();
  let buffered = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) throw new Error(`the supervisor exited without a child:\n${buffered}`);
      buffered += decoder.decode(value, { stream: true });
      const said = buffered.match(/child (\d+)/);
      if (said) return Number(said[1]);
    }
  } finally {
    reader.releaseLock();
  }
}

describe("supervise.ts", () => {
  it("is gone, and so is its child, once it has been asked to stop", async () => {
    // The running bun by its path: a bare "bun" is ENOENT to `uv_spawn` on
    // Windows, where the executable is `bun.exe`.
    const bun = process.execPath;
    const supervisor = Bun.spawn([bun, SUPERVISOR, bun, "-e", CHILD], {
      cwd: ROOT,
      // The watcher restarts the child whenever the git directory moves, which
      // a test running beside a commit cannot rule out.
      env: { ...process.env, NO_DEV_RESTART: "1" },
      stdout: "pipe",
      stderr: "pipe",
    });
    const child = await pidOfChild(supervisor.stdout);
    expect(alive(child)).toBe(true);

    supervisor.kill();
    await supervisor.exited;

    // The supervisor waits for the child before leaving, so by the time its own
    // exit has been observed the child is already gone — no polling, which is
    // the whole of what this is testing.
    expect(alive(child)).toBe(false);
    expect(alive(supervisor.pid)).toBe(false);
    // No number of its own: the file's `setDefaultTimeout` above is the measured
    // one, and this is the case it was measured from.
  });
});
