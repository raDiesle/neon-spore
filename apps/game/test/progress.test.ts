import { describe, expect, it } from "bun:test";
import {
  hasProgress,
  NOTHING_YET,
  parseProgress,
  progressLine,
  reached,
  timed,
} from "../src/progress.js";

/**
 * How far this device has got. The deciding is pure so it can be tested at
 * all — this runner has no DOM and therefore no `localStorage` — and the
 * storage around it is four wrapped lines.
 */

describe("reaching a wave", () => {
  it("records the first one", () => {
    expect(reached(NOTHING_YET, 6).furthest).toBe(6);
  });

  it("only ever goes up", () => {
    const far = reached(NOTHING_YET, 6);
    // Jumping to wave three from the WAVES list is not losing wave seven, and
    // neither is starting over.
    expect(reached(far, 2).furthest).toBe(6);
    expect(reached(far, 0).furthest).toBe(6);
  });

  it("ignores a wave that is not a number a wave can be", () => {
    expect(reached(NOTHING_YET, Number.NaN)).toEqual(NOTHING_YET);
    expect(reached(NOTHING_YET, -3)).toEqual(NOTHING_YET);
  });

  it("leaves the clock alone", () => {
    const p = reached({ furthest: 0, lastSeconds: 222, lastRetries: 2 }, 4);
    expect([p.lastSeconds, p.lastRetries]).toEqual([222, 2]);
  });
});

describe("the clock", () => {
  it("is the last one seen, quick or slow", () => {
    const after = timed({ furthest: 3, lastSeconds: 500, lastRetries: 4 }, 222, 2);
    expect([after.lastSeconds, after.lastRetries]).toEqual([222, 2]);
    expect(after.furthest).toBe(3);
  });

  it("ignores a figure that is not one", () => {
    expect(timed(NOTHING_YET, Number.NaN, 0)).toEqual(NOTHING_YET);
    expect(timed(NOTHING_YET, -1, 0)).toEqual(NOTHING_YET);
    expect(timed(NOTHING_YET, 10, -1)).toEqual(NOTHING_YET);
  });
});

describe("reading what was stored", () => {
  it("says never played when there is nothing", () => {
    expect(parseProgress(null)).toEqual(NOTHING_YET);
  });

  it("reads a record it wrote", () => {
    const written = JSON.stringify({ furthest: 6, lastSeconds: 222, lastRetries: 2 });
    expect(parseProgress(written)).toEqual({ furthest: 6, lastSeconds: 222, lastRetries: 2 });
  });

  it("says never played rather than throwing on anything unreadable", () => {
    // A player whose stored record has gone strange wants a menu, not an error.
    for (const raw of ["", "{", "null", "7", '"hello"', "[1,2]"]) {
      expect(parseProgress(raw)).toEqual(NOTHING_YET);
    }
  });

  it("drops fields that cannot have come from this code", () => {
    const odd = JSON.stringify({ furthest: -4, lastSeconds: "222", lastRetries: -1 });
    expect(parseProgress(odd)).toEqual(NOTHING_YET);
  });

  it("keeps the half it can read when the other half is nonsense", () => {
    const half = JSON.stringify({ furthest: 6, lastSeconds: null });
    expect(parseProgress(half)).toEqual({ furthest: 6, lastSeconds: 0, lastRetries: 0 });
  });

  it("reads a record written before the clock, as the wave alone", () => {
    // The stored score is simply not there any more; the wave still is.
    const old = JSON.stringify({ furthest: 6, lastScore: 12_300 });
    expect(parseProgress(old)).toEqual({ furthest: 6, lastSeconds: 0, lastRetries: 0 });
    expect(progressLine(parseProgress(old))).toBe("Furthest: wave 7");
  });
});

describe("the line under the title", () => {
  it("is nothing at all for a device that has never played", () => {
    expect(hasProgress(NOTHING_YET)).toBe(false);
    expect(progressLine(NOTHING_YET)).toBe("");
  });

  it("counts waves the way a player does, from one", () => {
    expect(progressLine({ furthest: 6, lastSeconds: 222, lastRetries: 2 })).toBe(
      "Furthest: wave 7 · Last run 3:42 · 2 retries",
    );
    expect(progressLine({ furthest: 0, lastSeconds: 61, lastRetries: 0 })).toBe(
      "Furthest: wave 1 · Last run 1:01 · no retries",
    );
  });
});
