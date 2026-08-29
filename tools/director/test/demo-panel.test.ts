import { describe, expect, it } from "bun:test";

/**
 * DEMOS is a tab of GAME MECHANICS now, not a sheet of its own — see
 * `docs/queue.md`'s `claude/burn-topbar-fold` entry. It used to carry its own
 * Escape/backdrop/CLOSE wiring, checked here the same way `sheet.test.ts`
 * checks the backlog's: `bindDemoPanel` is `document.getElementById` end to
 * end, and this repo's test runner carries no real DOM (no jsdom, no
 * happy-dom), so there is nothing for `bun test` to drive directly. What is
 * left to prove is that the wiring the fold depends on is actually in the
 * source: the tab's own click lazily builds the list, and picking a demo
 * closes the sheet that now owns it rather than a sheet of its own.
 */

const source = await Bun.file(
  Bun.fileURLToPath(new URL("../src/demo-panel.ts", import.meta.url)),
).text();

describe("the DEMOS tab", () => {
  it("builds its list lazily, on the tab's own click", () => {
    expect(source).toMatch(/tab\?\.addEventListener\("click", render\)/);
  });

  it("closes GAME MECHANICS, not a sheet of its own, once a demo is picked", () => {
    expect(source).toMatch(/onOpen\(\);\s*closeMechanics\(\);/);
  });

  it("takes closeMechanics as its own argument rather than wiring a CLOSE button", () => {
    expect(source).not.toContain("demosClose");
    expect(source).not.toContain('getElementById("demos")');
    expect(source).toMatch(/closeMechanics: \(\) => void/);
  });
});
