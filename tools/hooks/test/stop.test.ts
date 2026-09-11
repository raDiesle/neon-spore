import { describe, expect, it } from "bun:test";
import { tailOf, testScope } from "../check-on-stop.ts";
import {
  branchForDetached,
  isDetached,
  type LaneState,
  question,
  whyNotAsking,
} from "../lane-finished.ts";

/**
 * The two `Stop` hooks. Both used to be bash, and both were untestable for the
 * same reason: the decision was a chain of `case` and `[ -n ... ]` inside the
 * script, so the only way to exercise it was to end a turn and see what
 * happened. The decision is a function now, and this is where it is asked.
 *
 * `lane-finished` is the one worth being sure of. It blocks the stop and sends
 * the session back to land the lane on the local trunk and put the rest to the
 * owner, so every question that keeps it quiet has to be right: too eager and
 * every turn ends in a landing nobody wanted, too shy and a finished lane sits
 * on a branch unmentioned.
 */

const lane = (over: Partial<LaneState> = {}): LaneState => ({
  disabled: false,
  stopHookActive: false,
  inWorktree: true,
  branch: "claude/some-lane",
  dirty: false,
  ahead: 2,
  head: "abc1234",
  askedFor: "",
  ...over,
});

describe("whether a finished lane asks about itself", () => {
  it("asks when every question is answered", () => {
    expect(whyNotAsking(lane())).toBeNull();
  });

  it("never asks with uncommitted work — mid-task work is unfinished work", () => {
    expect(whyNotAsking(lane({ dirty: true }))).toBe("the worktree has uncommitted work");
  });

  it("never asks from the main checkout", () => {
    expect(whyNotAsking(lane({ inWorktree: false }))).toBe(
      "this is the main checkout, not a lane's worktree",
    );
  });

  it("never asks from main, or from a branch git could not name", () => {
    for (const branch of ["main", ""]) {
      expect(whyNotAsking(lane({ branch }))).toMatch(/not on a lane's own branch/);
    }
  });

  /**
   * A landing deletes the branch it landed and leaves the worktree detached, so
   * every commit a session made after its first landing read as "not on a
   * lane's own branch" and was never mentioned again — silently, which is the
   * failure these hooks exist to stop. A detached tree with commits on it is a
   * lane.
   */
  it("asks about a detached lane, which is what a worktree is after its own landing", () => {
    expect(whyNotAsking(lane({ branch: "HEAD" }))).toBeNull();
    expect(isDetached("HEAD")).toBe(true);
    expect(isDetached("claude/some-lane")).toBe(false);
  });

  /** The ordinary state right after a landing: detached, and carrying nothing. */
  it("says nothing about a detached worktree with no commits on it", () => {
    expect(whyNotAsking(lane({ branch: "HEAD", ahead: 0 }))).toBe(
      "the branch is not ahead of main",
    );
  });

  it("never asks about a branch with nothing on it", () => {
    expect(whyNotAsking(lane({ ahead: 0 }))).toBe("the branch is not ahead of main");
  });

  /**
   * A landing that went red leaves the lane clean and ahead afterwards. Asking
   * per turn would send the session back to the same failure at the end of
   * every one of them with nothing new to say.
   */
  it("asks once per commit, not once per turn", () => {
    expect(whyNotAsking(lane({ head: "abc1234", askedFor: "abc1234" }))).toBe(
      "this commit was already put to the owner",
    );
  });

  it("asks again as soon as the lane has something new on it", () => {
    expect(whyNotAsking(lane({ head: "def5678", askedFor: "abc1234" }))).toBeNull();
  });

  /** A `HEAD` git would not name is not evidence that anything was asked. */
  it("asks when it cannot tell what the lane is standing on", () => {
    expect(whyNotAsking(lane({ head: "", askedFor: "" }))).toBeNull();
  });

  it("never asks underneath a stop that was already blocked", () => {
    expect(whyNotAsking(lane({ stopHookActive: true }))).toBe(
      "a blocked stop is already in progress",
    );
  });

  it("is off entirely for a session that decides for itself", () => {
    expect(whyNotAsking(lane({ disabled: true }))).toBe("NO_LANE_PROMPT=1");
  });

  it("checks the switch before anything git can answer", () => {
    // `NO_LANE_PROMPT=1` means *off*, not "off unless the lane looks finished".
    expect(whyNotAsking(lane({ disabled: true, dirty: true, ahead: 0 }))).toBe("NO_LANE_PROMPT=1");
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

/**
 * The message is the whole hook. Nothing lands here, so if the landing command
 * or the three options after it are wrong the session invents something
 * instead — which is what the change was made to stop.
 */
describe("what the session is sent back to do", () => {
  const asked = question("claude/a-lane", 3);

  it("names the lane and what is on it", () => {
    expect(asked).toContain("claude/a-lane");
    expect(asked).toContain("3 commits");
    expect(question("claude/a-lane", 1)).toContain("1 commit,");
  });

  /** The local trunk is not a question: it is landed first, every time. */
  it("says to land on the local trunk", () => {
    expect(asked).toContain("bun run land --keep");
    expect(asked).toContain("say what landed and stop");
    expect(asked).not.toContain("bun run land --push");
  });

  /**
   * The owner retired the push / sweep question on 11 September 2026: he asks
   * for each himself. The message names them only to say they are his to ask
   * for, never as options.
   */
  it("neither asks about pushing or sweeping nor does them", () => {
    expect(asked).toContain("Do not ask whether to push, sweep or deploy");
    expect(asked).toContain("do not do any of them");
    expect(asked).not.toContain("a) ");
    expect(asked).not.toContain("three options");
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
