import { describe, expect, it } from "bun:test";
import { parseJunit } from "../profile-report.js";
import {
  draws,
  firstFailure,
  KNOWN_SECONDS,
  mergeJunit,
  partition,
  selected,
  tallyOf,
  type Weighed,
  weigh,
} from "../shards.js";

/** Two reports a shard would write, in the shape bun writes them on Windows. */
const SHARD_A = String.raw`<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="bun test" tests="3" assertions="5" failures="1" skipped="0" time="9.5">
  <testsuite name="packages\render\test\slow.test.ts" file="packages\render\test\slow.test.ts" tests="2" assertions="4" failures="1" skipped="0" time="9.25" hostname="">
    <testcase name="draws it" classname="" time="7.0" file="packages\render\test\slow.test.ts" line="11" assertions="2" />
  </testsuite>
  <testsuite name="tools/check/test/quick.test.ts" file="tools/check/test/quick.test.ts" tests="1" assertions="1" failures="0" skipped="0" time="0.25" hostname="">
    <testcase name="is quick" classname="" time="0.25" file="tools/check/test/quick.test.ts" line="3" assertions="1" />
  </testsuite>
</testsuites>
`;
const SHARD_B = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="bun test" tests="4" assertions="6" failures="0" skipped="1" time="2.5">
  <testsuite name="packages/sim/test/rng.test.ts" file="packages/sim/test/rng.test.ts" tests="4" assertions="6" failures="0" skipped="1" time="2.5" hostname="">
    <testcase name="repeats" classname="" time="2.5" file="packages/sim/test/rng.test.ts" line="3" assertions="6" />
  </testsuite>
</testsuites>
`;

/**
 * A shard that went red, in the shape `bun test --reporter=junit` writes one:
 * the `<failure>` is a child of the `<testcase>` it belongs to, and a case
 * inside a `describe` carries that name as its `classname`.
 */
const SHARD_RED = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="bun test" tests="3" assertions="3" failures="2" skipped="0" time="0.5">
  <testsuite name="packages/sim/test/step.test.ts" file="packages/sim/test/step.test.ts" tests="3" assertions="3" failures="2" skipped="0" time="0.5" hostname="">
    <testsuite name="a group" file="packages/sim/test/step.test.ts" line="2" tests="3" assertions="3" failures="2" skipped="0" time="0.5" hostname="">
      <testcase name="passes" classname="a group" time="0.1" file="packages/sim/test/step.test.ts" line="3" assertions="1" />
      <testcase name="fails on purpose" classname="a group" time="0.2" file="packages/sim/test/step.test.ts" line="7" assertions="1">
        <failure type="AssertionError" message="expect(received).toBe(expected)">AssertionError</failure>
      </testcase>
      <testcase name="fails later too" classname="a group" time="0.2" file="packages/sim/test/step.test.ts" line="11" assertions="1">
        <failure type="AssertionError" message="expect(received).toBe(expected)">AssertionError</failure>
      </testcase>
    </testsuite>
  </testsuite>
</testsuites>
`;

/** The same, written at the top level, where a case has no `describe` over it. */
const SHARD_BARE = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="bun test" tests="1" assertions="1" failures="1" skipped="0" time="0.1">
  <testsuite name="tools/check/test/quick.test.ts" file="tools/check/test/quick.test.ts" tests="1" assertions="1" failures="1" skipped="0" time="0.1" hostname="">
    <testcase name="is quick" classname="is quick" time="0.1" file="tools/check/test/quick.test.ts" line="3" assertions="1">
      <failure type="AssertionError" message="expect(received).toBe(expected)">AssertionError</failure>
    </testcase>
  </testsuite>
</testsuites>
`;

const w = (file: string, weight: number): Weighed => ({ file, weight });

describe("dealing files into shards", () => {
  it("puts the heaviest file on the lightest shard, so the heaviest stands alone", () => {
    const bins = partition([w("a", 30), w("b", 5), w("c", 5), w("d", 4), w("e", 3)], 2);
    expect(bins[0]).toEqual(["a"]);
    expect(bins[1]).toEqual(["b", "c", "d", "e"]);
  });

  it("keeps each shard heaviest-first, so a slow file starts early", () => {
    const [bin] = partition([w("light", 1), w("heavy", 9), w("mid", 4)], 1);
    expect(bin).toEqual(["heavy", "mid", "light"]);
  });

  it("drops the shards that would have nothing to run", () => {
    expect(partition([w("a", 1), w("b", 1)], 8)).toHaveLength(2);
    expect(partition([], 8)).toEqual([]);
  });

  it("is the same deal every time, whatever order the files arrived in", () => {
    const files = [w("x", 2), w("y", 2), w("z", 2), w("q", 2)];
    expect(partition(files, 2)).toEqual(partition([...files].reverse(), 2));
  });

  it("weighs the three files the table knows by the table, and the rest by their bytes", () => {
    expect(weigh("tools/frames/test/opening.test.ts", 10).weight).toBe(
      KNOWN_SECONDS["tools/frames/test/opening.test.ts"]!,
    );
    const frame = weigh("packages/render/test/lure-frame.test.ts", 20000).weight;
    const plain = weigh("packages/sim/test/rng.test.ts", 20000).weight;
    expect(plain).toBe(1);
    expect(frame).toBeGreaterThan(plain * 4);
  });

  it("knows a file that draws from one that does not", () => {
    expect(draws("packages/render/test/lure-frame.test.ts")).toBe(true);
    expect(draws("tools/shape-sheet/test/drawn-size.test.ts")).toBe(true);
    expect(draws("packages/render/test/frame.test.ts")).toBe(false);
    expect(draws("packages/sim/test/rng.test.ts")).toBe(false);
  });
});

describe("a filter, as bun reads one", () => {
  it("is a substring of the path, and none at all means everything", () => {
    expect(selected("packages/sim/test/rng.test.ts", [])).toBe(true);
    expect(selected("packages/sim/test/rng.test.ts", ["packages/sim"])).toBe(true);
    expect(selected("packages/sim/test/rng.test.ts", ["render", "rng"])).toBe(true);
    expect(selected("packages/sim/test/rng.test.ts", ["render"])).toBe(false);
  });

  it("reads a Windows path the same as a forward-slashed one", () => {
    expect(selected("tools/check/test/shards.test.ts", [String.raw`tools\check`])).toBe(true);
  });
});

describe("merging the shards' reports", () => {
  const merged = mergeJunit([SHARD_A, SHARD_B, "", "not a report"]);

  it("sums the header, so the tally is the suite's", () => {
    expect(tallyOf(merged)).toEqual({ tests: 7, failures: 1, skipped: 1, seconds: 12 });
  });

  it("reads as one run to the profile, every file from every shard", () => {
    const profile = parseJunit(merged);
    expect(profile.files.map((f) => f.file)).toEqual([
      "packages/render/test/slow.test.ts",
      "packages/sim/test/rng.test.ts",
      "tools/check/test/quick.test.ts",
    ]);
    expect(profile.total).toBe(12);
    expect(profile.cases).toHaveLength(3);
  });

  it("reads nothing from a shard that never wrote a report", () => {
    expect(tallyOf("")).toEqual({ tests: 0, failures: 0, skipped: 0, seconds: 0 });
  });
});

/**
 * **What failed, under the counts.**
 *
 * A red run is read from the bottom, and the closing line used to say only how
 * many — the case's name was inside its shard's own block, hundreds of lines
 * up, while the block still on screen could easily be a *green* shard saying
 * `0 failed`. So the run prints the first failing case beside the counts, and
 * these are the four shapes it has to read out of a report.
 */
describe("the failing case a red run closes with", () => {
  it("names the case, its file and its line — not the first case in the file", () => {
    expect(firstFailure(SHARD_RED)).toEqual({
      file: "packages/sim/test/step.test.ts",
      line: 7,
      name: "a group > fails on purpose",
    });
  });

  it("says just the case where there is no describe over it", () => {
    expect(firstFailure(SHARD_BARE)?.name).toBe("is quick");
  });

  it("finds it across the merged report, wherever the red shard came in", () => {
    expect(firstFailure(mergeJunit([SHARD_B, SHARD_RED]))?.name).toBe("a group > fails on purpose");
    expect(firstFailure(mergeJunit([SHARD_RED, SHARD_B]))?.name).toBe("a group > fails on purpose");
  });

  it("has nothing to say about a green run, or about no report at all", () => {
    expect(firstFailure(SHARD_B)).toBeNull();
    expect(firstFailure("")).toBeNull();
  });
});
