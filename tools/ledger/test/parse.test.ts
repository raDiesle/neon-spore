import { describe, expect, test } from "bun:test";
import { parseLedger, total } from "../parse.js";
import { between, read } from "../read.js";

/**
 * One entry in each shape sessions have written the ledger in, so a fifth
 * shape is a red test rather than a third of the file silently left out of a
 * reading (`docs/lane-speed.md`, 29 September 2026).
 */

const LEDGER = `# Where a session's time goes

A preamble with a stray reading: 99 min that is not an entry.

## 2026-09-20 — a table

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the entry |
| writing | 45 | the code |
| looking | 15 | the preview |
| friction | 15 | the 250-line ceiling found by the test |
| landing | 15 | the commit |

**The bottleneck was looking**, in bold prose.

*Measured: the rows above are the session's own estimate.*

## 2026-09-24 — colons

- reading: 10 min. The queue entry.
- writing: 15 min. The code.
- looking: 0 min. Nothing drawn.
- friction: 5 min. A heredoc lost its
  backslashes.
- landing: 5 min. \`land\`.

Bottleneck: writing — the step had to be argued first.

*Measured: 3 min from this lane's first commit to the trunk moving, by \`bun run land\`.*

## A dash and a trailing date — 2026-09-26

- reading — 5 min. The file.
- writing — 5 min.
- looking — 10 min.
- friction — 0 min.
- landing — 5 min.

Bottleneck: none worth the name; reading came close.

*Measured: 12 min from this lane's queue claim to the trunk moving, by \`bun run land\`.*

## 27 September 2026 — bold names

- **reading** — 30 min
- **writing** — 60 min
- **looking** — 0 min
- **friction** — 20 min, \`land\` refused twice
- **landing** — 10 min

Bottleneck: friction.

*Measured: under a minute from this lane's branch being made to the trunk moving, by \`bun run land\`.*

## Not an entry, no date
`;

describe("the parse", () => {
  const entries = parseLedger(LEDGER);

  test("reads every dated entry in all four shapes and nothing else", () => {
    expect(entries.map((e) => e.date)).toEqual([
      "2026-09-20",
      "2026-09-24",
      "2026-09-26",
      "2026-09-27",
    ]);
    expect(entries.map(total)).toEqual([110, 35, 25, 120]);
    expect(entries[2]?.title).toBe("A dash and a trailing date");
  });

  test("keeps the friction row's words, across a continued line", () => {
    expect(entries[1]?.friction).toContain("backslashes");
    expect(entries[3]?.friction).toContain("refused");
  });

  test("names the row the bottleneck sentence names first", () => {
    expect(entries.map((e) => e.bottleneck)).toEqual(["looking", "writing", "none", "friction"]);
  });

  test("reads a stamp's minutes and its start, and no stamp from a line without a figure", () => {
    expect(entries[0]?.stamp).toBeUndefined();
    expect(entries[1]?.stamp).toEqual({ minutes: 3, from: "first commit" });
    expect(entries[2]?.stamp).toEqual({ minutes: 12, from: "claim" });
    expect(entries[3]?.stamp).toEqual({ minutes: 0, from: "branch" });
  });
});

describe("the reading", () => {
  const entries = parseLedger(LEDGER);

  test("sums the rows and shares them out", () => {
    const r = read(entries);
    expect(r.lanes).toBe(4);
    expect(r.minutes).toBe(290);
    expect(r.median).toBe(110);
    expect(r.rows.writing.minutes).toBe(125);
    expect(r.rows.writing.share).toBeCloseTo(125 / 290);
    // The longest 14% of four lanes is one lane: the 120.
    expect(r.tailShare).toBeCloseTo(120 / 290);
    expect(r.atLeast90).toBe(2);
    expect(r.atMost25).toBe(1);
  });

  test("counts friction by the cause its words name", () => {
    const r = read(entries);
    expect(r.causes["the 250-line ceiling"]).toEqual({ lanes: 1, minutes: 15 });
    expect(r.causes["shell quoting"]).toEqual({ lanes: 1, minutes: 5 });
    expect(r.causes["`land` refusing or stopping"]).toEqual({ lanes: 1, minutes: 20 });
  });

  test("takes a period by its dates, either end open", () => {
    expect(between(entries, "2026-09-24", "2026-09-26").map((e) => e.date)).toEqual([
      "2026-09-24",
      "2026-09-26",
    ]);
    expect(between(entries, "2026-09-27")).toHaveLength(1);
    expect(between(entries, undefined, "2026-09-20")).toHaveLength(1);
  });
});
