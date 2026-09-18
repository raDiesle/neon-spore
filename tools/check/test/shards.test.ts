import { describe, expect, it } from "bun:test";
import {
  binCount,
  draws,
  KNOWN_SECONDS,
  MAX_FILES_PER_SHARD,
  partition,
  pool,
  selected,
  type Weighed,
  weigh,
} from "../shards.js";

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

/**
 * **How many bins, which is not how many processes.**
 *
 * The two were one number until 15 September 2026, and a four-core machine
 * therefore ran two `bun test` processes of seventy-five files each. One of
 * them held 7.4 GB of anonymous RSS by the end and was killed by the memory
 * cgroup — `exit 137`, no report, and a shard whose whole result went with it,
 * reading as `0 tests, 0 failed` in red. A bin is capped by count now, and the
 * pool below is what keeps the machine from running all of them at once.
 *
 * The cap was 40 and is 10 since 18 September 2026, when the same shape came
 * back on the owner's own machine rather than the web image: two shards of
 * forty render tests at 10.7 GB and 11.5 GB resident. Forty had bounded the
 * files and not the bytes. What keeps *several checks* from running all of
 * their shards at once is a third figure and a different file —
 * `tools/check/slots.ts`, whose own tests are beside these.
 */
describe("how many bins the suite is dealt into", () => {
  it("never fills one past the cap, however few processes there are", () => {
    for (const files of [1, 40, 41, 153, 384, 1000]) {
      const bins = binCount(files, 2);
      expect(Math.ceil(files / bins)).toBeLessThanOrEqual(MAX_FILES_PER_SHARD);
    }
  });

  it("is the process count when that is the larger, so a big machine keeps its eight", () => {
    expect(binCount(80, 8)).toBe(8);
    expect(binCount(0, 8)).toBe(8);
  });

  it("is the cap when that is the larger, so a small machine gets small bins", () => {
    // The four-core web image: two processes, and the suite as it stands. The
    // figures moved when the cap went from 40 files to 10 on 18 September
    // 2026 — 384 files is 39 bins at ten apiece rather than 10 at forty, and
    // the point of the change is that it is a great many small processes.
    expect(binCount(384, 2)).toBe(39);
    expect(binCount(153, 2)).toBe(16);
  });

  it("deals a suite of very unequal files into bins no bigger than the cap", () => {
    // One heavy file per ten light ones, which is the shape that ran a bin to
    // forty-six when only the weight was watched: the cap is the count.
    const files = Array.from({ length: 457 }, (_, i) => w(`f${i}`, i % 10 === 0 ? 30 : 1));
    const bins = partition(files, binCount(files.length, 2), MAX_FILES_PER_SHARD);
    expect(bins.flat()).toHaveLength(457);
    for (const bin of bins) expect(bin.length).toBeLessThanOrEqual(MAX_FILES_PER_SHARD);
  });

  it("still deals every file when the caller asked for fewer bins than the cap needs", () => {
    // `partition` is not `binCount`'s to police: a caller naming both itself
    // gets the whole deal rather than half of one.
    const files = Array.from({ length: 30 }, (_, i) => w(`f${i}`, 1));
    expect(partition(files, 2, 5).flat()).toHaveLength(30);
  });
});

/**
 * The pool is what the deal's own width used to be. It has to hold two things
 * the `bins.map(async …)` it replaces held for free: never more than `width`
 * in flight, and the answers in the bins' own order rather than in the order
 * they finished.
 */
describe("running the bins a few at a time", () => {
  it("never has more than the width in flight, and runs every one", async () => {
    let now = 0;
    let most = 0;
    const out = await pool(10, 3, async (i) => {
      most = Math.max(most, ++now);
      await Bun.sleep(1);
      now--;
      return i * 2;
    });
    expect(most).toBe(3);
    expect(out).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
  });

  it("answers in the bins' order, not in the order they came back", async () => {
    const out = await pool(4, 4, async (i) => {
      await Bun.sleep(4 - i);
      return i;
    });
    expect(out).toEqual([0, 1, 2, 3]);
  });

  it("starts nothing when there is nothing to run", async () => {
    expect(await pool(0, 4, async () => 1)).toEqual([]);
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
