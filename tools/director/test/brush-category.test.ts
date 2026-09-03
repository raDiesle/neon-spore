import { describe, expect, it } from "bun:test";
import { readClosedCategories } from "../src/brush-category.js";

/**
 * `readClosedCategories`/`writeClosedCategories` are `localStorage` end to end,
 * and this repo's test runner carries no real DOM or storage (see
 * columns.test.ts) — so the one thing checked directly is the fallback: no
 * stored choice, or storage unavailable, reads back as the empty set rather
 * than throwing, which is what makes "every category expanded" the default on
 * a first run. The fold behaviour itself is left to
 * `worktree-preview`/manual verification.
 */
describe("readClosedCategories", () => {
  it("is empty with no localStorage on the global (a headless run with no origin)", () => {
    expect(Array.from(readClosedCategories())).toEqual([]);
  });
});

const html = await Bun.file(Bun.fileURLToPath(new URL("../index.html", import.meta.url))).text();

describe("the palette is one accordion column, in the real markup", () => {
  it("the option list is there, and the rail it replaced is not", () => {
    expect(html).toContain('id="brushes"');
    expect(html).not.toContain("brushCategories");
    expect(html).not.toContain('class="brush-panel"');
  });

  it("no leftover reference to the per-category collapse an even earlier one had", () => {
    expect(html).not.toContain("brush-group-label");
  });

  it("ERASE is static markup in the palette, named rather than a bare glyph", () => {
    const erase = html.indexOf('id="brushErase"');
    expect(erase).toBeGreaterThan(-1);
    expect(html.slice(erase, erase + 200)).toContain("ERASE");
  });

  it("the selected cell's panel sits above the grid in the map column", () => {
    expect(html.indexOf('id="cellPanel"')).toBeLessThan(html.indexOf('id="grid"'));
  });
});
