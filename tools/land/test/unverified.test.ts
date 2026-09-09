import { describe, expect, it } from "bun:test";
import { parseItems, problemsIn } from "../../queue/queue.js";
import {
  appendEntry,
  filesLine,
  parseUnverified,
  renderUnverified,
  type Unverified,
} from "../unverified.js";

/**
 * `--unverified` writes a queue entry, so the thing worth proving is that it
 * writes one `bun run queue` will accept. The queue's own parser is imported
 * rather than re-described here: a format written out by hand in a test is a
 * second copy of the format, and it is the copy that stays right while the
 * real one moves.
 */

const LANDING: Unverified = {
  branch: "claude/some-lane",
  date: "2026-09-09",
  sha: "abc1234",
  items: ["THE GRATE's timing at tempo", '`bun run perf --wave "THE GRATE"`'],
  files: ["packages/content/src/waves.ts", "packages/render/src/grate.ts"],
  subjects: ["Give THE GRATE a second rung"],
};

describe("what a landing could not check", () => {
  it("is an entry the queue accepts", () => {
    const items = parseItems(renderUnverified(LANDING), "queue");
    expect(items).toHaveLength(1);
    expect(problemsIn(items)).toEqual([]);
  });

  it("names the branch, the date and every file the landing touched", () => {
    const [item] = parseItems(renderUnverified(LANDING), "queue");
    expect(item?.found).toContain("2026-09-09");
    expect(item?.found).toContain("claude/some-lane");
    expect(item?.files).toEqual(["packages/content/src/waves.ts", "packages/render/src/grate.ts"]);
  });

  it("lists each thing separately, because each is a different machine's job", () => {
    const entry = renderUnverified(LANDING);
    expect(entry).toContain("- THE GRATE's timing at tempo");
    expect(entry).toContain('- `bun run perf --wave "THE GRATE"`');
  });

  /**
   * Two lanes are easily unable to watch "the wave at tempo", and `problemsIn`
   * refuses a repeated title — so a second landing would land an entry the
   * queue's own format test then fails on, in a commit nobody was watching.
   * The sha is what keeps them apart.
   */
  it("gives two landings of the same words two titles", () => {
    const second = { ...LANDING, sha: "def5678" };
    const both = `${renderUnverified(LANDING)}\n${renderUnverified(second)}`;
    expect(problemsIn(parseItems(both, "queue"))).toEqual([]);
  });

  it("keeps the title inside the 80 the queue allows", () => {
    const long = { ...LANDING, items: ["x".repeat(200)] };
    const [item] = parseItems(renderUnverified(long), "queue");
    expect(item?.title.length).toBeLessThanOrEqual(80);
    expect(problemsIn(parseItems(renderUnverified(long), "queue"))).toEqual([]);
    // The full sentence is still in the body, where there is room for it.
    expect(renderUnverified(long)).toContain("x".repeat(200));
  });

  it("caps the file list and counts the rest", () => {
    const many = Array.from({ length: 12 }, (_, i) => `packages/sim/src/f${i}.ts`);
    expect(filesLine(many)).toContain("and 4 more");
    expect(filesLine([])).toBe("- **Files:** the commits named above");
  });

  it("says which commit it is about when several landed at once", () => {
    const several = { ...LANDING, subjects: ["First", "Second", "Third"] };
    expect(renderUnverified(several)).toContain("3 commits landed, ending in *Third*");
  });
});

describe("the flag itself", () => {
  it("is repeatable, in both spellings", () => {
    expect(
      parseUnverified(["--keep", "--unverified", "the wave at tempo", "--unverified=the shape"]),
    ).toEqual(["the wave at tempo", "the shape"]);
  });

  it("takes nothing from a bare flag, so the caller can notice and say so", () => {
    expect(parseUnverified(["--unverified"])).toEqual([]);
    expect(parseUnverified(["--unverified", "--push"])).toEqual([]);
    expect(parseUnverified(["--push"])).toEqual([]);
  });
});

describe("where the entry goes", () => {
  it("is the end of the file, so the oldest waiting work stays in front", () => {
    const existing = "# Queue\n\n## An older finding\n\n- **Found:** 2026-09-01, main\n";
    const out = appendEntry(existing, renderUnverified(LANDING));
    expect(out.indexOf("An older finding")).toBeLessThan(out.indexOf("Unverified at abc1234"));
    expect(out).toStartWith("# Queue");
  });

  it("is the whole file when there was nothing there", () => {
    expect(appendEntry("", renderUnverified(LANDING))).toStartWith("## Unverified at abc1234");
  });
});
