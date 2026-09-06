import { describe, expect, it } from "bun:test";
import { arrivalsOf } from "../arrivals.js";
import {
  budgetPct,
  compareRuns,
  FRAME_MS,
  mergeInto,
  type Run,
  shapeOf,
  verdictFor,
  type WaveCost,
} from "../compare.js";
import { comparable, DRIFT_MIN_WAVES, driftIsMeasurable, NOISE_PCT } from "../noise.js";

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
    expect(shape.get("#2")).toBeCloseTo(1, 5);
    expect(shape.get("#3")).toBeCloseTo(2, 5);
  });
});

describe("what a wave sends", () => {
  it("changes its digest when an entry does, and holds still when nothing does", () => {
    expect(arrivalsOf(0)).toBe(arrivalsOf(0));
    expect(arrivalsOf(0)).not.toBe(arrivalsOf(1));
    // The count is readable on its own, ahead of the colon, so a diff of the
    // baseline says how many bodies a row was measuring without running anything.
    expect(arrivalsOf(0)).toMatch(/^\d+:[0-9a-f]+$/);
  });

  it("answers for a wave the game does not have rather than throwing", () => {
    expect(arrivalsOf(9_999)).toBe("0:0");
  });
});

/**
 * The ordinary run is a narrow one — a lane that adds a creature measures the
 * waves that creature appears in and nothing else — and that breaks the one
 * defence the comparison rests on. Each wave is read as a share of its own run's
 * median, so a run of one wave divides the change out by itself and reports
 * `same` however far the wave moved. These are the two halves of not doing that.
 */
describe("a run of only the waves a change touched", () => {
  const full = [1, 2, 3, 4, 5, 6, 7].map((w) => [w, w] as [number, number]);

  it("compares a subset against the same subset of the baseline, not the whole game", () => {
    // The baseline's median over all seven is 4; over waves 5-7 alone it is 6.
    // Reading a three-wave run against the wrong one would call every wave in
    // it half the size it was.
    const before = run(full);
    const after = run([
      [5, 5],
      [6, 6],
      [7, 7],
      [1, 1],
      [2, 2],
    ]);
    for (const d of compareRuns(before, after)) {
      expect(d.verdict, `${d.name} moved when nothing about it did`).toBe("same");
    }
  });

  it("says when a run is too small for its median to carry the machine", () => {
    // The figures a narrow run takes are real; what it cannot earn is a
    // verdict, because its median is one of the waves it measured.
    const enough = Array.from({ length: DRIFT_MIN_WAVES }, (_, i) => [i + 1, i + 1]) as [
      number,
      number,
    ][];
    expect(driftIsMeasurable(run(enough))).toBe(true);
    expect(driftIsMeasurable(run(enough.slice(1)))).toBe(false);
    expect(driftIsMeasurable(run([[3, 9]]))).toBe(false);
  });

  it("still carries the milliseconds of a run it cannot give a verdict on", () => {
    const [only] = compareRuns(run(full), run([[3, 9]]));
    expect(only?.before).toBe(3);
    expect(only?.after).toBe(9);
  });

  it("still calls a wave the baseline never saw new, however narrow the run", () => {
    const [only] = compareRuns(run(full), run([[99, 4]]));
    expect(only?.verdict).toBe("new");
  });
});

/**
 * One re-measured row put back into a baseline of forty-six others.
 *
 * `baseline.test.ts` names the waves whose arrivals have changed and asks for
 * *those* to be re-measured. That advice used to be untakeable — `--save`
 * refused a narrow run — so the only way to fix one row was a sweep that
 * re-baselined every other row off whatever the machine was doing that
 * afternoon.
 */
describe("merging one wave back into a baseline", () => {
  const full = [1, 2, 3, 4, 5, 6, 7].map((w) => [w, w] as [number, number]);

  it("replaces only the waves it was asked for, and keeps the count", () => {
    const merged = mergeInto(run(full), run(full), [3]);
    expect(merged?.waves).toHaveLength(7);
    expect(merged?.waves.find((w) => w.wave === 3)?.mergedFrom).toBeDefined();
    expect(merged?.waves.find((w) => w.wave === 4)?.mergedFrom).toBeUndefined();
  });

  it("leaves a wave the fresh run never measured exactly as it was", () => {
    const merged = mergeInto(run(full), run(full.slice(0, 5)), [3, 7]);
    expect(merged?.waves.find((w) => w.wave === 7)?.typical).toBe(7);
    expect(merged?.waves.find((w) => w.wave === 7)?.mergedFrom).toBeUndefined();
  });

  /**
   * The whole point, and the thing a first attempt at this got wrong. The
   * re-measured row comes off a run of five reference waves; the rest of the
   * file came off a sweep of forty-seven. Left in its own run's milliseconds it
   * is read against a median of a different population, and the next full sweep
   * calls the wave a regression nobody caused. The untouched waves say by how
   * much the machine differed, and the row is converted before it goes in.
   */
  it("puts the row on the baseline's footing, so an unchanged wave stays unchanged", () => {
    const before = run(full);
    // The same game on a machine three times slower, wave 3 included.
    const slowDay = run(full.map(([w, ms]) => [w, ms * 3] as [number, number]));
    const merged = mergeInto(before, slowDay, [3]);
    const row = merged?.waves.find((w) => w.wave === 3);
    expect(row?.typical).toBeCloseTo(3, 5);
    expect(row?.mergedFrom?.scale).toBeCloseTo(1 / 3, 2);
    // And the stitched file still reads as the game it was.
    for (const d of compareRuns(merged as Run, run(full))) {
      expect(d.verdict, `${d.name} moved when nothing about it did`).toBe("same");
    }
  });

  it("carries a genuine change through the scaling rather than flattening it", () => {
    // Same slow machine, but wave 3 really is twice the wave it was.
    const slowDay = run(
      full.map(([w, ms]) => [w, (w === 3 ? ms * 2 : ms) * 3] as [number, number]),
    );
    const merged = mergeInto(run(full), slowDay, [3]);
    expect(merged?.waves.find((w) => w.wave === 3)?.typical).toBeCloseTo(6, 5);
  });

  it("refuses a merge it has no untouched wave to take a scale off", () => {
    expect(mergeInto(run(full), run([[3, 9]]), [3])).toBeNull();
  });

  /**
   * The failure the id is for, played back. Inserting THE CUT at wave 48 pushed
   * THE MAGNET, THE JAM and THE TWITCH each up by one, and a narrow `--save`
   * for THE JAM afterwards wrote it into row 50 while the copy of it still
   * sitting at row 49 stayed put: fifty-one rows, one name twice, and no row at
   * all for THE MAGNET. Matched on the id there is one THE JAM and it moves.
   */
  it("follows a wave that was pushed up a number rather than duplicating it", () => {
    const named = (rows: [string, number, number][]): Run =>
      run(
        rows.map(([, wave, ms]) => [wave, ms] as [number, number]),
        {},
      );
    const withIds = (r: Run, ids: string[]): Run => ({
      ...r,
      waves: r.waves.map((w, i) => ({ ...w, id: ids[i] as string, name: ids[i] as string })),
    });
    // Yesterday: three waves at 1, 2, 3.
    const before = withIds(
      named([
        ["a", 1, 3],
        ["b", 2, 3],
        ["c", 3, 3],
      ]),
      ["a", "b", "c"],
    );
    // Today a wave was inserted ahead of them, so every number is one higher.
    const today = withIds(
      named([
        ["a", 2, 3],
        ["b", 3, 3],
        ["c", 4, 3],
      ]),
      ["a", "b", "c"],
    );

    const merged = mergeInto(before, today, [3]);
    expect(merged?.waves).toHaveLength(3);
    expect(merged?.waves.filter((w) => w.id === "b")).toHaveLength(1);
    expect(merged?.waves.find((w) => w.id === "b")?.wave).toBe(3);
    expect(merged?.waves.find((w) => w.id === "b")?.mergedFrom).toBeDefined();
    // And the two nobody measured are untouched, at the numbers they had.
    expect(merged?.waves.find((w) => w.id === "a")?.mergedFrom).toBeUndefined();
    expect(merged?.waves.find((w) => w.id === "c")?.mergedFrom).toBeUndefined();
  });

  it("says which afternoon and which commit a stitched row is really from", () => {
    const fresh = run(full, { measuredAt: "2026-09-09", commit: "a".repeat(40) });
    const from = mergeInto(run(full), fresh, [3])?.waves.find((w) => w.wave === 3)?.mergedFrom;
    expect(from?.measuredAt).toBe("2026-09-09");
    expect(from?.commit).toBe("a".repeat(40));
  });
});
