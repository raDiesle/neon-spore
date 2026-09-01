import { describe, expect, test } from "bun:test";
import { byDay, parseNotes } from "../src/notes.js";

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
