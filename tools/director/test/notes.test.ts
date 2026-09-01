import { describe, expect, test } from "bun:test";
import { byDay, parseNotes } from "../src/notes.js";
import { parseQueue } from "../src/queue.js";

const FILE = `# Release notes

What each landing changed, newest first.

**Read-only.** Nothing in this file is ticked.

## 2026-09-02 · bbbb — The palette was a rail beside a grid

Four things the owner asked for, all of them about the BRUSH & MAP column.

## 2026-09-01 · aaaa — The siren gets a left and a right

Four corrections from the owner, looking at the thing running.

## 2026-09-01 · cccc — The dart brush was cut in half
`;

describe("parseNotes", () => {
  test("reads every entry, in the file's own order", () => {
    const notes = parseNotes(FILE);
    expect(notes.map((n) => n.sha)).toEqual(["bbbb", "aaaa", "cccc"]);
  });

  test("splits the heading into date, sha and subject", () => {
    const first = parseNotes(FILE)[0];
    expect(first?.date).toBe("2026-09-02");
    expect(first?.subject).toBe("The palette was a rail beside a grid");
  });

  test("the prose under a heading becomes that entry's summary", () => {
    expect(parseNotes(FILE)[1]?.summary).toBe(
      "Four corrections from the owner, looking at the thing running.",
    );
  });

  test("an entry with no prose has an empty summary rather than the next one's", () => {
    expect(parseNotes(FILE)[2]?.summary).toBe("");
  });

  test("the preamble is dropped — it explains the file to somebody reading it", () => {
    const notes = parseNotes(FILE);
    expect(notes.every((n) => !n.summary.includes("Read-only"))).toBe(true);
  });

  test("a file with nothing in it yet is no entries, not one blank one", () => {
    expect(parseNotes("# Release notes\n\nNothing yet.\n")).toEqual([]);
  });
});

describe("byDay", () => {
  test("consecutive entries on one date group under it", () => {
    const days = byDay(parseNotes(FILE));
    expect(days.map((d) => d.date)).toEqual(["2026-09-02", "2026-09-01"]);
    expect(days[1]?.notes).toHaveLength(2);
  });

  test("no entries is no days", () => {
    expect(byDay([])).toEqual([]);
  });
});

/**
 * The queue is read for its own sake now, not joined to git. These pin the part
 * that survived: the file still carries a heading, an optional italic line and
 * a brief, and the entries still come out in the file's order.
 */
describe("parseQueue", () => {
  const QUEUE = `# Queue

The ordered work.

## COLLECT AND CONVERT A SECOND GAME'S BODIES
_claude/convert-second-game · tools/shape-sheet/src/forms docs/tower-defence.md_
**Asked for by the owner.** Nine bodies and four motions.

## A DISABLED BUTTON HAS NO STYLE OF ITS OWN
**Proposed by the run.** No \`button:disabled\` rule at all.
`;

  test("one entry per heading, in the file's order", () => {
    expect(parseQueue(QUEUE).map((l) => l.title)).toEqual([
      "COLLECT AND CONVERT A SECOND GAME'S BODIES",
      "A DISABLED BUTTON HAS NO STYLE OF ITS OWN",
    ]);
  });

  test("the italic line is kept as prose, not parsed into a branch", () => {
    expect(parseQueue(QUEUE)[0]?.meta).toBe(
      "claude/convert-second-game · tools/shape-sheet/src/forms docs/tower-defence.md",
    );
  });

  test("an entry without one is still an entry — the line is optional now", () => {
    const lane = parseQueue(QUEUE)[1];
    expect(lane?.meta).toBe("");
    expect(lane?.brief).toContain("Proposed by the run.");
  });

  test("the brief is everything under the heading bar that line", () => {
    expect(parseQueue(QUEUE)[0]?.brief).toBe(
      "**Asked for by the owner.** Nine bodies and four motions.",
    );
  });
});
