import { describe, expect, it } from "bun:test";
import {
  badge,
  branchForDetached,
  isDetached,
  type LaneState,
  whyNotLanding,
} from "../auto-land.ts";
import { tailOf, testScope } from "../check-on-stop.ts";

/**
 * The two `Stop` hooks. Both used to be bash, and both were untestable for the
 * same reason: the decision was a chain of `case` and `[ -n ... ]` inside the
 * script, so the only way to exercise it was to end a turn and see what
 * happened. The decision is a function now, and this is where it is asked.
 *
 * `auto-land` is the one worth being sure of. It moves the trunk without being
 * asked, so every question that stops it has to be right, and the failure it
 * guards against — landing a lane that is not finished — cannot be undone by
 * noticing afterwards.
 */

const lane = (over: Partial<LaneState> = {}): LaneState => ({
  disabled: false,
  stopHookActive: false,
  inWorktree: true,
  branch: "claude/some-lane",
  dirty: false,
  ahead: 2,
  ...over,
});

describe("whether a finished lane lands itself", () => {
  it("lands when every question is answered", () => {
    expect(whyNotLanding(lane())).toBeNull();
  });

  it("never lands with uncommitted work — mid-task work is unfinished work", () => {
    expect(whyNotLanding(lane({ dirty: true }))).toBe("the worktree has uncommitted work");
  });

  it("never lands from the main checkout", () => {
    expect(whyNotLanding(lane({ inWorktree: false }))).toBe(
      "this is the main checkout, not a lane's worktree",
    );
  });

  it("never lands from main, or from a branch git could not name", () => {
    for (const branch of ["main", ""]) {
      expect(whyNotLanding(lane({ branch }))).toMatch(/not on a lane's own branch/);
    }
  });

  /**
   * A landing deletes the branch it landed and leaves the worktree detached, so
   * every commit a session made after its first landing read as "not on a
   * lane's own branch" and never landed at all — silently, which is the failure
   * these hooks exist to stop. A detached tree with commits on it is a lane.
   */
  it("lands a detached lane, which is what a worktree is after its own landing", () => {
    expect(whyNotLanding(lane({ branch: "HEAD" }))).toBeNull();
    expect(isDetached("HEAD")).toBe(true);
    expect(isDetached("claude/some-lane")).toBe(false);
  });

  /** The ordinary state right after a landing: detached, and carrying nothing. */
  it("says nothing about a detached worktree with no commits on it", () => {
    expect(whyNotLanding(lane({ branch: "HEAD", ahead: 0 }))).toBe(
      "the branch is not ahead of main",
    );
  });

  it("never lands a branch with nothing on it", () => {
    expect(whyNotLanding(lane({ ahead: 0 }))).toBe("the branch is not ahead of main");
  });

  it("never lands underneath a stop that was already blocked", () => {
    expect(whyNotLanding(lane({ stopHookActive: true }))).toBe(
      "a blocked stop is already in progress",
    );
  });

  it("is off entirely for a session that lands by hand", () => {
    expect(whyNotLanding(lane({ disabled: true }))).toBe("NO_AUTO_LAND=1");
  });

  it("checks the switch before anything git can answer", () => {
    // `NO_AUTO_LAND=1` means *off*, not "off unless the lane looks landable".
    expect(whyNotLanding(lane({ disabled: true, dirty: true, ahead: 0 }))).toBe("NO_AUTO_LAND=1");
  });
});

describe("the branch a detached lane gets back", () => {
  it("is the worktree's own name, which is the one the landing deleted", () => {
    expect(branchForDetached("C:/repo/.claude/worktrees/wave-editor-9f1", [])).toBe(
      "claude/wave-editor-9f1",
    );
    expect(branchForDetached("/repo/.claude/worktrees/wave-editor-9f1", [])).toBe(
      "claude/wave-editor-9f1",
    );
  });

  it("reads a Windows path, where the separator is the other one", () => {
    const path = ["C:", "repo", ".claude", "worktrees", "wave-editor-9f1"].join("\\");
    expect(branchForDetached(path, [])).toBe("claude/wave-editor-9f1");
  });

  it("steps aside for a name something already holds", () => {
    const taken = ["main", "claude/wave-editor-9f1", "claude/wave-editor-9f1-2"];
    expect(branchForDetached("/repo/worktrees/wave-editor-9f1", taken)).toBe(
      "claude/wave-editor-9f1-3",
    );
  });

  it("has a name for a path that ends in a separator", () => {
    expect(branchForDetached("/repo/worktrees/wave-editor-9f1/", [])).toBe(
      "claude/wave-editor-9f1",
    );
  });
});

describe("the badge", () => {
  it("counts one commit in the singular", () => {
    expect(badge("claude/a-lane", "abc1234", 1)).toBe(
      "🟢 ╺━╸ L A N D E D ! ╺━╸ claude/a-lane → main @ abc1234 (1 commit)",
    );
  });

  it("counts the rest in the plural", () => {
    expect(badge("claude/a-lane", "abc1234", 8)).toContain("(8 commits)");
  });
});

describe("what the stop check runs", () => {
  it("asks the scoper, and a list of directories is what it gets", () => {
    // Called in this tree, so the answer depends on what is dirty — the claim
    // is only that it is a list of test directories and never a throw.
    const scope = testScope();
    expect(Array.isArray(scope)).toBe(true);
    for (const dir of scope) expect(dir).toMatch(/^[\w./-]+$/);
  });

  it("keeps the last lines of a failure, which is the part worth reading", () => {
    const output = Array.from({ length: 100 }, (_, i) => `line ${i}`).join("\n");
    const tail = tailOf(output, 30);
    expect(tail.split("\n")).toHaveLength(30);
    expect(tail.startsWith("line 70")).toBe(true);
    expect(tail.endsWith("line 99")).toBe(true);
  });

  it("keeps a short output whole", () => {
    expect(tailOf("only this", 30)).toBe("only this");
  });
});
