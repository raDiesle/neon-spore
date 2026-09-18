import { describe, expect, it } from "bun:test";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { held, release, take, withSlot } from "../slots.js";

const scratch = (): string => mkdtempSync(join(tmpdir(), "neon-spore-slots-test-"));

describe("taking a slot", () => {
  it("is refused when somebody living already holds it", () => {
    const dir = scratch();
    try {
      expect(take(dir, 0, process.pid)).toBe(true);
      expect(take(dir, 0, process.pid)).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("is granted when the holder is gone, so a killed run wedges nobody", () => {
    const dir = scratch();
    try {
      // A pid no process can have, so the liveness check always answers "gone".
      writeFileSync(join(dir, "0"), "2147483647");
      expect(take(dir, 0, process.pid)).toBe(true);
      expect(held(dir)).toEqual([0]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("leaves nothing behind when it is released", () => {
    const dir = scratch();
    try {
      take(dir, 0, process.pid);
      release(dir, 0);
      expect(readdirSync(dir)).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("the budget", () => {
  it("holds concurrent work to it however many callers there are", async () => {
    const dir = scratch();
    try {
      let now = 0;
      let most = 0;
      const one = async (): Promise<void> => {
        await withSlot(
          2,
          async () => {
            most = Math.max(most, ++now);
            await Bun.sleep(15);
            now--;
          },
          dir,
        );
      };
      await Promise.all(Array.from({ length: 8 }, one));
      expect(most).toBeLessThanOrEqual(2);
      expect(most).toBeGreaterThan(0);
      expect(readdirSync(dir)).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("makes the directory, so the first run on a fresh machine waits on nothing", async () => {
    const dir = join(scratch(), "never-made", "deeper");
    try {
      expect(await withSlot(2, async () => "ran", dir)).toBe("ran");
      expect(held(dir)).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("gives the slot back when the work throws, so one red shard blocks nothing", async () => {
    const dir = scratch();
    try {
      const boom = withSlot(1, () => Promise.reject(new Error("shard died")), dir);
      await expect(boom).rejects.toThrow("shard died");
      expect(readdirSync(dir)).toEqual([]);
      // And the next caller gets in, rather than waiting on a slot nobody holds.
      expect(await withSlot(1, async () => "in", dir)).toBe("in");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
