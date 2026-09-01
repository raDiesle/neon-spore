import { describe, expect, it } from "bun:test";
import { readActiveCategory } from "../src/brush-category.js";

/**
 * `readActiveCategory`/`writeActiveCategory` are `localStorage` end to end,
 * and this repo's test runner carries no real DOM or storage (see
 * columns.test.ts) — so the one thing checked directly is the fallback: no
 * stored choice, or storage unavailable, reads back as `null` rather than
 * throwing, which is what lets palette.ts fall back to the first category on
 * a first run. The read/write round trip itself, and the tab behaviour it
 * drives, are left to `worktree-preview`/manual verification.
 */
describe("readActiveCategory", () => {
  it("is null with no localStorage on the global (a headless run with no origin)", () => {
    expect(readActiveCategory()).toBeNull();
  });
});

const html = await Bun.file(Bun.fileURLToPath(new URL("../index.html", import.meta.url))).text();

describe("the palette is a category rail beside an option list, in the real markup", () => {
  it("both containers exist, rail before options", () => {
    const rail = html.indexOf('id="brushCategories"');
    const options = html.indexOf('id="brushes"');
    expect(rail).toBeGreaterThan(-1);
    expect(options).toBeGreaterThan(-1);
    expect(rail).toBeLessThan(options);
  });

  it("no leftover reference to the per-category collapse this replaced", () => {
    expect(html).not.toContain("brush-group-label");
  });
});
