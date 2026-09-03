import { expect, describe as group, test } from "bun:test";
import { describe, type LandState, plan, uncommittedOf } from "../land.js";

function state(over: Partial<LandState> = {}): LandState {
  return {
    branch: "claude/lane-1",
    trunk: "main",
    dirty: [],
    ahead: 2,
    behind: 0,
    trunkTree: "/repo",
    trunkDirty: [],
    trunkStaged: [],
    hasOrigin: true,
    noPush: false,
    ...over,
  };
}

group("plan", () => {
  test("lands a clean lane that is ahead", () => {
    const decided = plan(state());
    expect(decided.go).toBe(true);
    if (decided.go) {
      expect(decided.rebase).toBe(false);
      expect(decided.moveRef).toBe(false);
    }
  });

  test("replays a lane the trunk has moved under", () => {
    const decided = plan(state({ behind: 3 }));
    expect(decided.go && decided.rebase).toBe(true);
  });

  test("moves the ref when no worktree holds the trunk", () => {
    const decided = plan(state({ trunkTree: "" }));
    expect(decided.go && decided.moveRef).toBe(true);
  });

  test("refuses to land the trunk on itself", () => {
    const decided = plan(state({ branch: "main" }));
    expect(decided.go).toBe(false);
    if (!decided.go) expect(decided.why).toContain("standing on main");
  });

  test("refuses a detached head", () => {
    expect(plan(state({ branch: "HEAD" })).go).toBe(false);
  });

  // Uncommitted work is usually *why* a lane has nothing to land, so it is
  // named first; hearing "nothing to land" sends you looking somewhere else.
  test("names the uncommitted files before it counts commits", () => {
    const decided = plan(state({ ahead: 0, dirty: ["packages/sim/src/beat.ts"] }));
    expect(decided.go).toBe(false);
    if (!decided.go) expect(decided.why).toContain("beat.ts");
  });

  test("lists at most three of them", () => {
    const decided = plan(state({ dirty: ["a", "b", "c", "d", "e"] }));
    expect(decided.go).toBe(false);
    if (!decided.go) expect(decided.why).toContain("and 2 more");
  });

  test("refuses a lane with nothing on it", () => {
    const decided = plan(state({ ahead: 0 }));
    expect(decided.go).toBe(false);
    if (!decided.go) expect(decided.why).toContain("nothing");
  });

  // Not a refusal: git declines the fast-forward itself, and only when the
  // dirt is actually in the way. Saying so first turns a cryptic refusal
  // into an expected one.
  test("warns about a dirty trunk tree rather than refusing", () => {
    const decided = plan(state({ trunkDirty: ["docs/INDEX.md"] }));
    expect(decided.go).toBe(true);
    if (decided.go) expect(decided.warn.join(" ")).toContain("uncommitted");
  });

  test("refuses when the trunk has the release note itself staged", () => {
    const decided = plan(state({ trunkStaged: ["docs/release-notes.md"] }));
    expect(decided.go).toBe(false);
    if (!decided.go) expect(decided.why).toContain("release-notes.md");
  });

  test("warns rather than refuses about other staged files on the trunk", () => {
    const decided = plan(state({ trunkStaged: ["packages/sim/src/beat.ts"] }));
    expect(decided.go).toBe(true);
    if (decided.go) expect(decided.warn.join(" ")).toContain("staged");
  });

  // The four combinations of "is there an origin" and "was --no-push given".
  test("pushes when origin exists and --no-push was not given", () => {
    const decided = plan(state({ hasOrigin: true, noPush: false }));
    expect(decided.go && decided.push).toBe(true);
  });

  test("does not push without an origin, even without --no-push", () => {
    const decided = plan(state({ hasOrigin: false, noPush: false }));
    expect(decided.go && decided.push).toBe(false);
  });

  test("does not push with --no-push, even with an origin", () => {
    const decided = plan(state({ hasOrigin: true, noPush: true }));
    expect(decided.go && decided.push).toBe(false);
  });

  test("does not push with neither an origin nor permission", () => {
    const decided = plan(state({ hasOrigin: false, noPush: true }));
    expect(decided.go && decided.push).toBe(false);
  });
});

group("describe", () => {
  test("names the steps in the order they happen", () => {
    const s = state({ behind: 1 });
    const decided = plan(s);
    if (!decided.go) throw new Error("expected a landing");
    const lines = describe(s, decided).join("\n");
    expect(lines.indexOf("rebase")).toBeLessThan(lines.indexOf("check"));
    expect(lines.indexOf("check")).toBeLessThan(lines.indexOf("fast-forward"));
  });

  test("names a push when it will happen, not when it will not", () => {
    const s = state({ hasOrigin: true, noPush: false });
    const decided = plan(s);
    if (!decided.go) throw new Error("expected a landing");
    expect(describe(s, decided).join("\n")).toContain("push");

    const noOrigin = state({ hasOrigin: false });
    const skip = plan(noOrigin);
    if (!skip.go) throw new Error("expected a landing");
    expect(describe(noOrigin, skip).join("\n")).not.toContain("push");
  });
});

group("uncommittedOf", () => {
  test("reads content differences and untracked files as uncommitted", () => {
    expect(uncommittedOf("packages/sim/src/beat.ts", "docs/new-note.md")).toEqual([
      "docs/new-note.md",
      "packages/sim/src/beat.ts",
    ]);
  });

  test("says nothing for a file git calls modified whose content matches HEAD", () => {
    // The stat-cache shape: something rewrote `.claude/launch.json` with
    // identical bytes, so `git status --porcelain` prints " M" for it and
    // `git diff --name-only HEAD` prints nothing at all. A landing that
    // believed `status` stopped on a file the lane never touched.
    expect(uncommittedOf("", "")).toEqual([]);
  });

  test("names a path once when it is both staged and changed again", () => {
    const twice = ["apps/game/src/loop.ts", "apps/game/src/loop.ts"].join("\n");
    expect(uncommittedOf(twice, "")).toEqual(["apps/game/src/loop.ts"]);
  });
});
