import { describe, expect, it } from "bun:test";
import { within } from "../deadline.js";
import { SHEET_MS, stalled } from "../sheet.js";

/**
 * The race `serve.ts` and `sheet.ts` both put a stalling step through. What it
 * is for is the second case: a promise that never settles has to become a throw
 * that says which step it was, because the alternative, on 30 September 2026,
 * was a sheet that printed nothing for fifty minutes.
 */

describe("within", () => {
  it("hands back what the step answered when it answers in time", async () => {
    expect(await within(Promise.resolve(7), Date.now() + 1_000, "late")).toBe(7);
  });

  it("throws the message it was given for a step that never answers", async () => {
    const never = new Promise<number>(() => {});
    await expect(within(never, Date.now() + 20, "gave up launching")).rejects.toThrow(
      "gave up launching",
    );
  });

  it("passes a step's own failure through, not the deadline's", async () => {
    const broken = Promise.reject(new Error("no chrome"));
    await expect(within(broken, Date.now() + 1_000, "late")).rejects.toThrow("no chrome");
  });

  it("throws at once for a deadline already past", async () => {
    const never = new Promise<number>(() => {});
    await expect(within(never, Date.now() - 1, "past")).rejects.toThrow("past");
  });
});

describe("a sheet that runs out of time", () => {
  it("names the step it was on and how long it waited", () => {
    expect(stalled("writing the sheet")).toContain("writing the sheet");
    expect(stalled("launching the browser")).toContain(`${SHEET_MS / 1000} s`);
  });

  it("waits a minute, which six frames never need", () => {
    expect(SHEET_MS).toBe(60_000);
  });
});
