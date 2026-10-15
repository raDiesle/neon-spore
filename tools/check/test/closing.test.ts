import { describe, expect, it } from "bun:test";
import { onlyTimedOut } from "../../land/red-check.js";
import { driftLine } from "../../test/figure.js";
import { closingReport, LOAD_MARK, loadLine } from "../closing.js";
import { timeoutsOf } from "../junit.js";

/**
 * The bottom of a run: the counts, and every drifted figure repeated under
 * them from whichever shard said it, because a shard's own block has scrolled
 * past by the time a reader looks (`tools/test/figure.ts`).
 */

const GREEN = `<testsuites name="bun test" tests="2" assertions="2" failures="0" skipped="0" time="1.5">
</testsuites>`;

describe("the closing report", () => {
  it("counts a green run and says nothing else", () => {
    const out = closingReport(GREEN, [{ code: 0, text: "2 pass" }], 2, "1.5");
    expect(out).toEqual([
      "\n2 pass, 0 fail, 0 skipped — 2 files across 1 shards in 1.5s wall, 1.5s of test",
    ]);
  });

  it("repeats a drift line from any shard, green ones too, under the counts", () => {
    const said = driftLine("tools/test/slow.test.ts: walks", 120, 800, 1);
    const out = closingReport(
      GREEN,
      [
        { code: 0, text: `(pass) walks\n${said}\n2 pass` },
        { code: 0, text: "1 pass" },
      ],
      2,
      "1.5",
    );
    expect(out.slice(1)).toEqual([`  ${said}`]);
  });

  it("finds a drift line bun indented", () => {
    const said = driftLine("a.test.ts", 50, 500, 1);
    const out = closingReport(GREEN, [{ code: 0, text: `    ${said}` }], 1, "0.1");
    expect(out[1]).toBe(`  ${said}`);
  });
});

/** A shard's report with these failures in it, by type. */
function report(...types: string[]): string {
  const cases = types
    .map(
      (type, i) =>
        `<testcase name="case ${i}" file="a.test.ts" line="${i + 1}"><failure type="${type}" message="said" /></testcase>`,
    )
    .join("\n");
  return `<testsuites name="bun test" tests="${types.length}" assertions="0" failures="${types.length}" skipped="0" time="9">\n${cases}\n</testsuites>`;
}

const BUSY = { avg: 30.4, cores: 14 };

describe("a run that only timed out", () => {
  it("is said apart from a failure, with the load it timed out under", () => {
    const xml = report("TimeoutError", "TimeoutError");
    const out = closingReport(xml, [{ code: 1, text: "", xml }], 2, "9", BUSY);
    expect(out.at(-1)).toBe(
      `  ${LOAD_MARK} every failure is a timeout and none an assertion, at load average 30.4 on 14 cores — run it again`,
    );
  });

  it("counts the timeouts when an assertion failed beside them, and claims nothing", () => {
    const xml = report("TimeoutError", "AssertionError");
    const out = closingReport(xml, [{ code: 1, text: "", xml }], 2, "9", BUSY);
    expect(out.at(-1)).toContain("1 of the 2 failures timed out");
    expect(out.join("\n")).not.toContain(LOAD_MARK);
  });

  it("claims nothing when a shard was killed, since a killed shard wrote no report", () => {
    const xml = report("TimeoutError");
    const out = closingReport(
      xml,
      [
        { code: 1, text: "", xml },
        { code: 1, text: "", xml: "" },
      ],
      2,
      "9",
      BUSY,
    );
    expect(out.join("\n")).not.toContain(LOAD_MARK);
  });

  it("says nothing of load on a green run or a red one with no timeout", () => {
    const xml = report("AssertionError");
    expect(loadLine(GREEN, [{ code: 0, text: "" }], BUSY)).toBeNull();
    expect(loadLine(xml, [{ code: 1, text: "", xml }], BUSY)).toBeNull();
    expect(timeoutsOf(report("TimeoutError", "AssertionError", "TimeoutError"))).toBe(2);
  });

  it("is the line a landing runs the check again on, and no other red is", () => {
    const xml = report("TimeoutError");
    const said = closingReport(xml, [{ code: 1, text: "", xml }], 1, "9", BUSY).join("\n");
    expect(onlyTimedOut(said)).toBe(true);
    expect(onlyTimedOut("(fail) a case\n  ^ this test timed out after 5000ms.")).toBe(false);
  });
});
