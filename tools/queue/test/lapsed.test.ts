import { describe, expect, it } from "bun:test";
import { branchFor } from "../claim.js";
import { daysBetween, lapsed, lapsedLine, takenDate } from "../lapsed.js";
import { takenMark } from "../mark.js";
import { parseItems } from "../queue.js";
import { statusLines, statusOf } from "../status.js";

/**
 * A claim with nothing left holding it up.
 *
 * `claimOn` falls back to the entry's own `Taken:` line when no ref matches,
 * which is right for a clone that has never seen the branch and wrong forever
 * once the branch is gone. Three entries were in that state on 21 September
 * 2026 — marked from `main`, claim branches long deleted — and the listing
 * called all three BUSY with nothing distinguishing them from work in flight.
 *
 * What is tested here is that they are *named* and still taken. Releasing one
 * on a missing ref is the thing this must never do: that is exactly what a
 * live cloud claim looks like from a local checkout.
 */

const ENTRY = `## Split the wave editor's cell panel

- **Found:** 2026-09-03, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.
`;

const TITLE = "Split the wave editor's cell panel";
const BRANCH = "claude/queue-split-the-wave-editors-cell-panel";

/** One item, with whatever `Taken:` line the case is about. */
function item(taken?: string) {
  const md = taken ? ENTRY.replace("- **Files:**", `- **Taken:** ${taken}\n- **Files:**`) : ENTRY;
  const one = parseItems(md, "queue")[0];
  if (!one) throw new Error("the fixture did not parse");
  return one;
}

describe("takenDate", () => {
  it("is the day in front of the branch", () => {
    expect(takenDate(takenMark(BRANCH, "2026-09-04"))).toBe("2026-09-04");
    expect(takenDate(takenMark(BRANCH, "2026-09-04", "main"))).toBe("2026-09-04");
  });

  it("is empty for a mark nobody can read a date out of", () => {
    expect(takenDate("somebody, sometime")).toBe("");
  });
});

describe("daysBetween", () => {
  it("counts whole days, across a month's end", () => {
    expect(daysBetween("2026-09-20", "2026-09-21")).toBe(1);
    expect(daysBetween("2026-08-30", "2026-09-02")).toBe(3);
    expect(daysBetween("2026-09-21", "2026-09-21")).toBe(0);
  });

  it("is null rather than a number when either day is unreadable", () => {
    expect(daysBetween("", "2026-09-21")).toBeNull();
    expect(daysBetween("2026-09-21", "yesterday")).toBeNull();
  });
});

describe("lapsed", () => {
  it("says nothing about an item nobody has taken", () => {
    expect(lapsed(item(), [], "2026-09-30")).toBeUndefined();
  });

  it("says nothing while the branch is still there, however old the mark", () => {
    expect(lapsed(item(takenMark(BRANCH, "2026-01-01")), [BRANCH], "2026-09-30")).toBeUndefined();
  });

  it("counts origin's copy of the branch as the branch", () => {
    expect(
      lapsed(item(takenMark(BRANCH, "2026-01-01")), [`origin/${BRANCH}`], "2026-09-30"),
    ).toBeUndefined();
  });

  /** The grace is what keeps a cloud session's own day out of this: its
   * branch reaches `origin` when it pushes, which is the end of the turn. */
  it("leaves a claim made today alone even with no ref anywhere", () => {
    expect(lapsed(item(takenMark(BRANCH, "2026-09-20")), [], "2026-09-20")).toBeUndefined();
  });

  it("names it the next day, and says how old it is", () => {
    expect(lapsed(item(takenMark(BRANCH, "2026-09-20")), [], "2026-09-21")).toEqual({
      since: "2026-09-20",
      days: 1,
    });
    expect(lapsed(item(takenMark(BRANCH, "2026-09-20")), [], "2026-09-25")).toEqual({
      since: "2026-09-20",
      days: 5,
    });
  });

  /**
   * The state the three stuck entries were in: `queue take` from the main
   * checkout writes `main` as the worked branch, and `main` never goes away.
   * Asking the name alone would call the claim live forever.
   */
  it("does not take the trunk for a branch holding the claim", () => {
    const mark = takenMark(BRANCH, "2026-09-20", "main");
    expect(lapsed(item(mark), ["main", "origin/main"], "2026-09-25")).toEqual({
      since: "2026-09-20",
      days: 5,
    });
  });

  it("and not origin's copy of the trunk either, in a clone with no local main", () => {
    const mark = takenMark(BRANCH, "2026-09-20", "main");
    expect(lapsed(item(mark), ["origin/main"], "2026-09-25", "origin/main")).toBeDefined();
  });

  /** A lane dealt a branch of its own is holding the item on that one. */
  it("says nothing when the branch the mark names is live and the derived one is not", () => {
    const mark = takenMark(BRANCH, "2026-09-20", "claude/queue-something-else");
    expect(lapsed(item(mark), ["claude/queue-something-else"], "2026-09-25")).toBeUndefined();
  });

  /** And the half a retitle leaves behind: the parenthesised claim branch. */
  it("says nothing when the parenthesised claim branch is the live one", () => {
    const mark = takenMark("claude/queue-under-its-old-title", "2026-09-20", "main");
    const one = item(mark);
    expect(lapsed(one, ["claude/queue-under-its-old-title"], "2026-09-25")).toBeUndefined();
    expect(branchFor(one)).not.toBe("claude/queue-under-its-old-title");
  });

  it("is silent on a mark with no readable date rather than guessing at one", () => {
    expect(lapsed(item("somebody, sometime"), [], "2026-09-25")).toBeUndefined();
  });
});

describe("lapsedLine", () => {
  it("ends in the command, with the title spelled out", () => {
    const one = item(takenMark(BRANCH, "2026-09-20"));
    const line = lapsedLine(one, { since: "2026-09-20", days: 5 });
    expect(line).toContain("2026-09-20");
    expect(line).toContain("5 days ago");
    expect(lapsedLine(one, { since: "2026-09-20", days: 1 })).toContain("a day ago");
    expect(line).toContain(`bun run queue release ${JSON.stringify(TITLE)}`);
  });
});

describe("statusOf with a lapsed claim", () => {
  const items = parseItems(
    `${ENTRY.replace("- **Files:**", `- **Taken:** ${takenMark(BRANCH, "2026-09-20", "main")}\n- **Files:**`)}`,
    "queue",
  );

  it("still counts it BUSY — a missing ref is what a live cloud claim looks like", () => {
    const status = statusOf(items, ["main"], "2026-09-25");
    expect(status.state).toBe("busy");
    expect(status.waiting).toBe(0);
    expect(status.ongoing[0]?.lapsed).toEqual({ since: "2026-09-20", days: 5 });
  });

  it("marks the line and says the sentence that gives it back", () => {
    const said = statusLines(statusOf(items, ["main"], "2026-09-25")).join("\n");
    expect(said).toStartWith("BUSY");
    expect(said).toContain("(lapsed)");
    expect(said).toContain("1 of them is a lapsed claim");
    expect(said).toContain("bun run queue release");
  });

  /** No clock, no claim about elapsed time: the old two-argument call. */
  it("says nothing about lapsing when the caller gave no day", () => {
    const status = statusOf(items, ["main"]);
    expect(status.state).toBe("busy");
    expect(status.ongoing[0]?.lapsed).toBeUndefined();
    expect(statusLines(status).join("\n")).not.toContain("lapsed");
  });
});
