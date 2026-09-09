import { describe, expect, test } from "bun:test";
import { alive, readRunning, runningFile } from "../running.js";

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
