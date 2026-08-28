import { describe, expect, it } from "bun:test";

/**
 * The DEMOS sheet has to close three ways — a click outside it, Escape, and
 * its own CLOSE button — because a modal a person cannot dismiss is worse
 * than one that never opened at all: the page behind it is still the page
 * they were working in. `bindDemoPanel` is `document.getElementById` end to
 * end, so there is nothing here for `bun test` to drive the way
 * `balance.test.ts` drives `sheetLines` — this repo has no DOM in its test
 * runner (no jsdom, no happy-dom). What is left to prove is that the wiring
 * for all three routes is actually in the source, the same shape
 * `sheet.test.ts` already uses for the backlog: a route a later edit deletes
 * by accident fails this test instead of waiting for someone to notice a
 * sheet with no way out.
 *
 * `#demosBody` carries its own `max-width: 700px` while `#demos` behind it
 * fills the screen, so on any desktop wider than that there is a real
 * backdrop — a click that lands there hits `#demos` itself before it hits
 * anything the sheet drew, which is what `e.target === sheet` catches.
 */

const source = await Bun.file(
  Bun.fileURLToPath(new URL("../src/demo-panel.ts", import.meta.url)),
).text();

describe("the demos sheet", () => {
  it("closes on a click that lands on the backdrop, not a descendant", () => {
    expect(source).toMatch(
      /sheet\.addEventListener\("click", \(e\) => \{\s*if \(e\.target === sheet\) show\(false\);/,
    );
  });

  it("closes on Escape", () => {
    expect(source).toMatch(/e\.key === "Escape"[\s\S]{0,40}show\(false\)/);
  });

  it("closes on its own CLOSE button", () => {
    expect(source).toMatch(/close\.addEventListener\("click", \(\) => show\(false\)\)/);
  });
});
