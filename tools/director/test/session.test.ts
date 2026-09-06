import { describe, expect, test } from "bun:test";
import { bindPlace, mountSheet } from "../src/session.js";
import { FakeEl, installDom, makeBar } from "./fake-dom.js";

/**
 * `mountSheet`'s restore path — the piece of `session.ts` that needs a browser,
 * and the piece a pure test could not reach. It is where the bug lived: the
 * wanted inner tab was read *after* `open.click()` had already recorded the
 * bar's own default over it, so `?sheet=…&inner=…` always opened on the first
 * tab and rewrote the URL to say so. The value half of this module is
 * `place.test.ts`.
 */

/** A sheet with a two-button inner bar, mounted with the place seeded from `search`. */
function mount(search: string): { inner: FakeEl[]; url: () => string; restore: () => void } {
  const inner = makeBar(["states", "shapes"]);
  const dom = installDom({ search, bars: { "#tabs": [], "#backlogTabs": inner } });
  bindPlace("#tabs", 10);
  mountSheet({
    name: "backlog",
    sheet: new FakeEl() as unknown as HTMLElement,
    open: new FakeEl() as unknown as HTMLElement,
    close: new FakeEl() as unknown as HTMLElement,
    innerBar: "#backlogTabs",
  });
  return { inner, url: dom.url, restore: dom.restore };
}

describe("mountSheet's restore", () => {
  test("opens the inner tab the URL named, not the bar's default", () => {
    const { inner, url, restore } = mount("?tab=wave&sheet=backlog&inner=shapes");
    try {
      expect(inner[1]?.classList.contains("on")).toBe(true);
      expect(inner[0]?.classList.contains("on")).toBe(false);
      expect(url()).toContain("inner=shapes");
    } finally {
      restore();
    }
  });

  test("leaves the bar on its default when the URL named no inner tab", () => {
    const { inner, url, restore } = mount("?tab=wave&sheet=backlog");
    try {
      expect(inner[0]?.classList.contains("on")).toBe(true);
      // The default is still written back, so the URL names the tab on screen.
      expect(url()).toContain("inner=states");
    } finally {
      restore();
    }
  });

  test("falls back to the default on an inner tab the bar does not have", () => {
    const { inner, restore } = mount("?tab=wave&sheet=backlog&inner=gone");
    try {
      expect(inner[0]?.classList.contains("on")).toBe(true);
    } finally {
      restore();
    }
  });

  test("opens nothing when the URL names a different sheet", () => {
    const { inner, restore } = mount("?tab=wave&sheet=checks&inner=shapes");
    try {
      expect(inner.some((b) => b.classList.contains("on"))).toBe(true);
      expect(inner[0]?.classList.contains("on")).toBe(true);
    } finally {
      restore();
    }
  });
});
