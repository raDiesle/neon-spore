import { describe, expect, test } from "bun:test";
import {
  type Branch,
  branchReady,
  branchReason,
  joinChecks,
  outstanding,
  runnable,
  staleStops,
  undecidedOn,
} from "../checks.js";
import type { Decision } from "../ledger.js";
import type { CheckCommit } from "../trailers.js";

const COMMITS: CheckCommit[] = [
  {
    full: "f".repeat(40),
    sha: "1111111",
    date: "2026-08-27",
    subject: "The Warden gets a body",
    checks: [
      { sha: "1111111", text: "the hole reads at 26 px", command: null },
      { sha: "1111111", text: "the shapes — `bun run shapes`", command: "bun run shapes" },
    ],
  },
  {
    full: "e".repeat(40),
    sha: "2222222",
    date: "2026-08-26",
    subject: "A wave",
    checks: [{ sha: "2222222", text: "the timing at 96 BPM", command: null }],
  },
];

const DECIDED: Decision[] = [
  {
    sha: "1111111",
    date: "2026-08-28",
    verdict: "PASS",
    text: "the hole reads at 26 px",
    note: "",
  },
];

describe("joinChecks", () => {
  test("a decision attaches to the check it was made about", () => {
    const states = joinChecks(COMMITS, DECIDED);
    expect(states).toHaveLength(3);
    expect(states[0]?.verdict).toBe("PASS");
    expect(states[0]?.decidedOn).toBe("2026-08-28");
    expect(states[1]?.verdict).toBeNull();
  });

  test("the last word wins when a check was decided twice", () => {
    const twice: Decision[] = [
      ...DECIDED,
      { sha: "1111111", date: "2026-08-29", verdict: "FAIL", text: DECIDED[0]!.text, note: "no" },
    ];
    expect(joinChecks(COMMITS, twice)[0]?.verdict).toBe("FAIL");
  });

  test("a decision about a different commit does not attach", () => {
    const elsewhere: Decision[] = [{ ...DECIDED[0]!, sha: "9999999" }];
    expect(joinChecks(COMMITS, elsewhere)[0]?.verdict).toBeNull();
  });

  test("an amended check text is a new check, not a decided one", () => {
    const stale: Decision[] = [{ ...DECIDED[0]!, text: "the hole reads at 24 px" }];
    expect(joinChecks(COMMITS, stale)[0]?.verdict).toBeNull();
  });
});

describe("outstanding", () => {
  test("a failure is decided, not outstanding — it wants a commit, not a look", () => {
    const failed: Decision[] = [{ ...DECIDED[0]!, verdict: "FAIL", note: "it clips" }];
    const left = outstanding(joinChecks(COMMITS, failed));
    expect(left.map((s) => s.text)).toEqual([
      "the shapes — `bun run shapes`",
      "the timing at 96 BPM",
    ]);
  });

  test("only the outstanding ones are offered to be run", () => {
    expect(runnable(joinChecks(COMMITS, DECIDED)).map((s) => s.command)).toEqual([
      "bun run shapes",
    ]);
  });
});

describe("branches", () => {
  const base: Branch = {
    name: "claude/thing",
    local: true,
    remote: true,
    merged: true,
    worktree: "",
    current: false,
    undecided: 0,
  };

  test("counts only the checks the branch can reach", () => {
    const states = joinChecks(COMMITS, DECIDED);
    expect(undecidedOn(new Set([COMMITS[0]!.full]), states)).toBe(1);
    expect(undecidedOn(new Set([COMMITS[0]!.full, COMMITS[1]!.full]), states)).toBe(2);
    expect(undecidedOn(new Set(), states)).toBe(0);
  });

  test("ready means merged, decided, and not underfoot", () => {
    expect(branchReady(base)).toBe(true);
    expect(branchReady({ ...base, merged: false })).toBe(false);
    expect(branchReady({ ...base, undecided: 1 })).toBe(false);
    expect(branchReady({ ...base, current: true })).toBe(false);
  });

  test("a worktree is not a reason to keep a branch", () => {
    expect(branchReady({ ...base, worktree: "/tmp/wt" })).toBe(true);
    expect(branchReason({ ...base, worktree: "/tmp/wt" })).toContain("worktree");
  });

  test("says why, in one phrase", () => {
    expect(branchReason({ ...base, merged: false })).toBe("still ahead of main");
    expect(branchReason({ ...base, undecided: 1 })).toBe("1 check outstanding");
    expect(branchReason({ ...base, undecided: 3 })).toBe("3 checks outstanding");
    expect(branchReason({ ...base, current: true })).toBe("you are standing on it");
  });
});

describe("staleStops", () => {
  test("a stale main stops the flags that act", () => {
    expect(staleStops(25, true)).toBe(true);
  });

  test("a stale main only warns the plain report, which says so itself", () => {
    expect(staleStops(25, false)).toBe(false);
  });

  test("a pulled main stops nothing", () => {
    expect(staleStops(0, true)).toBe(false);
    expect(staleStops(0, false)).toBe(false);
  });
});
