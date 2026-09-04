import { describe, expect, test } from "bun:test";
import { dueForSweep } from "../specs.js";

describe("dueForSweep", () => {
  const DAY = 86_400_000;
  const now = 10 * DAY;

  test("a file older than the window is due", () => {
    expect(dueForSweep([{ path: "/x", mtimeMs: now - 6 * DAY }], now, 5)).toEqual(["/x"]);
  });

  test("a file inside the window is kept", () => {
    expect(dueForSweep([{ path: "/x", mtimeMs: now - 2 * DAY }], now, 5)).toEqual([]);
  });

  test("exactly at the boundary is kept, not swept", () => {
    expect(dueForSweep([{ path: "/x", mtimeMs: now - 5 * DAY }], now, 5)).toEqual([]);
  });

  test("a zero window sweeps anything not from this instant", () => {
    expect(dueForSweep([{ path: "/x", mtimeMs: now - 1 }], now, 0)).toEqual(["/x"]);
  });

  test("only the old ones come back, in order", () => {
    const entries = [
      { path: "/old", mtimeMs: now - 9 * DAY },
      { path: "/new", mtimeMs: now - 1 * DAY },
      { path: "/older", mtimeMs: now - 20 * DAY },
    ];
    expect(dueForSweep(entries, now, 5)).toEqual(["/old", "/older"]);
  });
});
