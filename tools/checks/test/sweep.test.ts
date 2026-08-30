import { describe, expect, test } from "bun:test";
import { orphanPaths, removeUntilGone } from "../sweep.js";

/**
 * A fake "is it gone" ledger: `removeUntilGone` never touches the real
 * filesystem in these tests, so the retry shape is proven without a
 * worktree, a lock, or a timer to wait out.
 */
function fakeDisk(goneAfterAttempt: number | null) {
  let attempt = 0;
  return {
    exists: async (_path: string) => {
      // Called once before the first attempt's removal runs and once after
      // every attempt — so "gone after attempt N" reads as clause below.
      return goneAfterAttempt === null || attempt < goneAfterAttempt;
    },
    remove: async () => {
      attempt++;
    },
  };
}

describe("removeUntilGone", () => {
  test("returns undefined the moment the path is confirmed gone", async () => {
    const waits: number[] = [];
    const disk = fakeDisk(1); // gone right after the first remove() call
    const result = await removeUntilGone("/some/path", disk.remove, {
      attempts: 3,
      delayMs: 1000,
      exists: disk.exists,
      wait: async (ms) => {
        waits.push(ms);
      },
    });
    expect(result).toBeUndefined();
    expect(waits).toEqual([]); // never waited: it went on the first try
  });

  test("retries a few times with a wait between, before giving up", async () => {
    let attempts = 0;
    const waits: number[] = [];
    const result = await removeUntilGone(
      "/stuck/path",
      async () => {
        attempts++;
      },
      {
        attempts: 3,
        delayMs: 250,
        exists: async () => true, // never actually goes
        wait: async (ms) => {
          waits.push(ms);
        },
      },
    );
    expect(attempts).toBe(3);
    expect(waits).toEqual([250, 250]); // waited between attempts, not after the last
    expect(result).toBe("still on disk after removal");
  });

  test("a removal that throws is not fatal — the exists check still decides it", async () => {
    // The measured Windows failure: `git worktree remove` reports
    // "Directory not empty" and a second attempt seconds later succeeds
    // with nothing forced. A throw from `remove` must not short-circuit
    // the retry the way an uncaught exception would.
    let attempt = 0;
    const result = await removeUntilGone(
      "/flaky/path",
      async () => {
        attempt++;
        if (attempt === 1) throw new Error("Directory not empty");
      },
      {
        attempts: 3,
        delayMs: 1,
        exists: async () => attempt < 2,
        wait: async () => {},
      },
    );
    expect(result).toBeUndefined();
    expect(attempt).toBe(2);
  });

  test("the last error is reported when every attempt fails", async () => {
    const result = await removeUntilGone(
      "/dead/path",
      async () => {
        throw new Error("EBUSY: resource busy or locked");
      },
      { attempts: 2, delayMs: 1, exists: async () => true, wait: async () => {} },
    );
    expect(result).toBe("EBUSY: resource busy or locked");
  });
});

describe("orphanPaths", () => {
  test("a directory git still lists is not an orphan", () => {
    expect(orphanPaths(["/a", "/b"], ["/a", "/b"])).toEqual([]);
  });

  test("a directory on disk with no registry entry is an orphan", () => {
    expect(orphanPaths(["/a", "/b", "/c"], ["/a"])).toEqual(["/b", "/c"]);
  });

  test("a registry entry with nothing on disk is not reported here — this only reads what exists", () => {
    expect(orphanPaths(["/a"], ["/a", "/gone"])).toEqual([]);
  });

  test("empty disk, or nothing registered, both fall out of the same set difference", () => {
    expect(orphanPaths([], ["/a"])).toEqual([]);
    expect(orphanPaths(["/a"], [])).toEqual(["/a"]);
  });
});
