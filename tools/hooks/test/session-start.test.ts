import { describe, expect, it } from "bun:test";
import { belowPin, needsUpgrade, PIN_DIR, pinRefusal, WANTED } from "../bun-pin.ts";

/**
 * The one decision the session-start hook makes that is not a side effect: is
 * the image's bun older than the version this repo needs. The fetch, the copy
 * and the PATH export are all downstream of this returning true, and getting it
 * backwards would either pin bun on every session for nothing or never pin it
 * at all — so it is the half worth holding. It lives in `bun-pin.ts` now,
 * where the landing reads it too.
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

/**
 * What a session on a bun below the pin is told. The failure this holds is a
 * message that names the symptom and not the way through: the 14 September
 * 2026 lane had *Unknown lockfile version* in front of it and still had to
 * find `.bun-version`, the number and the npm line by itself.
 */
describe("belowPin", () => {
  it("says nothing when the running bun is the pin or newer", () => {
    expect(belowPin(WANTED, WANTED)).toBeNull();
    expect(belowPin("9.0.0", WANTED)).toBeNull();
  });

  it("names both versions, the file, and the two commands through", () => {
    const said = belowPin("1.3.8", "1.4.2")!;
    expect(said).not.toBeNull();
    const text = said.join("\n");
    expect(text).toContain("bun 1.3.8 is below the 1.4.2");
    expect(text).toContain(".bun-version");
    expect(text).toContain(`npm install bun@1.4.2 --prefix ${PIN_DIR}`);
    expect(text).toContain(`PATH=${PIN_DIR}/node_modules/.bin:$PATH bun run land`);
  });
});

/**
 * What `bun run check` and `bun run land` each say on top of `belowPin`'s own
 * lines — a first line that names which of theirs did not happen, so a shell
 * on the wrong bun cannot read either as having quietly passed.
 */
describe("pinRefusal", () => {
  it("says nothing when the running bun is the pin or newer", () => {
    expect(pinRefusal(WANTED, WANTED, "checked")).toBeNull();
    expect(pinRefusal("9.0.0", WANTED, "moved")).toBeNull();
  });

  it("leads with the verb that stopped, over belowPin's own lines", () => {
    const said = pinRefusal("1.3.11", "1.4.2", "checked")!;
    expect(said).not.toBeNull();
    expect(said[0]).toBe(
      "✗ bun 1.3.11 is below the 1.4.2 this repository is pinned to (.bun-version); nothing was checked",
    );
    expect(said.slice(1)).toEqual(belowPin("1.3.11", "1.4.2")!.slice(1));
  });

  it("says a different verb for a different caller, off the one comparison", () => {
    const checked = pinRefusal("1.3.11", "1.4.2", "checked")![0];
    const moved = pinRefusal("1.3.11", "1.4.2", "moved")![0];
    expect(checked).toContain("nothing was checked");
    expect(moved).toContain("nothing was moved");
  });
});
