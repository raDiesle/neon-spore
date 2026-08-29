import { describe, expect, test } from "bun:test";
import { type Place, parsePlace, placeToSearch } from "../src/session.js";

/**
 * `parsePlace`/`placeToSearch` are the pure half of `session.ts` — the half
 * that does not need a `window` to exercise. `bindPlace`, `openSheet` and
 * `closeSheet` themselves (the DOM wiring) are left to a human at the real
 * director, per the brief: a click path is what `worktree-preview`/manual
 * verification is for, not a stub `document`.
 */

describe("parsePlace", () => {
  test("reads a known tab and a wave index", () => {
    expect(parsePlace("?tab=tuning&wave=7")).toEqual({
      tab: "tuning",
      wave: 7,
      sheet: null,
      inner: null,
    });
  });

  test("falls back to the default tab on an unknown value", () => {
    expect(parsePlace("?tab=nonsense&wave=3")).toEqual({
      tab: "wave",
      wave: 3,
      sheet: null,
      inner: null,
    });
  });

  test("falls back to the default tab when none is named", () => {
    expect(parsePlace("")).toEqual({ tab: "wave", wave: null, sheet: null, inner: null });
  });

  test("treats a malformed wave as none named", () => {
    for (const bad of ["?wave=abc", "?wave=-1", "?wave=1.5", "?wave="]) {
      expect(parsePlace(bad).wave, bad).toBeNull();
    }
  });

  test("accepts a wave of zero", () => {
    expect(parsePlace("?wave=0").wave).toBe(0);
  });

  test("reads a sheet and its inner tab", () => {
    expect(parsePlace("?tab=wave&sheet=backlog&inner=spec")).toEqual({
      tab: "wave",
      wave: null,
      sheet: "backlog",
      inner: "spec",
    });
  });

  test("an opaque sheet name round-trips even when this module has never heard of it", () => {
    // session.ts does not know the sheet names — each page owns its own —
    // so a name nothing (yet) recognises still parses, and it is the page's
    // job, not this module's, to fall back when it does not match.
    expect(parsePlace("?sheet=some-future-sheet").sheet).toBe("some-future-sheet");
  });

  test("drops an inner tab with no sheet named beside it", () => {
    expect(parsePlace("?tab=wave&inner=spec")).toEqual({
      tab: "wave",
      wave: null,
      sheet: null,
      inner: null,
    });
  });

  test("an empty sheet or inner is the same as none named", () => {
    expect(parsePlace("?sheet=&inner=").sheet).toBeNull();
    expect(parsePlace("?sheet=&inner=").inner).toBeNull();
  });
});

describe("placeToSearch", () => {
  test("round-trips tab and wave", () => {
    const place: Place = { tab: "tuning", wave: 7, sheet: null, inner: null };
    expect(placeToSearch(place)).toBe("?tab=tuning&wave=7");
    expect(parsePlace(placeToSearch(place))).toEqual(place);
  });

  test("omits wave when there is none, never a bare '?'", () => {
    expect(placeToSearch({ tab: "wave", wave: null, sheet: null, inner: null })).toBe("?tab=wave");
  });

  test("round-trips a sheet and its inner tab", () => {
    const place: Place = { tab: "wave", wave: null, sheet: "checks", inner: null };
    expect(placeToSearch(place)).toBe("?tab=wave&sheet=checks");
    expect(parsePlace(placeToSearch(place))).toEqual(place);

    const withInner: Place = { tab: "wave", wave: 2, sheet: "backlog", inner: "spec" };
    expect(placeToSearch(withInner)).toBe("?tab=wave&wave=2&sheet=backlog&inner=spec");
    expect(parsePlace(placeToSearch(withInner))).toEqual(withInner);
  });

  test("never writes inner when there is no sheet", () => {
    // Not reachable through placeToSearch's own inputs if callers respect the
    // invariant, but a stray inner on a sheet-less Place must still not leak
    // into the URL — the parse side already refuses to read it back.
    const place: Place = { tab: "wave", wave: null, sheet: null, inner: "spec" };
    expect(placeToSearch(place)).toBe("?tab=wave");
  });
});
