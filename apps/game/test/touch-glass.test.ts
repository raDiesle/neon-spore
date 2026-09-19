import { describe, expect, it } from "bun:test";

/**
 * The two lines of glass under the press path, which nothing read.
 *
 * Everything above them was already as good as a native wrapper would make
 * it — `pointerdown` on the canvas, `preventDefault` in a non-passive
 * listener, `setPointerCapture`, no tap highlight, no context menu, the press
 * into the buffer synchronously. What was missing is the pair of declarations
 * the *compositor* reads, before any of that runs, and neither is the sort of
 * thing anybody notices missing at a desk: both defend against a two-thumb
 * gesture on a phone, which is the only way this game is ever played.
 *
 * Read out of the stylesheet rather than off a rendered page, the way
 * `view-switch.test.ts` reads the same file: a rule that is in the source is
 * a rule the browser has, and there is no DOM here to ask.
 */

const css = await Bun.file(Bun.fileURLToPath(new URL("../src/game.css", import.meta.url))).text();

const bare = css.replaceAll(/\/\*[\s\S]*?\*\//g, "");

/**
 * The declarations of the one rule with exactly this selector.
 *
 * A selector is whatever stands between the last brace and the next `{`, which
 * is enough here and stops short of being a parser: a rule inside an `@media`
 * keeps its own selector, and the `@media` line keeps its own. Exactly one
 * match is the assertion — two rules for `canvas` would mean the second has
 * the last word and this file would be reading the wrong one.
 */
function block(selector: string): string {
  const found = [...bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(
    (m) => (m[1] ?? "").replaceAll(/\s+/g, " ").trim() === selector,
  );
  if (found.length !== 1) throw new Error(`${found.length} rules for \`${selector}\`, wanted one`);
  return found[0]?.[2] ?? "";
}

describe("the glass the compositor reads before a press is dispatched", () => {
  it("states touch-action on the canvas itself, not only on the page", () => {
    // It is not inherited. It is read off the element the gesture starts on,
    // and `html, body` saying it leaves the canvas at `auto` — so a pinch
    // starting on the field was the browser's to take, and `preventDefault`
    // runs too late to take it back.
    expect(block("canvas")).toContain("touch-action: none");
  });

  it("keeps it on the page as well, for a gesture that starts off the field", () => {
    expect(block("html, body")).toContain("touch-action: none");
  });

  it("refuses the overscroll gesture on the page", () => {
    // `overflow: hidden` stops the page moving; it does not stop pull-to-
    // refresh or the overscroll glow, which are the browser's own and stand in
    // front of a thumb that reaches the top or the bottom edge — where both of
    // this game's thumbs live.
    expect(block("html, body")).toContain("overscroll-behavior: none");
  });
});
