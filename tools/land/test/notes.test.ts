import { describe, expect, test } from "bun:test";
import { type Landed, PREAMBLE, parseLanded, prepend, renderEntry, summaryOf } from "../notes.js";

const RS = String.fromCharCode(30);
const US = String.fromCharCode(31);

function record(full: string, sha: string, date: string, subject: string, body: string): string {
  return [full, sha, date, subject, body].join(US) + RS;
}

describe("summaryOf", () => {
  test("takes the first paragraph and joins its lines", () => {
    expect(summaryOf("The eye moves off the enemy\nand becomes one siren.\n\nThe rest.")).toBe(
      "The eye moves off the enemy and becomes one siren.",
    );
  });

  test("stops at a trailer rather than swallowing it", () => {
    expect(summaryOf("A body gets a hole.\nCo-Authored-By: Claude Opus 5 <x@y>")).toBe(
      "A body gets a hole.",
    );
  });

  test("skips the blank line a git body opens with", () => {
    expect(summaryOf("\n\nWhat changed.")).toBe("What changed.");
  });

  test("a subject-only message summarises to nothing", () => {
    expect(summaryOf("")).toBe("");
  });
});

describe("parseLanded", () => {
  test("reads the records git's format writes, oldest first", () => {
    const log =
      record("aaaa1", "aaaa", "2026-09-01", "The siren gets a left and a right", "One eye.\n") +
      record("bbbb2", "bbbb", "2026-09-02", "The palette was a rail", "A grid.\n");
    const landed = parseLanded(log);
    expect(landed.map((c) => c.sha)).toEqual(["aaaa", "bbbb"]);
    expect(landed[0]?.subject).toBe("The siren gets a left and a right");
    expect(landed[1]?.summary).toBe("A grid.");
  });

  test("an empty log is no commits, not one blank one", () => {
    expect(parseLanded("")).toEqual([]);
  });
});

describe("renderEntry", () => {
  const commit: Landed = {
    full: "aaaa1",
    sha: "aaaa",
    date: "2026-09-01",
    subject: "The siren gets a left and a right",
    summary: "One eye, two blocks.",
  };

  test("heads the entry with date, sha and subject", () => {
    expect(renderEntry(commit)).toBe(
      "## 2026-09-01 · aaaa — The siren gets a left and a right\n\nOne eye, two blocks.\n",
    );
  });

  test("a commit with no body is a heading alone", () => {
    expect(renderEntry({ ...commit, summary: "" })).toBe(
      "## 2026-09-01 · aaaa — The siren gets a left and a right\n",
    );
  });
});

describe("prepend", () => {
  const first: Landed = {
    full: "1",
    sha: "aaaa",
    date: "2026-09-01",
    subject: "First",
    summary: "One.",
  };
  const second: Landed = {
    full: "2",
    sha: "bbbb",
    date: "2026-09-02",
    subject: "Second",
    summary: "Two.",
  };

  test("an empty file gets the preamble and the entries", () => {
    const out = prepend("", [first]);
    expect(out.startsWith("# Release notes")).toBe(true);
    expect(out).toContain("## 2026-09-01 · aaaa — First");
  });

  test("newest first, whatever order the log arrived in", () => {
    const out = prepend("", [first, second]);
    expect(out.indexOf("bbbb")).toBeLessThan(out.indexOf("aaaa"));
  });

  test("new entries go under the preamble, above the existing ones", () => {
    const existing = prepend("", [first]);
    const out = prepend(existing, [second]);
    expect(out.indexOf("# Release notes")).toBeLessThan(out.indexOf("bbbb"));
    expect(out.indexOf("bbbb")).toBeLessThan(out.indexOf("aaaa"));
    // The old entry survives intact — this file only ever grows at the top.
    expect(out).toContain("## 2026-09-01 · aaaa — First");
  });

  test("landing nothing leaves the file exactly as it was", () => {
    const existing = prepend("", [first]);
    expect(prepend(existing, [])).toBe(existing);
  });

  test("a file that is only a preamble still takes an entry", () => {
    const out = prepend(PREAMBLE, [first]);
    expect(out).toContain("## 2026-09-01 · aaaa — First");
    expect(out.indexOf("# Release notes")).toBe(0);
  });
});
