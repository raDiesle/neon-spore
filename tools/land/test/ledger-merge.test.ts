import { describe, expect, test } from "bun:test";
import { LEDGER_FILE, mergeLedger } from "../ledger-merge.js";

/**
 * The ledger merged when two lanes land the same hour.
 *
 * `ledger-merge.ts` has the argument. What is held here is the one property
 * that separates this from the queue's merge and matters more than any of the
 * others: **the file is a record, and no side of any merge may lose a row.**
 * Every case below is written so that a resolver which quietly preferred one
 * side would fail it.
 */

const PREAMBLE = `# Where a session's time goes

One \`##\` entry per lane, written in the commit that lands it.
`;

function entry(name: string, minutes: number): string {
  return `## 2026-09-16 — ${name} — what it did

| activity | minutes |
|---|---|
| reading | ${minutes} |

The bottleneck was reading.
`;
}

const BASE = `${PREAMBLE}\n${entry("first-lane", 5)}`;

describe("the ledger's own merge", () => {
  test("keeps both entries when two lanes appended at once", () => {
    const trunk = `${BASE}\n${entry("their-lane", 10)}`;
    const lane = `${BASE}\n${entry("my-lane", 15)}`;
    const out = mergeLedger(BASE, trunk, lane);
    expect(out).not.toBeNull();
    // Neither row is lost, which is the whole point of the file.
    expect(out).toContain("first-lane");
    expect(out).toContain("their-lane");
    expect(out).toContain("my-lane");
    // The trunk's entry comes first: it is already on main, mine is arriving.
    expect((out as string).indexOf("their-lane")).toBeLessThan((out as string).indexOf("my-lane"));
  });

  test("keeps every trunk entry when the lane wrote nothing new", () => {
    const trunk = `${BASE}\n${entry("their-lane", 10)}`;
    const out = mergeLedger(BASE, trunk, BASE);
    expect(out).toContain("their-lane");
    expect(out).toContain("first-lane");
  });

  test("takes the lane's correction to its own entry", () => {
    const lane = BASE.replace("| reading | 5 |", "| reading | 25 |");
    const trunk = `${BASE}\n${entry("their-lane", 10)}`;
    const out = mergeLedger(BASE, trunk, lane);
    expect(out).toContain("| reading | 25 |");
    expect(out).toContain("their-lane");
  });

  test("refuses when the lane no longer has an entry the base had", () => {
    // A record that lost a row is not a decision a lane made, and no tool
    // should settle it. The landing stops and a person looks.
    const lane = PREAMBLE;
    const trunk = `${BASE}\n${entry("their-lane", 10)}`;
    expect(mergeLedger(BASE, trunk, lane)).toBeNull();
  });

  test("refuses when both sides rewrote the same entry differently", () => {
    const trunk = BASE.replace("| reading | 5 |", "| reading | 10 |");
    const lane = BASE.replace("| reading | 5 |", "| reading | 20 |");
    expect(mergeLedger(BASE, trunk, lane)).toBeNull();
  });

  test("refuses when both sides filed different entries under one heading", () => {
    const trunk = `${BASE}\n${entry("same-name", 10)}`;
    const lane = `${BASE}\n${entry("same-name", 99)}`;
    expect(mergeLedger(BASE, trunk, lane)).toBeNull();
  });

  test("keeps both bodies when a side files a second one under an old heading", () => {
    // A lane landed in two parts under one subject. Followed by heading and
    // occurrence, the second is a row added, and the first is not overwritten.
    const lane = `${BASE}\n${entry("first-lane", 9)}`;
    const trunk = `${BASE}\n${entry("their-lane", 10)}`;
    const out = mergeLedger(BASE, trunk, lane) as string;
    expect(out).toContain("| reading | 5 |");
    expect(out).toContain("| reading | 9 |");
    expect(out.indexOf("their-lane")).toBeLessThan(out.indexOf("| reading | 9 |"));
  });

  test("merges two appends onto a ledger that already uses one heading twice", () => {
    // `main` on 25 September 2026: "AUTO: the director plays a seat live" twice,
    // two bodies, and every landing that day refused over it.
    const twice = `${BASE}\n${entry("first-lane", 7)}`;
    const trunk = `${twice}\n${entry("their-lane", 10)}`;
    const lane = `${twice}\n${entry("my-lane", 15)}`;
    expect(mergeLedger(twice, trunk, lane)).toBe(`${trunk}\n${entry("my-lane", 15)}`);
  });
});

describe("the preamble, which is prose", () => {
  test("takes the side that changed it when only one did", () => {
    const lane = BASE.replace("One `##` entry", "Exactly one `##` entry");
    expect(mergeLedger(BASE, BASE, lane)).toContain("Exactly one");
    expect(mergeLedger(BASE, lane, BASE)).toContain("Exactly one");
  });

  test("refuses when both changed it differently", () => {
    const trunk = BASE.replace("One `##` entry", "A `##` entry");
    const lane = BASE.replace("One `##` entry", "Exactly one `##` entry");
    expect(mergeLedger(BASE, trunk, lane)).toBeNull();
  });
});

describe("the file it is registered for", () => {
  test("is the ledger the landing commit appends to", () => {
    // `CLAUDE.md` names this path as the file every lane writes, and
    // `replay.ts` keys its resolver on the same constant.
    expect(LEDGER_FILE).toBe("docs/time-log.md");
  });

  test("merges as it stands, so no landing is left to resolve it by hand", async () => {
    // One heading filed twice with two bodies makes the merge refuse on every
    // side, and every landing that hour conflicts on the ledger. On 25
    // September 2026 the AUTO lane's draft entry sat above its final one and
    // did exactly that, to the next lane that landed.
    const now = await Bun.file(new URL("../../../docs/time-log.md", import.meta.url)).text();
    const trunk = `${now}\n${entry("trunk-lane", 5)}`;
    const lane = `${now}\n${entry("this-lane", 10)}`;
    expect(mergeLedger(now, trunk, lane)).not.toBeNull();
  });
});
