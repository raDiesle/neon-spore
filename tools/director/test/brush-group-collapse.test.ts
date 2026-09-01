import { describe, expect, it } from "bun:test";
import { storageKey } from "../src/brush-group-collapse.js";

/**
 * `isCollapsed`/`setCollapsed` are `localStorage` end to end, and this repo's
 * test runner carries no real DOM or storage (see columns.test.ts) — so only
 * the pure part, the storage namespace, is checked directly. The behaviour
 * itself (a category's buttons vanishing, surviving palette.ts's own
 * re-render) is left to `worktree-preview`/manual verification.
 */
describe("brush-group-collapse storageKey", () => {
  it("is namespaced separately from columns.ts and subcols.ts", () => {
    expect(storageKey("CANNON")).toBe("director-brush-group:CANNON");
    expect(storageKey("CANNON")).not.toBe("director-column:CANNON");
    expect(storageKey("CANNON")).not.toBe("director-subcol:CANNON");
  });

  it("two group labels never collide", () => {
    expect(storageKey("CANNON")).not.toBe(storageKey("SHIELD"));
  });
});
