import { describe, expect, test } from "bun:test";
import { keepDays, orphanPaths, type RetryOpts, removeUntilGone } from "../worktree.js";

/** A fake disk: `gone` is how many attempts it takes before the path leaves. */
function disk(gone: number): { opts: RetryOpts; attempts: () => number; waits: () => number } {
  const tries = 0;
  let waited = 0;
  return {
    opts: {
      attempts: 3,
      delayMs: 0,
      exists: async () => tries < gone,
      wait: async () => {
        waited++;
      },
    },
    attempts: () => tries,
    waits: () => waited,
  };
}

describe("removeUntilGone", () => {
  test("a removal that works first time asks once and does not wait", async () => {
    let tries = 0;
    const failed = await removeUntilGone(
      "/x",
      async () => {
        tries++;
      },
      { attempts: 3, delayMs: 0, exists: async () => false, wait: async () => {} },
    );
    expect(failed).toBeUndefined();
    expect(tries).toBe(1);
  });

  test("a lagging handle is retried until the path is actually gone", async () => {
    let tries = 0;
    const failed = await removeUntilGone(
      "/x",
      async () => {
        tries++;
      },
      { attempts: 3, delayMs: 0, exists: async () => tries < 2, wait: async () => {} },
    );
    expect(failed).toBeUndefined();
    expect(tries).toBe(2);
  });

  test("a removal that reports success and leaves the directory is not believed", async () => {
    const failed = await removeUntilGone("/x", async () => {}, {
      attempts: 2,
      delayMs: 0,
      exists: async () => true,
      wait: async () => {},
    });
    expect(failed).toBe("still on disk after removal");
  });

  test("the last error is what comes back when every attempt threw", async () => {
    const failed = await removeUntilGone(
      "/x",
      async () => {
        throw new Error("held open");
      },
      { attempts: 2, delayMs: 0, exists: async () => true, wait: async () => {} },
    );
    expect(failed).toBe("held open");
  });

  test("it waits between attempts and not after the last one", async () => {
    const d = disk(99);
    await removeUntilGone("/x", async () => {}, d.opts);
    expect(d.waits()).toBe(2); // three attempts, two gaps
  });
});

describe("keepDays", () => {
  test("unset is the default window", () => {
    expect(keepDays(undefined)).toBe(5);
    expect(keepDays("")).toBe(5);
  });

  test("a number is taken as given, zero included", () => {
    expect(keepDays("14")).toBe(14);
    expect(keepDays("0")).toBe(0);
  });

  test("a typo falls back rather than reading as sweep-everything-now", () => {
    expect(keepDays("soon")).toBe(5);
    expect(keepDays("-3")).toBe(5);
  });
});

describe("orphanPaths", () => {
  test("what is on disk and not in git's list", () => {
    expect(orphanPaths(["/a", "/b", "/c"], ["/b"])).toEqual(["/a", "/c"]);
  });

  test("nothing on disk is nothing orphaned", () => {
    expect(orphanPaths([], ["/b"])).toEqual([]);
  });

  test("a fully registered set orphans none of it", () => {
    expect(orphanPaths(["/a", "/b"], ["/a", "/b", "/main"])).toEqual([]);
  });
});
