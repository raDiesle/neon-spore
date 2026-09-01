import { describe, expect, it } from "bun:test";
import { storageKey } from "../src/subcols.js";

/**
 * `subcols.ts` reuses `decideOpen`/`forcedClosedFromUrl` from columns.ts
 * wholesale (columns.test.ts already covers that priority logic) — the only
 * thing this file owns is its own storage namespace, so that is the only
 * thing worth testing again here. The DOM wiring (`initSubcols`) is left to
 * `worktree-preview`/manual verification, the same as `columns.ts`'s.
 */
describe("subcols storageKey", () => {
  it("is namespaced separately from columns.ts, even for a matching id", () => {
    expect(storageKey("map")).toBe("director-subcol:map");
    expect(storageKey("map")).not.toBe("director-column:map");
  });

  it("two subcol ids never collide", () => {
    expect(storageKey("brush-panel")).not.toBe(storageKey("map-panel"));
  });
});

const html = await Bun.file(Bun.fileURLToPath(new URL("../index.html", import.meta.url))).text();

describe("BRUSH and MAP each carry their own [data-subcol], in the real markup", () => {
  it("both live inside the one map column, in that order", () => {
    const brush = html.indexOf('data-subcol="brush-panel"');
    const map = html.indexOf('data-subcol="map-panel"');
    expect(brush).toBeGreaterThan(-1);
    expect(map).toBeGreaterThan(-1);
    expect(brush).toBeLessThan(map);
  });

  it("each carries the toggle button subcols.ts wires up", () => {
    for (const id of ["brush-panel", "map-panel"]) {
      const re = new RegExp(`data-subcol="${id}"[\\s\\S]*?data-subcol-toggle[\\s\\S]*?</button>`);
      expect(html).toMatch(re);
    }
  });

  it("initSubcols is wired into main.ts", async () => {
    const src = await Bun.file(
      Bun.fileURLToPath(new URL("../src/main.ts", import.meta.url)),
    ).text();
    expect(src).toMatch(/import \{ initSubcols \} from "\.\/subcols\.js";/);
    expect(src).toMatch(/^initSubcols\(\);/m);
  });
});
