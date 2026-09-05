import { expect, describe as group, test } from "bun:test";
import { type Cleanup, type LandState, plan, pushNow, SWEPT_NOTHING } from "../land.js";
import { badge, describe } from "../say.js";
import { uncommittedOf } from "../state.js";

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
    trunkStale: 0,
    noPush: false,
    forcePush: false,
    keep: false,
    sweepOnly: false,
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

  test("refuses while the trunk is behind origin", () => {
    // The expensive one, and the reason it is a refusal rather than a warning:
    // a lane replayed onto a stale trunk is checked against a history that is
    // about to be thrown away, and the reconciliation then happens on the trunk
    // with the check already spent and no branch left to fix a conflict on.
    const decided = plan(state({ trunkStale: 11, ahead: 3 }));
    expect(decided.go).toBe(false);
    if (!decided.go) expect(decided.why).toContain("11 commits");
  });

  test("says commit in the singular when the trunk is one behind", () => {
    const decided = plan(state({ trunkStale: 1 }));
    expect(decided.go).toBe(false);
    if (!decided.go) expect(decided.why).toContain("1 commit main has not");
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
  test("may push when origin exists and --no-push was not given", () => {
    const decided = plan(state({ hasOrigin: true, noPush: false }));
    expect(decided.go && decided.mayPush).toBe(true);
  });

  test("does not push without an origin, even without --no-push", () => {
    const decided = plan(state({ hasOrigin: false, noPush: false }));
    expect(decided.go && decided.mayPush).toBe(false);
  });

  test("does not push with --no-push, even with an origin", () => {
    const decided = plan(state({ hasOrigin: true, noPush: true }));
    expect(decided.go && decided.mayPush).toBe(false);
  });

  test("does not push with neither an origin nor permission", () => {
    const decided = plan(state({ hasOrigin: false, noPush: true }));
    expect(decided.go && decided.mayPush).toBe(false);
  });
});

group("pushNow", () => {
  const landing = (over: Partial<LandState> = {}) => {
    const decided = plan(state(over));
    if (!decided.go) throw new Error("expected a landing");
    return decided;
  };
  const cleared: Cleanup = { trees: 1, branches: 0 };

  test("holds the trunk back when the sweep cleared nothing away", () => {
    expect(pushNow(landing(), SWEPT_NOTHING)).toBe(false);
  });

  test("sends it when the sweep removed a worktree", () => {
    expect(pushNow(landing(), cleared)).toBe(true);
  });

  test("sends it when the sweep deleted some other lane's branch", () => {
    expect(pushNow(landing(), { trees: 0, branches: 1 })).toBe(true);
  });

  test("sends it when --push said so, swept or not", () => {
    expect(pushNow(landing({ forcePush: true }), SWEPT_NOTHING)).toBe(true);
  });

  // A clone that only checks out lanes has no worktrees to sweep, so waiting
  // for one would mean never pushing at all — and there the push is the whole
  // hand-off.
  test("sends it when nothing holds the trunk, however quiet the sweep", () => {
    expect(pushNow(landing({ trunkTree: "" }), SWEPT_NOTHING)).toBe(true);
  });

  test("--no-push outranks every one of those", () => {
    expect(pushNow(landing({ noPush: true, forcePush: true, trunkTree: "" }), cleared)).toBe(false);
  });

  test("no origin outranks them too", () => {
    expect(pushNow(landing({ hasOrigin: false, forcePush: true }), cleared)).toBe(false);
  });

  // --keep skips the sweep, so there is nothing for the push to ride on. It is
  // the landing of a lane that is not finished, and the remote is for finished
  // ones.
  test("a --keep landing sweeps nothing and therefore sends nothing", () => {
    const kept = landing({ keep: true });
    expect(kept.sweeps).toBe(false);
    expect(pushNow(kept, SWEPT_NOTHING)).toBe(false);
  });

  test("--keep and --push together still push, because --push is the owner", () => {
    expect(pushNow(landing({ keep: true, forcePush: true }), SWEPT_NOTHING)).toBe(true);
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

  test("says the push is conditional unless something makes it certain", () => {
    const s = state();
    const decided = plan(s);
    if (!decided.go) throw new Error("expected a landing");
    expect(describe(s, decided).join("\n")).toContain("only if the sweep");

    const forced = state({ forcePush: true });
    const sure = plan(forced);
    if (!sure.go) throw new Error("expected a landing");
    expect(describe(forced, sure).join("\n")).not.toContain("only if the sweep");
  });

  test("says a sweep-only run is the cleanup and not a landing", () => {
    const done = state({ ahead: 0, sweepOnly: true });
    const decided = plan(done);
    if (!decided.go) throw new Error("expected a cleanup");
    const said = describe(done, decided).join("\n");
    expect(said).toContain("already landed");
    expect(said).not.toContain("bun run check");
    expect(said).toContain("sweep    claude/lane-1");
  });

  test("says when the sweep is not going to run", () => {
    const kept = state({ keep: true });
    const decided = plan(kept);
    if (!decided.go) throw new Error("expected a landing");
    expect(describe(kept, decided).join("\n")).toContain("stay standing");
  });
});

group("the cleanup a --keep landing deferred", () => {
  // `--keep` is the landing that is not the end of anything: the trunk takes
  // the work and the branch, the worktree and every other spent lane stay
  // standing. Every landing after that refuses the lane — it carries nothing
  // the trunk has not got — so until `--sweep` there was no command at all for
  // finishing it, and the only way out was a `git worktree remove` by hand.
  test("sweeps a lane whose work is already on the trunk", () => {
    const decided = plan(state({ ahead: 0, sweepOnly: true }));
    expect(decided.go).toBe(true);
    if (!decided.go) return;
    expect(decided.sweepOnly).toBe(true);
    expect(decided.sweeps).toBe(true);
    expect(decided.rebase).toBe(false);
  });

  test("still refuses a landed lane when the cleanup was not asked for", () => {
    const decided = plan(state({ ahead: 0 }));
    expect(decided.go).toBe(false);
    if (decided.go) return;
    // And says which command does clear it, because "carries nothing" on its
    // own sent people looking for work they had already landed.
    expect(decided.why).toContain("--sweep");
  });

  test("refuses --sweep and --keep together, which ask for opposite things", () => {
    const decided = plan(state({ ahead: 0, sweepOnly: true, keep: true }));
    expect(decided.go).toBe(false);
  });

  test("is ignored on a lane that still has something to land", () => {
    // Sweeping is what an ordinary landing already does, so the flag is not a
    // second way to ask for the default — it would only be a way to disagree.
    const decided = plan(state({ ahead: 2, sweepOnly: true }));
    expect(decided.go && decided.sweepOnly).toBe(false);
    expect(decided.go && decided.sweeps).toBe(true);
  });

  test("pushes when the cleanup actually cleared a lane away", () => {
    const decided = plan(state({ ahead: 0, sweepOnly: true }));
    if (!decided.go) throw new Error("expected a cleanup");
    expect(pushNow(decided, SWEPT_NOTHING)).toBe(false);
    expect(pushNow(decided, { trees: 1, branches: 0 })).toBe(true);
  });
});

group("the badge", () => {
  test("reads at a glance, with one commit counted as one", () => {
    expect(badge("claude/a-lane", "main", "abc1234", 1)).toBe(
      "🟢 ╺━╸ L A N D E D ! ╺━╸ claude/a-lane → main @ abc1234 (1 commit)",
    );
  });

  test("counts more than one as commits", () => {
    expect(badge("claude/a-lane", "main", "abc1234", 8)).toContain("(8 commits)");
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
