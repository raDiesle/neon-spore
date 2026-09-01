import { describe, expect, it, test } from "bun:test";
import { clampWidth, MIN_WIDTH, parseWidth, widthKey } from "../src/column-width.js";
import { decideOpen, forcedClosedFromUrl, storageKey } from "../src/columns.js";

/**
 * A COLUMN COLLAPSES AS ONE UNIT, NOT THE HEADING INSIDE IT.
 *
 * `columns.ts` is `document.createElement`/`querySelectorAll`/inline-style
 * end to end, and this repo's test runner carries no real DOM (see
 * `demo-panel.test.ts`, `transport.test.ts`) — so, the same shape
 * `session.ts` uses for `parsePlace`/`placeToSearch`, the deciding logic is
 * pulled out as pure functions and tested directly: `forcedClosedFromUrl`
 * (parsing `?closed=`) and `decideOpen` (the priority between a URL override
 * and the human's own stored choice) — unchanged from the per-heading
 * mechanism this replaced, since that half was never the complaint. The DOM
 * wrapping itself is left to the browser, per `worktree-preview`/manual
 * verification.
 *
 * Which sections are marked `[data-column]`, and that they name a real track
 * in `main`'s own grid-template-columns, is checked against the real markup
 * below, the same source-text shape `sheet.test.ts` and `demo-panel.test.ts`
 * use for wiring a regex cannot exercise as behaviour.
 */

describe("forcedClosedFromUrl", () => {
  it("is null when the page carries no ?closed at all", () => {
    expect(forcedClosedFromUrl("")).toBeNull();
    expect(forcedClosedFromUrl("?wave=3")).toBeNull();
  });

  it("is the literal 'all' for ?closed=all", () => {
    expect(forcedClosedFromUrl("?closed=all")).toBe("all");
  });

  it("splits a comma list into a set of ids", () => {
    const forced = forcedClosedFromUrl("?closed=map,waves");
    expect(forced).not.toBeNull();
    expect(forced).not.toBe("all");
    expect([...(forced as ReadonlySet<string>)]).toEqual(["map", "waves"]);
  });

  it("trims whitespace and drops empty entries", () => {
    const forced = forcedClosedFromUrl("?closed=%20map%20,,waves");
    expect([...(forced as ReadonlySet<string>)]).toEqual(["map", "waves"]);
  });

  it("an empty value is an empty set, not 'all' and not null — nothing forced closed", () => {
    const forced = forcedClosedFromUrl("?closed=");
    expect(forced).not.toBeNull();
    expect(forced).not.toBe("all");
    expect([...(forced as ReadonlySet<string>)]).toEqual([]);
  });
});

describe("decideOpen — the URL always wins, storage otherwise, open by default", () => {
  test("no forced, no stored: open — a column nobody has touched starts visible", () => {
    expect(decideOpen("map", null, null)).toBe(true);
  });

  test("no forced: the human's own stored choice wins either way", () => {
    expect(decideOpen("map", null, true)).toBe(true);
    expect(decideOpen("map", null, false)).toBe(false);
  });

  test("forced 'all' closes every column regardless of what was stored open", () => {
    expect(decideOpen("map", "all", true)).toBe(false);
    expect(decideOpen("map", "all", null)).toBe(false);
  });

  test("forced set closes only the named ids", () => {
    const forced = new Set(["map", "waves"]);
    expect(decideOpen("map", forced, true)).toBe(false);
    expect(decideOpen("waves", forced, null)).toBe(false);
  });

  test("forced set leaves an unnamed column to its stored choice", () => {
    const forced = new Set(["map"]);
    expect(decideOpen("game", forced, true)).toBe(true);
    expect(decideOpen("game", forced, false)).toBe(false);
    expect(decideOpen("game", forced, null)).toBe(true);
  });
});

describe("storageKey", () => {
  it("is stable and namespaced, so two columns never collide", () => {
    expect(storageKey("map")).toBe("director-column:map");
    expect(storageKey("waves")).not.toBe(storageKey("game"));
  });
});

const html = await Bun.file(Bun.fileURLToPath(new URL("../index.html", import.meta.url))).text();

describe("which sections are marked data-column, in the real markup", () => {
  it("marks the four top-level columns the brief names", () => {
    for (const id of ["waves", "editor", "game", "map"]) {
      expect(html).toContain(`data-column="${id}"`);
    }
  });

  it("every marked column also carries a title, so its collapsed strip has something to say", () => {
    for (const id of ["waves", "editor", "game", "map"]) {
      const re = new RegExp(`data-column="${id}"[^>]*data-column-title="[^"]+"`);
      expect(html).toMatch(re);
    }
  });

  it("columns.ts is wired into main.ts before anything else touches the page", async () => {
    // Doesn't have to be literally the first call — only that it runs, so a
    // column added later still gets the handle by virtue of the
    // data-column attribute alone, with no per-column line in main.ts.
    const src = await Bun.file(
      Bun.fileURLToPath(new URL("../src/main.ts", import.meta.url)),
    ).text();
    expect(src).toMatch(/import \{ initColumns \} from "\.\/columns\.js";/);
    expect(src).toMatch(/^initColumns\(\);/m);
  });

  it("no data-panel survives — the per-heading mechanism this replaced is gone", () => {
    expect(html).not.toContain("data-panel");
  });
});

/**
 * A COLUMN IS ALSO DRAGGED, NOT ONLY COLLAPSED.
 *
 * `column-resize.ts` is pointer capture and inline styles end to end, so what
 * is tested here is the half that can go wrong silently: parsing and clamping
 * a stored width. A stored `0`, or a leftover `"auto"` from some future
 * change of mind, must read as "no override" rather than as a zero-width
 * column with no edge left to grab.
 */
describe("a dragged column width", () => {
  it("is namespaced away from the collapse flag, so neither can read the other", () => {
    expect(widthKey("map")).toBe("director-column-width:map");
    expect(widthKey("map")).not.toBe(storageKey("map"));
  });

  it("reads anything unusable as no override at all", () => {
    expect(parseWidth(null)).toBeNull();
    expect(parseWidth("")).toBeNull();
    expect(parseWidth("auto")).toBeNull();
    expect(parseWidth("0")).toBeNull();
    expect(parseWidth("-40")).toBeNull();
  });

  it("clamps what it does accept into the draggable range", () => {
    expect(parseWidth("12")).toBe(MIN_WIDTH);
    expect(parseWidth("420")).toBe(420);
    expect(clampWidth(99999)).toBeLessThan(99999);
  });

  it("column-resize.ts is wired into main.ts alongside the collapse", async () => {
    const src = await Bun.file(
      Bun.fileURLToPath(new URL("../src/main.ts", import.meta.url)),
    ).text();
    expect(src).toMatch(/^initColumnResize\(\);/m);
  });
});
