import { describe, expect, it } from "bun:test";
import { claimOn, takenMark, unclaimed } from "../claim.js";
import { clearTaken, markTaken, parseItems, removeItem } from "../queue.js";

/**
 * The `Taken:` line — the half of a claim that survives a clone.
 *
 * A branch is instant and local; a session working in its own checkout of
 * `origin` never sees one. On 3 September 2026 two sessions drained the same
 * six items in parallel because neither could see the other's claim, so `bun
 * run queue next` now also writes this line into the entry on `main` and pushes
 * it. What is tested here is the editing: `run.ts` is the half that talks to
 * git, and the shape of the file is the part worth pinning.
 */

const ONE = `## Split the wave editor's cell panel

- **Found:** 2026-09-03, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.
`;

const TWO = `${ONE}
## Finish the wave editor's cell panel

- **Found:** 2026-09-03, claude/other-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

The other half of it.
`;

const MARK = takenMark("claude/queue-split-the-wave-editors-cell-panel", "2026-09-04");
const TITLE = "Split the wave editor's cell panel";

describe("takenMark", () => {
  it("says the day and the branch, in the order Found: uses", () => {
    expect(MARK).toBe("2026-09-04, claude/queue-split-the-wave-editors-cell-panel");
  });
});

describe("markTaken", () => {
  it("writes the line directly under Found:, so the two dates read together", () => {
    const lines = markTaken(ONE, TITLE, MARK).split("\n");
    expect(lines[2]).toBe("- **Found:** 2026-09-03, claude/some-lane");
    expect(lines[3]).toBe(`- **Taken:** ${MARK}`);
    expect(lines[4]).toBe("- **Files:** `tools/director/src/cell-panel.ts`");
  });

  it("is read straight back by the parser", () => {
    expect(parseItems(markTaken(ONE, TITLE, MARK), "queue")[0]?.taken).toBe(MARK);
  });

  it("leaves every other entry alone", () => {
    const items = parseItems(markTaken(TWO, TITLE, MARK), "queue");
    expect(items.map((i) => i.taken)).toEqual([MARK, ""]);
  });

  it("refuses an entry that is already taken, rather than overwriting the holder", () => {
    const once = markTaken(ONE, TITLE, MARK);
    expect(() => markTaken(once, TITLE, "2026-09-05, claude/queue-someone-else")).toThrow(
      /already taken/,
    );
  });

  it("throws rather than silently doing nothing", () => {
    expect(() => markTaken("# Queue\n", "not here", MARK)).toThrow(/no entry titled/);
  });
});

describe("clearTaken", () => {
  it("puts the file back exactly as it was", () => {
    expect(clearTaken(markTaken(ONE, TITLE, MARK), TITLE)).toBe(ONE);
  });

  it("does nothing to an entry nobody holds", () => {
    expect(clearTaken(ONE, TITLE)).toBe(ONE);
  });

  it("gives back only the entry it was asked about", () => {
    const both = markTaken(
      markTaken(TWO, TITLE, MARK),
      "Finish the wave editor's cell panel",
      MARK,
    );
    const items = parseItems(clearTaken(both, TITLE), "queue");
    expect(items.map((i) => i.taken)).toEqual(["", MARK]);
  });
});

describe("a claim read off the file", () => {
  const held = parseItems(markTaken(ONE, TITLE, MARK), "queue")[0]!;

  it("answers even when no branch is in sight — the case a clone is always in", () => {
    expect(claimOn(held, ["main"])).toBe(MARK);
  });

  it("hides the item from what `next` would hand out", () => {
    const items = parseItems(markTaken(TWO, TITLE, MARK), "queue");
    expect(unclaimed(items, ["main"]).map((i) => i.title)).toEqual([
      "Finish the wave editor's cell panel",
    ]);
  });

  it("still prefers the branch, which is the answer that expires first", () => {
    expect(claimOn(held, ["claude/queue-split-the-wave-editors-cell-panel"])).toBe(
      "claude/queue-split-the-wave-editors-cell-panel",
    );
  });
});

describe("draining a marked entry", () => {
  it("takes the Taken: line out with the entry it belongs to", () => {
    const rest = removeItem(markTaken(TWO, TITLE, MARK), TITLE);
    expect(rest).not.toContain("Taken:");
    expect(parseItems(rest, "queue").map((i) => i.title)).toEqual([
      "Finish the wave editor's cell panel",
    ]);
  });
});
