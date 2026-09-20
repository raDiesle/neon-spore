import { describe, expect, test } from "bun:test";
import { PREAMBLE } from "../notes.js";
import { mergeNotes, NOTES_FILE } from "../notes-merge.js";

/**
 * The release notes merged when two trunks both moved.
 *
 * The same three-way merge the ledger uses (`record-merge.ts`), read from the
 * other end: this file is written at the **top**, so the entries this side
 * carries belong above the ones origin already had. The cases below are the
 * ones that actually happened on 16 September 2026 — both sides prepended, and
 * then the two that must refuse rather than guess.
 */

function entry(sha: string, subject: string): string {
  return `\n## 2026-09-16 · ${sha} — ${subject}\n\nWhat it did, in a sentence.\n`;
}

const OLD = entry("aaaaaaa", "the landing they both branched from");
const BASE = PREAMBLE + OLD;

describe("merging docs/release-notes.md", () => {
  test("is the file note-commit.ts writes", () => {
    expect(NOTES_FILE).toBe("docs/release-notes.md");
  });

  test("keeps both entries, this side's at the top", () => {
    const trunk = PREAMBLE + entry("bbbbbbb", "theirs, pushed first") + OLD;
    const lane = PREAMBLE + entry("ccccccc", "ours, landed here") + OLD;
    const out = mergeNotes(BASE, trunk, lane);
    expect(out).not.toBeNull();
    const text = out ?? "";
    expect(text).toContain("ours, landed here");
    expect(text).toContain("theirs, pushed first");
    expect(text.indexOf("ccccccc")).toBeLessThan(text.indexOf("bbbbbbb"));
    // And the entry they agreed on is still the oldest, once.
    expect(text.split("aaaaaaa").length - 1).toBe(1);
    expect(text.startsWith(PREAMBLE)).toBe(true);
  });

  test("refuses when a side lost an entry the two once shared", () => {
    const trunk = PREAMBLE + entry("bbbbbbb", "theirs") + OLD;
    // The record is append-only: an entry gone from this side is a row lost,
    // not a decision, and the push should stop the way a person would.
    expect(mergeNotes(BASE, trunk, PREAMBLE + entry("ccccccc", "ours"))).toBeNull();
  });

  test("merges a file carrying one note written twice, word for word", () => {
    // docs/release-notes.md carried 8995ded7 twice from 19 September 2026, the
    // two blocks byte-identical, and every reconcile refused the whole file
    // over a pair that agree perfectly. There is nothing to decide between two
    // copies of one sentence.
    const twice = PREAMBLE + OLD + OLD;
    const trunk = twice.replace(PREAMBLE, PREAMBLE + entry("bbbbbbb", "theirs"));
    const lane = twice.replace(PREAMBLE, PREAMBLE + entry("ccccccc", "ours"));
    const out = mergeNotes(twice, trunk, lane);
    expect(out).not.toBeNull();
    const text = out ?? "";
    expect(text).toContain("ours");
    expect(text).toContain("theirs");
    // And the doubled entry is still there — this merge drops nothing.
    expect(text.split("aaaaaaa").length - 1).toBe(2);
  });

  test("refuses when both sides wrote different bodies under one heading", () => {
    const trunk = PREAMBLE + OLD.replace("in a sentence", "their way");
    const lane = PREAMBLE + OLD.replace("in a sentence", "our way");
    expect(mergeNotes(BASE, trunk, lane)).toBeNull();
  });

  test("takes the preamble from whichever side changed it, and refuses when both did", () => {
    const theirs = BASE.replace("Read-only.", "Read only.");
    expect(mergeNotes(BASE, theirs, BASE)).toBe(theirs);
    expect(mergeNotes(BASE, BASE, theirs)).toBe(theirs);
    expect(mergeNotes(BASE, theirs, BASE.replace("Read-only.", "Never edited."))).toBeNull();
  });
});
