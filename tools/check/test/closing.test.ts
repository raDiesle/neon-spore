import { describe, expect, it } from "bun:test";
import { driftLine } from "../../test/figure.js";
import { closingReport } from "../closing.js";

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
