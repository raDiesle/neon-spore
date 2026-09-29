import { describe, expect, test } from "bun:test";
import { laneStart, minutesBetween, stamped, stampInto, stampLine } from "../stamp.js";

/**
 * The measured minutes a landing stamps under the entry a session wrote.
 *
 * `stamp.ts` has the argument — the ledger's own rows are out against the
 * trunk by a factor of between two and a half and four, and every speed
 * question this repository asks next is asked in minutes. What is held here is
 * the arithmetic and the one rule that matters about the file: a record is
 * appended to and never rewritten.
 */

const LEDGER = `# Where the minutes went

## 2026-09-15 — a-lane — the first

| activity | minutes |
|---|---|
| reading | 5 |

Bottleneck: reading.

## 2026-09-16 — another-lane — the second

| activity | minutes |
|---|---|
| reading | 10 |

Bottleneck: writing.
`;

describe("the elapsed minutes", () => {
  test("is the span between two git timestamps, to the nearest minute", () => {
    expect(minutesBetween(1_000_000, 1_000_000 + 47 * 60)).toBe(47);
    expect(minutesBetween(1_000_000, 1_000_000 + 47 * 60 + 31)).toBe(48);
  });

  test("is never negative, whatever the clocks say", () => {
    // A commit authored after the landing is a clock skew, not a lane that
    // took minus twenty minutes.
    expect(minutesBetween(1_000_000, 999_000)).toBe(0);
  });

  test("is zero rather than NaN for a timestamp that would not parse", () => {
    expect(minutesBetween(Number.NaN, 1_000_000)).toBe(0);
  });
});

describe("where the clock starts", () => {
  test("is the latest claim no later than the first commit", () => {
    // A session draining two items on one branch claimed the first at 100 and
    // the second at 500, after the first landed; this lane is the second.
    expect(laneStart(900, [100, 500, 1_200], 50)).toEqual({ at: 500, from: "claim" });
  });

  test("is the branch being made when nothing claimed it", () => {
    expect(laneStart(900, [], 300)).toEqual({ at: 300, from: "branch" });
    expect(laneStart(900, [1_000], 300)).toEqual({ at: 300, from: "branch" });
  });

  test("is the first commit when the branch was made after it, or not at all", () => {
    expect(laneStart(900, [], 950)).toEqual({ at: 900, from: "first commit" });
    expect(laneStart(900, [])).toEqual({ at: 900, from: "first commit" });
  });
});

describe("the line", () => {
  test("says the number and says it is a measurement", () => {
    const line = stampLine(47);
    expect(line).toContain("47 min");
    expect(line).toContain("Measured");
    // The rows above are not a measurement, and nothing else in the file says
    // which is which.
    expect(line).toContain("estimate");
  });

  test("says under a minute in words rather than as a zero", () => {
    expect(stampLine(0)).toContain("under a minute");
    expect(stampLine(0)).not.toContain("0 min");
  });

  test("says what the span does not hold", () => {
    expect(stampLine(12)).toContain("nothing before the first commit");
    expect(stampLine(12, "claim")).toContain("from this lane's queue claim");
    expect(stampLine(12, "claim")).toContain("nothing before the claim");
    expect(stampLine(12, "branch")).toContain("from this lane's branch being made");
  });
});

describe("stamping the ledger", () => {
  test("puts the line under the last entry, which is the lane's own", () => {
    const out = stampInto(LEDGER, 47);
    expect(out.trimEnd().endsWith("*")).toBe(true);
    expect(out).toContain("47 min");
    // Everything above is untouched, to the byte: this is a record.
    expect(out.startsWith(LEDGER.trimEnd())).toBe(true);
  });

  test("leaves a ledger that already carries one exactly as it was", () => {
    const once = stampInto(LEDGER, 47);
    expect(stampInto(once, 999)).toBe(once);
    expect(stamped(once)).toBe(true);
  });

  test("leaves a file with no entry alone rather than inventing one", () => {
    // A landing whose commits touched this file but wrote no `##` block has
    // nothing to stamp, and a line on its own would be a measurement of
    // nothing attached to nothing.
    expect(stampInto("# Where the minutes went\n", 47)).toBe("# Where the minutes went\n");
    expect(stampInto("", 47)).toBe("");
  });

  test("does not read an earlier entry's stamp as this one's", () => {
    const earlier = LEDGER.replace(
      "Bottleneck: reading.",
      `Bottleneck: reading.\n\n${stampLine(9)}`,
    );
    expect(stamped(earlier)).toBe(false);
    expect(stampInto(earlier, 47)).toContain("47 min");
  });
});
