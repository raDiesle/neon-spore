import { describe, expect, test } from "bun:test";
import { appendDecision, ledgerLines, parseLedger, sameCommit } from "../ledger.js";

const SAMPLE = `# Verified

- \`2e06e07\` 2026-08-28 PASS — the hole reads at 26 px on a phone
- \`2e06e07\` 2026-08-28 FAIL — the flank torches do not clip the hull
  - it clips at the left lobe once the queen is on the field
`;

describe("parseLedger", () => {
  test("reads verdict, date and text", () => {
    const decisions = parseLedger(SAMPLE);
    expect(decisions).toHaveLength(2);
    expect(decisions[0]).toEqual({
      sha: "2e06e07",
      date: "2026-08-28",
      verdict: "PASS",
      text: "the hole reads at 26 px on a phone",
      note: "",
    });
    expect(decisions[1]?.note).toBe("it clips at the left lobe once the queen is on the field");
  });

  test("prose keeps its own em dashes", () => {
    const line = "- `abc1234` 2026-08-28 PASS — the sway — at 26 px — reads";
    expect(parseLedger(line)[0]?.text).toBe("the sway — at 26 px — reads");
  });

  test("ignores the file's prose", () => {
    expect(parseLedger("# Verified\n\nSome paragraph.\n")).toEqual([]);
  });
});

describe("appendDecision", () => {
  test("round-trips through the parser", () => {
    const decision = {
      sha: "abc1234",
      date: "2026-08-29",
      verdict: "FAIL" as const,
      text: "the wave's timing at 96 BPM",
      note: "the second guard window is too tight",
    };
    const next = appendDecision(SAMPLE, decision);
    expect(parseLedger(next)).toHaveLength(3);
    expect(parseLedger(next)[2]).toEqual(decision);
  });

  test("appends rather than reorders", () => {
    const next = appendDecision(SAMPLE, {
      sha: "abc1234",
      date: "2026-08-29",
      verdict: "PASS",
      text: "later",
      note: "",
    });
    expect(next.startsWith(SAMPLE.trimEnd())).toBe(true);
    expect(next.endsWith("\n")).toBe(true);
  });

  test("the first entry does not press against the prose above it", () => {
    const fresh = appendDecision("# Verified\n\nSome paragraph.\n", {
      sha: "abc1234",
      date: "2026-08-29",
      verdict: "PASS",
      text: "the first one",
      note: "",
    });
    expect(fresh).toContain("Some paragraph.\n\n- `abc1234`");
    expect(parseLedger(fresh)).toHaveLength(1);
  });

  test("later entries join the list rather than scattering", () => {
    const two = appendDecision(
      appendDecision("# Verified\n", {
        sha: "abc1234",
        date: "2026-08-29",
        verdict: "PASS",
        text: "one",
        note: "",
      }),
      { sha: "abc1234", date: "2026-08-29", verdict: "PASS", text: "two", note: "" },
    );
    expect(two).toContain("PASS — one\n- `abc1234` 2026-08-29 PASS — two");
  });

  test("a note is a line of its own, so the text can say anything", () => {
    const line = ledgerLines({
      sha: "abc1234",
      date: "2026-08-29",
      verdict: "FAIL",
      text: "a — b",
      note: "c — d",
    });
    expect(line.split("\n")).toHaveLength(2);
  });
});

describe("line endings", () => {
  // `docs/verified.md` is LF on disk (`.gitattributes` sets `eol=lf`, and a
  // fresh `git checkout` of the file reproduces that with no diff). But the
  // parser reads whatever bytes it is handed, so it is pinned against both
  // forms rather than against the one the file happens to be today — the
  // failure mode if it silently regressed was a row that parses as nothing.
  const lf = "- `abc1234` 2026-08-28 PASS — a line ending in LF\n";
  const crlf = "- `abc1234` 2026-08-28 PASS — a line ending in CRLF\r\n";
  const crlfWithNote =
    "- `abc1234` 2026-08-28 FAIL — a line ending in CRLF\r\n  - a note also CRLF\r\n";

  test("an LF row parses", () => {
    expect(parseLedger(lf)).toEqual([
      {
        sha: "abc1234",
        date: "2026-08-28",
        verdict: "PASS",
        text: "a line ending in LF",
        note: "",
      },
    ]);
  });

  test("a CRLF row round-trips the same as an LF row, carriage return dropped", () => {
    expect(parseLedger(crlf)).toEqual([
      {
        sha: "abc1234",
        date: "2026-08-28",
        verdict: "PASS",
        text: "a line ending in CRLF",
        note: "",
      },
    ]);
  });

  test("a CRLF note attaches without carrying its carriage return into the text", () => {
    const decisions = parseLedger(crlfWithNote);
    expect(decisions).toHaveLength(1);
    expect(decisions[0]?.text).toBe("a line ending in CRLF");
    expect(decisions[0]?.note).toBe("a note also CRLF");
    expect(decisions[0]?.text.endsWith("\r")).toBe(false);
    expect(decisions[0]?.note.endsWith("\r")).toBe(false);
  });
});

describe("sameCommit", () => {
  test("an abbreviation matches the sha it abbreviates, either way round", () => {
    expect(sameCommit("2e06e07", "2e06e07a9")).toBe(true);
    expect(sameCommit("2e06e07a9", "2e06e07")).toBe(true);
    expect(sameCommit("2e06e07", "2e06e08")).toBe(false);
  });
});
