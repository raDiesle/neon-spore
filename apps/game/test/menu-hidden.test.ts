import { describe, expect, it } from "bun:test";

/**
 * **A `hidden` element stays hidden under `menu.css`.**
 *
 * The browser's own `[hidden] { display: none }` is a UA rule, and any
 * author rule that sets `display` on the same element beats it. That has now
 * bitten twice: a `.setting` with nothing to offer drew as an empty frame, and
 * on 14 September 2026 BACK INTO THE GAME drew on every device that had never
 * been in a room — `display: grid`, `hidden` set, and nothing where the code
 * goes. Each time the fix was one `[hidden] { display: none }` rule that the
 * next class to get a `display` will forget again, so this reads the sheet
 * and asks the question of every class the menu toggles with `.hidden`.
 */

const css = await Bun.file(Bun.fileURLToPath(new URL("../src/menu.css", import.meta.url))).text();

/**
 * The classes the menu shows and hides by setting `.hidden` — each one is an
 * `el("…", "<class>")` whose `.hidden` is assigned somewhere in `menu-*.ts`.
 * A new one goes here when it is written.
 */
const TOGGLED = ["rejoin", "setting", "progress", "who", "switch"];

/** Every `selector { … }` block in the sheet, with `display` if it sets one. */
function blocks(): { selector: string; display: string | null }[] {
  const out: { selector: string; display: string | null }[] = [];
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const display = body?.match(/(?:^|;|\s)display:\s*([a-z-]+)/)?.[1] ?? null;
    if (selector) out.push({ selector: selector.trim(), display });
  }
  return out;
}

describe("menu.css and the hidden attribute", () => {
  for (const cls of TOGGLED) {
    it(`keeps .${cls} off the page while it is hidden`, () => {
      const all = blocks();
      // Any rule ending in `.cls` (with no `[hidden]`, no pseudo-class) that
      // sets a display other than none is one the UA rule loses to.
      const shows = all.filter(
        ({ selector, display }) =>
          selector.split(",").some((s) => new RegExp(`\\.${cls}$`).test(s.trim())) &&
          display !== null &&
          display !== "none",
      );
      if (shows.length === 0) return;
      const hides = all.some(
        ({ selector, display }) =>
          selector.split(",").some((s) => s.trim().endsWith(`.${cls}[hidden]`)) &&
          display === "none",
      );
      expect(
        hides,
        `.${cls} sets display: ${shows[0]?.display} and has no .${cls}[hidden] { display: none } rule`,
      ).toBe(true);
    });
  }
});
