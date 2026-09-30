import { describe, expect, it } from "bun:test";
import { parseUnverified } from "../unverified.js";

/**
 * `--unverified` prints what a landing could not check and queues none of it
 * (`unverified.ts` has the owner's words). What is left to prove is the flag.
 */

describe("the flag itself", () => {
  it("is repeatable, in both spellings", () => {
    expect(
      parseUnverified(["--keep", "--unverified", "the wave at tempo", "--unverified=the shape"]),
    ).toEqual(["the wave at tempo", "the shape"]);
  });

  it("takes nothing from a bare flag, so the caller can notice and say so", () => {
    expect(parseUnverified(["--unverified"])).toEqual([]);
    expect(parseUnverified(["--unverified", "--push"])).toEqual([]);
    expect(parseUnverified(["--push"])).toEqual([]);
  });
});
