import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import baseline from "../baseline.json" with { type: "json" };
import {
  budgetPct,
  comparable,
  compareRuns,
  FRAME_MS,
  medianMs,
  NOISE_PCT,
  type Run,
  shapeOf,
  verdictFor,
  type WaveCost,
} from "../compare.js";
import { waveName } from "../measure.js";

/**
 * The half of `bun run perf` that has no browser in it: what a run is, and what
 * two of them say side by side. The measuring half cannot be unit-tested — it
 * is Chrome — so everything that can be decided without one is decided here.
 *
 * The baseline is checked as data rather than taken on trust: it is the number
 * the next session compares against, and a baseline that has gone stale against
 * the wave list would compare today's game to a game that no longer exists.
 */

function run(waves: [number, number][], over: Partial<Run> = {}): Run {
  return {
    measuredAt: "2026-09-03",
    commit: "0".repeat(40),
    throttle: 4,
    viewport: { width: 390, height: 844, dpr: 2 },
    calibration: 40_000,
    waves: waves.map(([wave, ms]) => ({
      wave,
      name: `WAVE ${wave}`,
      bodies: 1,
      // A synthetic run whose three statistics agree, so a test that means to
      // move a wave's cost moves all of them together.
      typical: ms,
      mean: ms,
      p90: ms * 1.2,
    })),
    ...over,
  };
}

describe("a wave's verdict", () => {
  it("calls a quarter of a frame fine and a full frame over", () => {
    expect(verdictFor(4)).toBe("fine");
    expect(verdictFor(FRAME_MS)).toBe("over");
    expect(verdictFor(FRAME_MS * 2)).toBe("over");
  });

  it("calls three quarters of a frame tight, because a warm phone is slower", () => {
    expect(verdictFor(FRAME_MS * 0.74)).toBe("fine");
    expect(verdictFor(FRAME_MS * 0.75)).toBe("tight");
    expect(verdictFor(FRAME_MS * 0.99)).toBe("tight");
  });

  it("reads a cost as a share of one 60 Hz frame", () => {
    expect(budgetPct(FRAME_MS)).toBeCloseTo(100, 5);
    expect(budgetPct(FRAME_MS / 2)).toBeCloseTo(50, 5);
  });
});

describe("two runs side by side", () => {
  it("ignores a change inside the noise band and reports one outside it", () => {
    const before = run([
      [1, 4],
      [2, 4],
      [3, 4],
    ]);
    const after = run([
      [1, 4 * (1 + (NOISE_PCT - 1) / 100)],
      [2, 8],
      [3, 2],
    ]);
    const deltas = new Map(compareRuns(before, after).map((d) => [d.wave, d]));
    expect(deltas.get(1)?.verdict).toBe("same");
    expect(deltas.get(2)?.verdict).toBe("worse");
    expect(deltas.get(3)?.verdict).toBe("better");
  });

  it("puts the worst regression first, which is what a reader needs", () => {
    const before = run([
      [1, 4],
      [2, 4],
      [3, 4],
    ]);
    const after = run([
      [1, 4],
      [2, 4],
      [3, 12],
    ]);
    expect(compareRuns(before, after)[0]?.wave).toBe(3);
  });

  /**
   * The reason the verdict is taken on shares at all. Two runs of the same
   * commit, minutes apart on a machine that got busier, came back 15% to 41%
   * apart on every wave — read in milliseconds the whole game had improved by a
   * third, which is a fact about the desk and not about the game.
   */
  it("sees through a whole run that moved, and still catches the one wave that did not", () => {
    const before = run([
      [1, 4],
      [2, 4],
      [3, 4],
      [4, 4],
    ]);
    // Everything a third cheaper — except wave 4, which held its old cost and
    // is therefore genuinely dearer relative to the rest of the game.
    const after = run([
      [1, 2.7],
      [2, 2.7],
      [3, 2.7],
      [4, 4],
    ]);
    const deltas = new Map(compareRuns(before, after).map((d) => [d.wave, d]));
    expect(deltas.get(1)?.verdict).toBe("same");
    expect(deltas.get(2)?.verdict).toBe("same");
    expect(deltas.get(4)?.verdict).toBe("worse");
    // And the milliseconds are still carried through for a reader to see.
    expect(deltas.get(4)?.before).toBe(4);
    expect(deltas.get(4)?.after).toBe(4);
  });

  it("calls every wave new against a baseline written before `typical` existed", () => {
    // The shape this guards was a silent wrong answer: an older baseline has no
    // `typical`, its median comes out NaN, every comparison against NaN is false,
    // and the run reported that all 38 waves were unchanged.
    const before = run([
      [1, 4],
      [2, 4],
    ]);
    for (const w of before.waves) delete (w as Partial<WaveCost>).typical;
    const deltas = compareRuns(
      before,
      run([
        [1, 4],
        [2, 99],
      ]),
    );
    expect(deltas.map((d) => d.verdict)).toEqual(["new", "new"]);
  });

  it("calls a wave the baseline never saw new rather than a regression", () => {
    const deltas = compareRuns(run([[1, 4]]), run([[1, 4]].concat([[2, 9]]) as [number, number][]));
    const fresh = deltas.find((d) => d.wave === 2);
    expect(fresh?.verdict).toBe("new");
    expect(fresh?.after).toBe(9);
  });

  it("refuses to compare milliseconds across throttles, sizes or machines", () => {
    const before = run([[1, 4]]);
    expect(comparable(before, run([[1, 4]]))).toBe(true);
    expect(comparable(before, run([[1, 4]], { throttle: 6 }))).toBe(false);
    expect(
      comparable(before, run([[1, 4]], { viewport: { width: 390, height: 844, dpr: 3 } })),
    ).toBe(false);
    // A machine half the speed of the one the baseline was taken on.
    expect(comparable(before, run([[1, 4]], { calibration: 20_000 }))).toBe(false);
    // And one a few percent apart, which is the same machine on a busier day.
    expect(comparable(before, run([[1, 4]], { calibration: 41_000 }))).toBe(true);
  });

  it("has a machine-independent fallback: each wave against its own median", () => {
    const shape = shapeOf(
      run([
        [1, 2],
        [2, 4],
        [3, 8],
      ]),
    );
    expect(shape.get(2)).toBeCloseTo(1, 5);
    expect(shape.get(3)).toBeCloseTo(2, 5);
  });
});

describe("the checked-in baseline", () => {
  const saved = baseline as Run;

  it("covers every wave the game ships, by the name the game gives it", () => {
    expect(saved.waves).toHaveLength(WAVES.length);
    for (const [index, cost] of saved.waves.entries()) {
      expect(cost.wave, `wave ${index + 1} is in play order`).toBe(index + 1);
      expect(cost.name, `wave ${index + 1}'s name`).toBe(waveName(index));
    }
  });

  it("was taken at the settings the tool defaults to, or it cannot be compared", () => {
    expect(saved.throttle).toBe(4);
    expect(saved.viewport).toEqual({ width: 390, height: 844, dpr: 2 });
    expect(saved.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(saved.measuredAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("is a game that fits in a frame — no wave over budget when it was taken", () => {
    const over = saved.waves.filter((w: WaveCost) => verdictFor(w.p90) !== "fine");
    expect(over.map((w: WaveCost) => `${w.name} ${w.p90}ms`)).toEqual([]);
    expect(medianMs(saved)).toBeLessThan(FRAME_MS / 2);
  });
});
