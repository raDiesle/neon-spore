import { describe, expect, test } from "bun:test";
import { bindPlace, mountSheet, type Place, parsePlace, placeToSearch } from "../src/session.js";

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

/**
 * `mountSheet`'s restore path is the one piece of this module a pure test
 * cannot reach, and it is where the bug lived: the wanted inner tab was read
 * after `open.click()` had already written the bar's default over it, so
 * `?sheet=…&inner=…` always opened on the first tab. This repo carries no
 * jsdom and no happy-dom, so the few DOM calls `session.ts` actually makes —
 * two selector shapes, a class list, a dataset and a click — are stood up by
 * hand below rather than by adding a dependency for one test.
 */

class FakeEl {
  readonly classes = new Set<string>();
  readonly dataset: { tab?: string } = {};
  private readonly clicks: Array<() => void> = [];
  readonly classList = {
    toggle: (name: string, on: boolean): void => {
      if (on) this.classes.add(name);
      else this.classes.delete(name);
    },
    contains: (name: string): boolean => this.classes.has(name),
  };
  addEventListener(type: string, fn: () => void): void {
    if (type === "click") this.clicks.push(fn);
  }
  click(): void {
    for (const fn of [...this.clicks]) fn();
  }
}

/**
 * One `<button data-tab>` per name, the first carrying `.on` the way the
 * markup ships it, and every one of them wired the way `bindTabs` wires a real
 * bar — a click moves `.on` to itself, which is what `currentInnerTab` reads.
 */
function makeBar(names: readonly string[]): FakeEl[] {
  const buttons = names.map((name, i) => {
    const button = new FakeEl();
    button.dataset.tab = name;
    if (i === 0) button.classes.add("on");
    return button;
  });
  for (const button of buttons) {
    button.addEventListener("click", () => {
      for (const other of buttons) other.classList.toggle("on", other === button);
    });
  }
  return buttons;
}

/**
 * Installs a `window`/`document` pair over `bars`, keyed by the selector each
 * bar is mounted at, and hands back both the URL as it stands and the undo —
 * `bun test` shares one process across files, so a fake `document` left on
 * `globalThis` is read by every file after this one.
 */
function installDom(
  search: string,
  bars: Record<string, FakeEl[]>,
): { url: () => string; restore: () => void } {
  const had = { document: globalThis.document, window: globalThis.window };
  let href = `/${search}`;
  const pick = (selector: string): FakeEl[] => {
    const at = selector.indexOf(" button");
    const bar = bars[selector.slice(0, at)] ?? [];
    const filter = selector.slice(at + " button".length);
    if (filter === "" || filter === "[data-tab]") return bar;
    if (filter === ".on") return bar.filter((b) => b.classList.contains("on"));
    const want = /\[data-tab="(.+)"\]/.exec(filter)?.[1];
    return bar.filter((b) => b.dataset.tab === want);
  };
  const doc = {
    querySelector: (selector: string) => pick(selector)[0] ?? null,
    querySelectorAll: (selector: string) => pick(selector),
    addEventListener: () => {},
  };
  const win = {
    location: {
      get search() {
        return href.slice(href.indexOf("?"));
      },
      pathname: "/",
      hash: "",
    },
    history: {
      replaceState: (_s: unknown, _t: string, url: string) => {
        href = url;
      },
    },
  };
  const global = globalThis as { document?: unknown; window?: unknown };
  global.document = doc;
  global.window = win;
  return {
    url: () => href,
    restore: () => {
      global.document = had.document;
      global.window = had.window;
    },
  };
}

describe("mountSheet's restore", () => {
  test("opens the inner tab the URL named, not the bar's default", () => {
    const inner = makeBar(["states", "shapes"]);
    const open = new FakeEl();
    const place = installDom("?tab=wave&sheet=backlog&inner=shapes", {
      "#tabs": [],
      "#backlogTabs": inner,
    });

    try {
      bindPlace("#tabs", 10);
      mountSheet({
        name: "backlog",
        sheet: new FakeEl() as unknown as HTMLElement,
        open: open as unknown as HTMLElement,
        close: new FakeEl() as unknown as HTMLElement,
        innerBar: "#backlogTabs",
      });

      expect(inner[1]?.classList.contains("on")).toBe(true);
      expect(inner[0]?.classList.contains("on")).toBe(false);
      expect(place.url()).toContain("inner=shapes");
    } finally {
      place.restore();
    }
  });
});
