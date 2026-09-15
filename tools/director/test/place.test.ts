import { describe, expect, test } from "bun:test";
import { type Place, parsePlace, placeToSearch } from "../src/place.js";

/**
 * `place.ts` is the half of the URL that needs no browser: a `Place` value and
 * the two functions that turn it into a query string and back. Its fallback
 * rules are the ones a link from three weeks ago runs into, so they are
 * exercised here directly. The wiring that reads and writes them lives in
 * `session.ts` and is tested in `session.test.ts`, against `fake-dom.ts`.
 */

describe("parsePlace", () => {
  test("reads a wave index", () => {
    expect(parsePlace("?wave=7")).toEqual({ wave: 7, sheet: null, inner: null });
  });

  test("names nothing at all when the search is empty", () => {
    expect(parsePlace("")).toEqual({ wave: null, sheet: null, inner: null });
  });

  /**
   * **`?tab=` is a parameter this tool wrote for months and no longer has.**
   * The editor's bar held four tabs and lost them one at a time; the last went
   * on 15 September 2026. A link somebody saved while it existed still opens
   * the page it named, and the dead parameter is simply not read — which is
   * the fallback every other stale value here already gets.
   */
  test("ignores a tab a saved link still carries", () => {
    expect(parsePlace("?tab=tuning&wave=3")).toEqual({ wave: 3, sheet: null, inner: null });
    expect(parsePlace("?tab=nonsense")).toEqual({ wave: null, sheet: null, inner: null });
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
    expect(parsePlace("?sheet=backlog&inner=spec")).toEqual({
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
    expect(parsePlace("?inner=spec")).toEqual({ wave: null, sheet: null, inner: null });
  });

  test("an empty sheet or inner is the same as none named", () => {
    expect(parsePlace("?sheet=&inner=").sheet).toBeNull();
    expect(parsePlace("?sheet=&inner=").inner).toBeNull();
  });
});

describe("placeToSearch", () => {
  test("round-trips a wave", () => {
    const place: Place = { wave: 7, sheet: null, inner: null };
    expect(placeToSearch(place)).toBe("?wave=7");
    expect(parsePlace(placeToSearch(place))).toEqual(place);
  });

  test("is the empty string when there is nowhere to be, never a bare '?'", () => {
    // It was `?tab=wave` until the editor's bar lost its last tab: the tool
    // wrote a parameter on every load whether or not anything had been
    // navigated to. A place that names nothing now writes nothing.
    expect(placeToSearch({ wave: null, sheet: null, inner: null })).toBe("");
  });

  test("round-trips a sheet and its inner tab", () => {
    const place: Place = { wave: null, sheet: "checks", inner: null };
    expect(placeToSearch(place)).toBe("?sheet=checks");
    expect(parsePlace(placeToSearch(place))).toEqual(place);

    const withInner: Place = { wave: 2, sheet: "backlog", inner: "spec" };
    expect(placeToSearch(withInner)).toBe("?wave=2&sheet=backlog&inner=spec");
    expect(parsePlace(placeToSearch(withInner))).toEqual(withInner);
  });

  test("never writes inner when there is no sheet", () => {
    // Not reachable through placeToSearch's own inputs if callers respect the
    // invariant, but a stray inner on a sheet-less Place must still not leak
    // into the URL — the parse side already refuses to read it back.
    const place: Place = { wave: null, sheet: null, inner: "spec" };
    expect(placeToSearch(place)).toBe("");
  });
});
