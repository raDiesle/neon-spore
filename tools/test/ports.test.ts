import { describe, expect, it } from "bun:test";
import { DIRECTOR_BAND, derivePort, PREVIEW_BAND, portFor, treeKey } from "../ports.js";

/**
 * The one property that matters: a worktree's port is its own and it is the
 * same every time. A port that moved between two starts would make the
 * `/__preview` identity check — the whole point of which is knowing who
 * answered — impossible to perform twice.
 */

const TREE = "C:/Users/x/project/.claude/worktrees/feature-a";

describe("a server's port", () => {
  it("is the same for the same tree, every time", () => {
    const once = derivePort(PREVIEW_BAND, TREE);
    expect(derivePort(PREVIEW_BAND, TREE)).toBe(once);
    expect(once).toBeGreaterThanOrEqual(PREVIEW_BAND);
    expect(once).toBeLessThan(PREVIEW_BAND + 100);
  });

  it("does not depend on how the path was spelled", () => {
    expect(treeKey(String.raw`C:\Users\X\Project\.claude\worktrees\feature-a`)).toBe(
      "c:/users/x/project/.claude/worktrees/feature-a",
    );
    // A trailing separator is not a different tree, and neither is the case.
    expect(treeKey("C:/Users/X/Project/")).toBe("c:/users/x/project");
    expect(
      derivePort(PREVIEW_BAND, String.raw`C:\Users\X\Project\.claude\worktrees\feature-a`),
    ).toBe(derivePort(PREVIEW_BAND, TREE));
  });

  it("keeps the two servers in bands that cannot overlap", () => {
    expect(PREVIEW_BAND + 100).toBeLessThanOrEqual(DIRECTOR_BAND);
    for (const tree of ["a", "b", "c", TREE]) {
      expect(derivePort(PREVIEW_BAND, tree)).not.toBe(derivePort(DIRECTOR_BAND, tree));
    }
  });

  it("gives different worktrees different ports far more often than not", () => {
    // Not a guarantee — a hundred ports and a hash collide sometimes, which is
    // why a server also refuses to retire a copy rooted in another tree.
    const seen = new Set<number>();
    for (let i = 0; i < 40; i++) seen.add(derivePort(PREVIEW_BAND, `${TREE}-${i}`));
    expect(seen.size).toBeGreaterThan(30);
  });

  it("falls back to the base port where there is no worktree to be in", () => {
    // A path with no `.git` at all is the only checkout there is, so the
    // number everything else is written against stays free for it.
    expect(portFor(4173, PREVIEW_BAND, "/nowhere/at/all")).toBe(4173);
  });
});
