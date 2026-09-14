import { describe, expect, it } from "bun:test";

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
 */

const SUPERVISOR = new URL("../supervise.ts", import.meta.url).pathname;
const ROOT = new URL("../../../", import.meta.url).pathname;
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
    const supervisor = Bun.spawn(["bun", SUPERVISOR, "bun", "-e", CHILD], {
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
  }, 30_000);
});
