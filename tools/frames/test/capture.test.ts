import { describe, expect, it } from "bun:test";
import { pickChrome } from "../capture.js";

/**
 * `pickChrome` is the part of `capture.ts` that does not need an actual
 * browser on disk — the search order, and what happens when nothing on it
 * exists. The browser launch itself is proven by hand, per the report in the
 * commit that added this file: `bun run tools/frames/run.ts <sha>` against a
 * real commit, twice, with the resulting pair looked at.
 */
describe("pickChrome", () => {
  it("takes the first candidate that exists", () => {
    const found = pickChrome(
      ["/nope", "/also-nope", "/yes", "/yes-2"],
      (p) => p === "/yes" || p === "/yes-2",
    );
    expect(found).toBe("/yes");
  });

  it("skips undefined candidates — FRAMES_CHROME unset", () => {
    const found = pickChrome([undefined, "/yes"], (p) => p === "/yes");
    expect(found).toBe("/yes");
  });

  it("throws, naming FRAMES_CHROME, when nothing on the list exists", () => {
    expect(() => pickChrome(["/nope"], () => false)).toThrow(/FRAMES_CHROME/);
  });
});
