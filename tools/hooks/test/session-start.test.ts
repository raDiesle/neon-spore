import { describe, expect, it } from "bun:test";
import { needsUpgrade, WANTED } from "../session-start.ts";

/**
 * The one decision the session-start hook makes that is not a side effect: is
 * the image's bun older than the version this repo needs. The fetch, the copy
 * and the PATH export are all downstream of this returning true, and getting it
 * backwards would either pin bun on every session for nothing or never pin it
 * at all — so it is the half worth holding.
 */
describe("needsUpgrade", () => {
  it("is true for the version the web image shipped, against what we want", () => {
    expect(needsUpgrade("1.3.11", WANTED)).toBe(true);
  });

  it("is false once bun is the wanted version or newer", () => {
    expect(needsUpgrade(WANTED, WANTED)).toBe(false);
    expect(needsUpgrade("1.4.3", WANTED)).toBe(false);
    expect(needsUpgrade("1.5.0", WANTED)).toBe(false);
    expect(needsUpgrade("2.0.0", WANTED)).toBe(false);
  });

  it("compares by numeric part, not by string — 1.3.11 is older than 1.4.2", () => {
    // The bug a lexical compare would hide: "1.3.11" > "1.4.2" as strings, so a
    // string compare would call the oldest shipped bun new enough and skip the
    // pin that this whole hook exists to do.
    expect(needsUpgrade("1.3.11", "1.4.2")).toBe(true);
    expect(needsUpgrade("1.10.0", "1.9.0")).toBe(false);
  });

  it("reads a pre-release as its release version", () => {
    expect(needsUpgrade("1.4.2-canary.1", "1.4.2")).toBe(false);
  });
});
