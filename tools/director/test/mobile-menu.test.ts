import { describe, expect, it } from "bun:test";
import { initMobileMenu } from "../src/mobile-menu.js";
import { FakeEl, installDom } from "./fake-dom.js";

function el(tagName: string): FakeEl {
  const e = new FakeEl();
  e.tagName = tagName;
  return e;
}

/**
 * **RUN GOES HOME WHEN THE WINDOW WIDENS.**
 *
 * A page loaded at a phone's width opens on the menu with RUN standing in it
 * (`mobile-menu.ts`). Widening the window changes no class, so the observer on
 * `body` never heard it, and RUN stayed in a header that was a bar again,
 * painted over by `main`: at 1500 wide the element under AUTO's BOTH was the
 * map panel's `.cell-actions` (27 September 2026). The browser pane an agent
 * verifies in fires no `resize` and no media `change` when its viewport is
 * set, so this is where that is proven.
 */
describe("RUN across the phone breakpoint", () => {
  it("leaves the header when the window widens, and comes back when it narrows", () => {
    const main = el("MAIN");
    const header = el("HEADER");
    const home = el("SECTION");
    const transport = el("DIV");
    home.append(transport);
    const dom = installDom({
      phone: true,
      bars: {
        main: [main],
        header: [header],
        ".transport": [transport],
        'section[data-column="run"]': [home],
      },
      ids: { menuToggle: el("BUTTON") },
    });
    // A width the test can change, and the listeners that hear it change.
    let narrow = true;
    const heard: Array<() => void> = [];
    (globalThis as { matchMedia?: unknown }).matchMedia = (query: string) => ({
      get matches() {
        return narrow && query.includes("700px");
      },
      addEventListener: (_type: string, fn: () => void) => heard.push(fn),
    });
    const resize = (toNarrow: boolean) => {
      narrow = toNarrow;
      for (const fn of heard) fn();
    };
    try {
      initMobileMenu("");
      expect(dom.body.classList.contains("menu-open")).toBe(true);
      expect(transport.parentElement).toBe(header);

      resize(false);
      expect(transport.parentElement, "a desk lost its RUN column").toBe(home);
      expect(header.children).not.toContain(transport);

      resize(true);
      expect(transport.parentElement, "the open menu lost RUN").toBe(header);
    } finally {
      dom.restore();
    }
  });
});
