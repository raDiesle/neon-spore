import { describe, expect, it } from "bun:test";
import { LIVE, shotParams } from "../src/versus-shot.js";

/**
 * The two flags that make a VERSUS pair photographable, and the one rule they
 * are both held to: **an unrecognised value falls through to the running pair**.
 *
 * A stale link into this page already says so on screen rather than showing a
 * blank one (`versus-app.ts`). A stale *flag* has to be gentler still — the
 * candidate is what the page is for, and a mistyped camera setting must not be
 * able to hide it.
 */

const read = (query: string) => shotParams(new URLSearchParams(query));

describe("freeze", () => {
  it("is read in seconds", () => {
    expect(read("freeze=1.5").freezeSeconds).toBe(1.5);
  });

  it("takes zero, which is the first frame and not an absent flag", () => {
    expect(read("freeze=0").freezeSeconds).toBe(0);
  });

  it("leaves the pair running when it is absent, negative or a word", () => {
    expect(read("").freezeSeconds).toBeNull();
    expect(read("freeze=-1").freezeSeconds).toBeNull();
    expect(read("freeze=soon").freezeSeconds).toBeNull();
  });
});

describe("only", () => {
  it("names one side", () => {
    expect(read("only=candidate").only).toBe("candidate");
    expect(read("only=current").only).toBe("current");
  });

  it("shows both when it is absent or unrecognised", () => {
    expect(read("").only).toBe("both");
    expect(read("only=left").only).toBe("both");
  });
});

describe("the two together", () => {
  it("are read off one query string", () => {
    expect(read("slot=creature:dart&name=ember&freeze=2&only=candidate")).toEqual({
      freezeSeconds: 2,
      only: "candidate",
    });
  });

  it("come back as the live pair when the query has neither", () => {
    expect(read("slot=creature:dart&name=ember")).toEqual(LIVE);
  });
});
