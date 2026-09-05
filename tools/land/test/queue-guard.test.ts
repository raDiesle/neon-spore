import { describe, expect, it } from "bun:test";
import { refusal, resurrected, titles } from "../queue-guard.js";

/**
 * The guard against a landing putting back work the trunk has finished.
 *
 * It happened twice on 5 September 2026: `tools/land/refusal.ts`, `--settle`
 * and the frames tests' shared browser were all on the trunk with their
 * entries removed in the commits that closed them, and `docs/queue.md` went on
 * listing every one of them as waiting. A session that believed the file —
 * which is the whole point of the file — would have done them a second time.
 *
 * The road is a rebase resolving the file in the lane's favour, and nothing
 * fails when it happens: the format is still valid, the tests still pass, and
 * the only sign is a queue that has grown. So the three snapshots are what
 * tell the three cases apart, and this is where each of them is held.
 */

const entry = (title: string) => `## ${title}\n\n- **Found:** 2026-09-05, lane\n\nWhat to do.\n`;
const file = (...names: string[]) => `# Queue\n\nPreamble.\n\n${names.map(entry).join("\n")}`;

describe("titles", () => {
  it("reads one per `##` heading", () => {
    expect(titles(file("first", "second"))).toEqual(["first", "second"]);
  });

  it("is not confused by a `###` or by a hash inside a line", () => {
    expect(titles("## real\ntext ## not a heading\n### deeper\n")).toEqual(["real"]);
  });
});

describe("what a replay puts back", () => {
  it("names an entry the trunk removed and the lane still has", () => {
    const base = file("done", "waiting");
    const trunk = file("waiting");
    const landed = file("done", "waiting");
    expect(resurrected(base, trunk, landed)).toEqual(["done"]);
  });

  it("says nothing when the replay honoured the removal", () => {
    expect(resurrected(file("done", "waiting"), file("waiting"), file("waiting"))).toEqual([]);
  });

  /**
   * The two ordinary halves, and the reason `base` is read at all: without it
   * every entry a lane *files* would look like one it put back.
   */
  it("says nothing about an entry the lane filed", () => {
    const base = file("waiting");
    expect(resurrected(base, file("waiting"), file("waiting", "found today"))).toEqual([]);
  });

  it("says nothing about an entry the lane itself removed", () => {
    expect(resurrected(file("a", "b"), file("a", "b"), file("a"))).toEqual([]);
  });

  /** A lane that removed one entry while its replay put back another is the
   * shape that actually happened, and both halves have to be read. */
  it("names only what came back, in a landing that also finished something", () => {
    const base = file("done", "mine", "other");
    const trunk = file("mine", "other");
    const landed = file("done", "other");
    expect(resurrected(base, trunk, landed)).toEqual(["done"]);
  });

  it("names every one of them, in file order", () => {
    const base = file("a", "b", "c");
    expect(resurrected(base, file("b"), base)).toEqual(["a", "c"]);
  });
});

describe("what a refused landing says", () => {
  const lines = refusal("main", [{ file: "docs/queue.md", titles: ["done", "also done"] }]);

  it("says the trunk did not move, and names every entry", () => {
    expect(lines[0]).toContain("main was not moved");
    expect(lines.join("\n")).toContain("docs/queue.md: done");
    expect(lines.join("\n")).toContain("docs/queue.md: also done");
  });

  it("says what to do about it, rather than only that it happened", () => {
    expect(lines.at(-1)).toContain("take those out of your copy");
  });
});
