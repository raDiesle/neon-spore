import { expect, describe as group, test } from "bun:test";
import { describe, type LandState, plan } from "../land.js";

function state(over: Partial<LandState> = {}): LandState {
  return {
    branch: "claude/lane-1",
    trunk: "main",
    dirty: [],
    ahead: 2,
    behind: 0,
    trunkTree: "/repo",
    trunkDirty: [],
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
    const decided = plan(state({ trunkDirty: ["docs/parked.md"] }));
    expect(decided.go).toBe(true);
    if (decided.go) expect(decided.warn.join(" ")).toContain("uncommitted");
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
});
