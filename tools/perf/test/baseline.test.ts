import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { arrivalsOf } from "../arrivals.js";
import baseline from "../baseline.json" with { type: "json" };
import { FRAME_MS, medianMs, type Run, verdictFor, type WaveCost } from "../compare.js";
import { waveId, waveName } from "../measure.js";
import { renumber } from "../renumber.js";

/**
 * `tools/perf/baseline.json` read as data rather than taken on trust.
 *
 * It is the number every later run is compared against, so a baseline that has
 * gone stale against the game compares today to something that no longer
 * exists — and does it silently, which is the only way this file can hurt
 * anybody. Its own test file beside `compare.test.ts`, which is about the
 * arithmetic and has no opinion about which run happens to be checked in.
 */
describe("the checked-in baseline", () => {
  const saved = baseline as Run;

  it("covers every wave the game ships, by the name the game gives it", () => {
    expect(saved.waves).toHaveLength(WAVES.length);
    for (const [index, cost] of saved.waves.entries()) {
      expect(cost.wave, `wave ${index + 1} is in play order`).toBe(index + 1);
      expect(cost.name, `wave ${index + 1}'s name`).toBe(waveName(index));
      expect(cost.id, `wave ${index + 1}'s id`).toBe(waveId(index));
    }
  });

  /**
   * One row per wave, and the check that would have named the problem instead
   * of leaving it to be discovered as a mismatched name at an index.
   *
   * A narrow `--save` used to match a row by the number it was writing to, so
   * inserting THE CUT at wave 48 and re-measuring THE JAM afterwards wrote THE
   * JAM into row 50 and left the copy of it still sitting at row 49. The file
   * held fifty-one rows with one name twice and no row at all for THE MAGNET,
   * and the failure that came back was "wave 49's name" — true, and no help.
   * `mergeInto` matches on `id` now and cannot leave a duplicate; this is the
   * assertion that says so about the file rather than about the function.
   */
  it("has one row per wave, with no name or id appearing twice", () => {
    const ids = saved.waves.map((w: WaveCost) => w.id ?? "");
    const names = saved.waves.map((w: WaveCost) => w.name);
    expect(new Set(ids).size, `${ids.length} rows, ${new Set(ids).size} ids`).toBe(ids.length);
    expect(new Set(names).size, `${names.length} rows, ${new Set(names).size} names`).toBe(
      names.length,
    );
  });

  /**
   * The name catches a wave renamed or one inserted ahead of it. Nothing caught
   * a wave whose *arrivals* changed under a name that still matched: THE FENCE
   * gained two figures on 6 September 2026 and kept the timings that went with
   * the old two, so the next run compared today's game against a wave that no
   * longer existed.
   *
   * The failure names the waves and asks for *those* to be re-measured rather
   * than the whole baseline. Forty-six good rows are worth keeping, and a check
   * that makes an editor sweep the game over one changed wave is a check
   * somebody deletes.
   *
   * The command it prints is one that works. It used to be advice nobody could
   * take: `--save` refused a narrow run, so the only way to fix one stale row
   * was the three-minute sweep this test exists to avoid asking for. A narrow
   * `--save` now merges its rows in instead (`compare.ts`'s `mergeInto`).
   */
  it("measured the arrivals each wave sends today, wave by wave", () => {
    const stale = saved.waves
      .filter((cost, index) => cost.arrivals !== arrivalsOf(index))
      .map((cost) => `${cost.wave} ${cost.name}`);
    // A baseline written before the field existed has no row that can answer,
    // and forty-seven re-measure lines is not advice. That one is a sweep.
    const how =
      stale.length === saved.waves.length
        ? "this baseline predates the check — take a full sweep: bun run perf --save"
        : `re-measure them: ${stale
            .map((s) => `bun run perf --wave "${s.slice(s.indexOf(" ") + 1)}" --save`)
            .join("; ")}`;
    expect(stale, `these waves send something else now — ${how}`).toEqual([]);
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

/**
 * **A merge leaves the file in play order**, which is the assertion that would
 * have caught the thing `renumber` was written for.
 *
 * `mergeInto` matches a row on its id and renumbers nothing, so a merged row
 * carried today's `wave` and every row beside it kept whatever number the
 * baseline was written with. It converged by itself whenever the waves that
 * moved were the waves being re-measured — and not for a wave that merely
 * *shifted*: identical arrivals, nothing asking for it, and the first check
 * above failing on play order with no advice but a three-minute sweep.
 */
describe("renumbering a merged baseline", () => {
  const saved = baseline as Run;

  it("puts every row back on the number and the name the game gives it today", () => {
    // Yesterday's file: every row one number out and named for its neighbour,
    // which is exactly the shape an inserted wave leaves behind.
    const stale = saved.waves.map((w: WaveCost, i: number) => ({
      ...w,
      wave: w.wave + 1,
      name: waveName((i + 1) % saved.waves.length),
    }));
    const { run, dropped } = renumber({ ...saved, waves: stale });
    expect(dropped).toEqual([]);
    for (const [index, cost] of run.waves.entries()) {
      expect(cost.wave, `wave ${index + 1} is in play order`).toBe(index + 1);
      expect(cost.name, `wave ${index + 1}'s name`).toBe(waveName(index));
      expect(cost.id, `wave ${index + 1}'s id`).toBe(waveId(index));
    }
  });

  it("sorts the rows, so one that moved does not sit where it used to", () => {
    const shuffled = [...saved.waves].reverse();
    const { run } = renumber({ ...saved, waves: shuffled });
    expect(run.waves.map((w: WaveCost) => w.wave)).toEqual(
      saved.waves.map((_: WaveCost, i: number) => i + 1),
    );
  });

  it("drops a row for a wave the game no longer has, and says which", () => {
    const gone = { ...(saved.waves[0] as WaveCost), id: "no-such-wave", name: "THE DELETED" };
    const { run, dropped } = renumber({ ...saved, waves: [...saved.waves, gone] });
    expect(dropped).toEqual([`${gone.wave} THE DELETED`]);
    expect(run.waves).toHaveLength(saved.waves.length);
  });

  it("leaves a row written before ids existed exactly where it is", () => {
    const old = { ...(saved.waves[0] as WaveCost), id: undefined, wave: 999 };
    const { run, dropped } = renumber({ ...saved, waves: [...saved.waves.slice(1), old] });
    expect(dropped).toEqual([]);
    expect(run.waves.at(-1)?.wave).toBe(999);
  });
});
