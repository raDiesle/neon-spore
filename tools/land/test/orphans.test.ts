import { describe, expect, test } from "bun:test";
import { orphanPaths } from "../orphans.js";

describe("orphanPaths", () => {
  test("what is on disk and not in git's list", () => {
    expect(orphanPaths(["/a", "/b", "/c"], ["/b"])).toEqual(["/a", "/c"]);
  });

  test("nothing on disk is nothing orphaned", () => {
    expect(orphanPaths([], ["/b"])).toEqual([]);
  });

  test("a fully registered set orphans none of it", () => {
    expect(orphanPaths(["/a", "/b"], ["/a", "/b", "/main"])).toEqual([]);
  });
});

describe("orphanPaths folds case and separators", () => {
  test("one directory spelled two ways is not an orphan", () => {
    expect(
      orphanPaths(
        ["C:\\Users\\dev\\repo\\.claude\\worktrees\\lane"],
        ["c:/users/dev/repo/.claude/worktrees/lane"],
      ),
    ).toEqual([]);
  });

  test("a trailing separator in git's listing is not a difference either", () => {
    expect(orphanPaths(["/repo/lane"], ["/repo/lane/"])).toEqual([]);
  });

  test("the caller's own spelling is what comes back", () => {
    expect(orphanPaths(["C:\\A\\Lane"], [])).toEqual(["C:\\A\\Lane"]);
  });
});
