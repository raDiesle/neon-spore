import { describe, expect, test } from "bun:test";
import { type Place, parsePlace, placeToSearch } from "../src/session.js";

/**
 * `parsePlace`/`placeToSearch` are the pure half of `session.ts` — the half
 * that does not need a `window` to exercise. `bindPlace` itself (the DOM
 * wiring) is left to a human at the real director, per the brief: a click
 * path is what `worktree-preview`/manual verification is for, not a stub
 * `document`.
 */

describe("parsePlace", () => {
  test("reads a known tab and a wave index", () => {
    expect(parsePlace("?tab=tuning&wave=7")).toEqual({ tab: "tuning", wave: 7 });
  });

  test("falls back to the default tab on an unknown value", () => {
    expect(parsePlace("?tab=nonsense&wave=3")).toEqual({ tab: "wave", wave: 3 });
  });

  test("falls back to the default tab when none is named", () => {
    expect(parsePlace("")).toEqual({ tab: "wave", wave: null });
  });

  test("treats a malformed wave as none named", () => {
    for (const bad of ["?wave=abc", "?wave=-1", "?wave=1.5", "?wave="]) {
      expect(parsePlace(bad).wave, bad).toBeNull();
    }
  });

  test("accepts a wave of zero", () => {
    expect(parsePlace("?wave=0").wave).toBe(0);
  });
});

describe("placeToSearch", () => {
  test("round-trips tab and wave", () => {
    const place: Place = { tab: "tuning", wave: 7 };
    expect(placeToSearch(place)).toBe("?tab=tuning&wave=7");
    expect(parsePlace(placeToSearch(place))).toEqual(place);
  });

  test("omits wave when there is none, never a bare '?'", () => {
    expect(placeToSearch({ tab: "wave", wave: null })).toBe("?tab=wave");
  });
});
