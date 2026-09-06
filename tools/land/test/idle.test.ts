import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { idleFrom, keepDays } from "../idle.js";

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

const NOW = 1_757_000_000_000;
const DAY = 86_400_000;

describe("idleFrom", () => {
  test("the age of the reflog is the idle time", async () => {
    const days = await idleFrom("/w/.git/worktrees/lane", NOW, async () => NOW - 3 * DAY);
    expect(days).toBeCloseTo(3, 6);
  });

  test("the reflog is the only file it may look at", async () => {
    const asked: string[] = [];
    await idleFrom("/w/.git/worktrees/lane", NOW, async (path) => {
      asked.push(path);
      return NOW;
    });
    // Anything else here is a file git rewrites on a read, and reading one is
    // how the clock came to be reset by the sweep's own probe.
    expect(asked).toEqual([join("/w/.git/worktrees/lane", "logs", "HEAD")]);
  });

  test("no reflog keeps the tree rather than sweeping it", async () => {
    expect(await idleFrom("/w/.git/worktrees/lane", NOW, async () => null)).toBe(0);
  });

  test("a reflog written in the future is not a negative age", async () => {
    expect(await idleFrom("/w/.git/worktrees/lane", NOW, async () => NOW + DAY)).toBe(0);
  });
});
