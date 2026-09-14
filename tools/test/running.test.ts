import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { alive, announce, readRunning, runningFile } from "../running.js";

/**
 * The note a server on an un-derivable port leaves for `bun run port`.
 *
 * The one thing worth a test is the *stale* file: a server killed outright
 * never gets to remove its own, so a reader that believed what was on disk
 * would name a port nothing answers on — which is the failure this whole
 * mechanism exists to end, arriving from the other side.
 */

describe("what a running server wrote", () => {
  test("a live pid is reported", () => {
    expect(readRunning('{"port":58200,"pid":42}', () => true)).toEqual({ port: 58200, pid: 42 });
  });

  test("a file left behind by a killed server is not", () => {
    expect(readRunning('{"port":58200,"pid":42}', () => false)).toBeUndefined();
  });

  test("a half-written file is not either", () => {
    expect(readRunning('{"port":58', () => true)).toBeUndefined();
    expect(readRunning('{"pid":42}', () => true)).toBeUndefined();
  });

  test("this process is alive and pid 0 is not a process to signal", () => {
    expect(alive(process.pid)).toBe(true);
    expect(alive(2 ** 30)).toBe(false);
  });

  test("one file per pinning variable, under the ignored scratch directory", () => {
    const path = runningFile("/tree", "DIRECTOR_PORT").split("\\").join("/");
    expect(path).toBe("/tree/.claude/tmp/director_port.json");
  });
});

/**
 * **Announcing a port must not take the process's death with it.**
 *
 * It caught SIGINT and SIGTERM to remove its own file — and a listener on a
 * signal turns off the death that signal would otherwise be, so it had to
 * `process.exit(0)` itself. Registered first, it exited first, and every
 * handler the program added afterwards never ran: `bun run dev:once` announces
 * its pinned port and then arranges to take its server down with it, and that
 * arrangement never once happened. The server outlived the stop that reported
 * it gone.
 *
 * The count is the test because the fault is not what the handler did but that
 * there was one at all.
 */
describe("announcing a port", () => {
  test("adds no signal handler, so nothing registered after it is pre-empted", () => {
    const root = mkdtempSync(join(tmpdir(), "running-"));
    const before = {
      SIGINT: process.listenerCount("SIGINT"),
      SIGTERM: process.listenerCount("SIGTERM"),
    };
    try {
      announce(root, "TEST_PORT", 58200);
      expect(process.listenerCount("SIGINT")).toBe(before.SIGINT);
      expect(process.listenerCount("SIGTERM")).toBe(before.SIGTERM);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
