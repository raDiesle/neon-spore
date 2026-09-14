import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { arrivalsOf } from "../arrivals.js";
import baseline from "../baseline.json" with { type: "json" };
import {
  compareRuns,
  FRAME_MS,
  medianMs,
  type Run,
  verdictFor,
  type WaveCost,
} from "../compare.js";
import { waveId, waveName } from "../measure.js";
import { renumber } from "../renumber.js";
import { isUnmeasured, keyOf, shapeOf } from "../shape.js";
import { fillUnmeasured, unmeasuredRow } from "../unmeasured.js";

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
  /** Which wave each row is about, by the one handle that survives an insert
   * and a rename (`shape.ts`'s `keyOf`). A row is matched on this rather than
   * on where it sits in the array, which is what lets the file be missing one. */
  const indexOf = new Map(WAVES.map((_, index) => [waveId(index), index]));
  const waveOf = (cost: WaveCost): number | undefined => indexOf.get(keyOf(cost));

  /**
   * **Every row is about a wave the game still ships, on today's number and
   * name — and the file may be missing one.**
   *
   * It used to require a row per wave, and that half was dropped on 14
   * September 2026 (the owner, on `docs/queue.md`'s question). The rule cost
   * more than it bought: a session that *adds* a wave adds a row the test
   * demands, filling it is a perf run, and a cloud session is told not to run
   * perf in any form — so a wave written from a phone had no way to a green
   * check at all. What the rule was really protecting is kept whole here: a
   * row that names a wave the game no longer has, or carries a number or a
   * name that has moved, is still a row comparing today against a game that no
   * longer exists, and still fails.
   *
   * A wave with no row is not silently passed over. `compareRuns` reads one it
   * has no `before` for as `new` — "here is this wave's first figure" — and the
   * next sweep writes it down. The test below says so rather than leaving it to
   * be believed.
   */
  it("is about waves the game still ships, on today's number and name", () => {
    for (const cost of saved.waves) {
      const index = waveOf(cost);
      expect(index, `${cost.wave} ${cost.name} is a wave the game still ships`).toBeDefined();
      if (index === undefined) continue;
      expect(cost.wave, `${cost.name}'s number`).toBe(index + 1);
      expect(cost.name, `wave ${index + 1}'s name`).toBe(waveName(index));
    }
  });

  it("is in play order, so a row that moved does not sit where it used to", () => {
    const numbers = saved.waves.map((w: WaveCost) => w.wave);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  /**
   * No row twice, and the check that would have named the problem instead
   * of leaving it to be discovered as a mismatched name at an index.
   *
   * This was "one row per wave" until 14 September 2026, and the half of it
   * that counted rows against waves is gone (the test above). What is left is
   * the half that caught the actual bug: the same wave written down twice.
   *
   * A narrow `--save` used to match a row by the number it was writing to, so
   * inserting THE CUT at wave 48 and re-measuring THE JAM afterwards wrote THE
   * JAM into row 50 and left the copy of it still sitting at row 49. The file
   * held fifty-one rows with one name twice and no row at all for THE MAGNET,
   * and the failure that came back was "wave 49's name" — true, and no help.
   * `mergeInto` matches on `id` now and cannot leave a duplicate; this is the
   * assertion that says so about the file rather than about the function.
   */
  it("writes no wave down twice, by name or by id", () => {
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
      // A row nobody measured has nothing to be stale about — the field says
      // what the wave sent *when this row was measured*, and no measurement
      // was taken (`unmeasured.ts`). The wave is found by id and not by the
      // row's place in the array, which is no longer its wave number: the file
      // may be missing a row for a wave nobody has weighed.
      .filter((cost: WaveCost) => {
        if (isUnmeasured(cost)) return false;
        const index = waveOf(cost);
        return index !== undefined && cost.arrivals !== arrivalsOf(index);
      })
      .map((cost: WaveCost) => `${cost.wave} ${cost.name}`);
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
    const over = saved.waves.filter(
      (w: WaveCost) => !isUnmeasured(w) && verdictFor(w.p90) !== "fine",
    );
    expect(over.map((w: WaveCost) => `${w.name} ${w.p90}ms`)).toEqual([]);
    expect(medianMs(saved)).toBeLessThan(FRAME_MS / 2);
  });
});

/**
 * The row a session writes to say a figure is owed out loud, and the promise it
 * makes: it covers the game and it changes no figure taken about any
 * other wave. The second half is the one worth a test — every verdict is a
 * wave's share of its run's median, so a zero counted into that median would
 * move the reading on every weighed wave in the file.
 *
 * **Nothing here fails on the shipped baseline carrying one**, and that is the
 * point rather than an omission: a row saying nobody has weighed this wave is
 * a true thing for the file to say (`unmeasured.ts`). What says the row is
 * still owed is the printed table, which prints UNMEASURED beside it on every
 * run until somebody takes the figure.
 */
describe("a row nobody has measured", () => {
  const saved = baseline as Run;

  it("gives every wave a row, which is what baseline:blank is asked for", () => {
    const short = { ...saved, waves: saved.waves.slice(0, -1) };
    const { run, added } = fillUnmeasured(short);
    expect(added).toHaveLength(1);
    expect(run.waves).toHaveLength(WAVES.length);
    for (const [index, cost] of run.waves.entries()) {
      expect(cost.wave, `wave ${index + 1} is in play order`).toBe(index + 1);
      expect(cost.id, `wave ${index + 1}'s id`).toBe(waveId(index));
    }
  });

  it("adds nothing to a baseline that already covers the game", () => {
    const { run, added, blanked } = fillUnmeasured(saved);
    expect(added).toEqual([]);
    expect(blanked).toEqual([]);
    expect(run.waves).toHaveLength(saved.waves.length);
  });

  it("blanks a measured row whose wave no longer sends what it was measured on", () => {
    // The row's figures describe a wave that no longer exists (the check
    // above), and a lane never owes the perf run that would replace them —
    // so the row says nobody has weighed this wave, and the next sweep does.
    const first = saved.waves.findIndex((w) => !isUnmeasured(w));
    const row = saved.waves[first] as WaveCost;
    const moved = saved.waves.map((w, i) => (i === first ? { ...w, arrivals: "elsewhere" } : w));
    const { run, added, blanked } = fillUnmeasured({ ...saved, waves: moved });
    expect(added).toEqual([]);
    expect(blanked).toEqual([`${row.wave} ${row.name}`]);
    expect(run.waves).toHaveLength(saved.waves.length);
    expect(isUnmeasured(run.waves[first] as WaveCost)).toBe(true);
    expect(run.waves[first]?.id).toBe(row.id);
  });

  it("does not move the median, and so moves nobody else's verdict", () => {
    const withOne = { ...saved, waves: [...saved.waves, unmeasuredRow(0)] };
    expect(medianMs(withOne)).toBe(medianMs(saved));
    expect(shapeOf(withOne)).toEqual(shapeOf(saved));
  });

  it("is compared as UNMEASURED rather than as a wave that got faster", () => {
    const one = saved.waves[0] as WaveCost;
    const blanked = { ...saved, waves: [unmeasuredRow(0), ...saved.waves.slice(1)] };
    const deltas = compareRuns(blanked, saved);
    const mine = deltas.find((d) => d.name === one.name);
    expect(mine?.verdict).toBe("unmeasured");
    // And every other wave still reads the same as it does against itself.
    const others = compareRuns(saved, saved).filter((d) => d.name !== one.name);
    for (const d of others) {
      expect(deltas.find((x) => x.name === d.name)?.verdict, d.name).toBe(d.verdict);
    }
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

/**
 * A WAVE THE BASELINE HAS NEVER SEEN, which since 14 September 2026 is a file
 * this check passes rather than one it rejects.
 *
 * The owner picked this over `bun run land` writing the rows itself
 * (`docs/queue.md`, the question a cloud session that adds a wave raised). The
 * case it unblocks: a wave written from a phone, where filling its row means
 * `bun run perf` and a cloud session is told not to run that in any form.
 *
 * The objection it had to answer is that a gap is quieter than a row saying
 * UNMEASURED out loud. These two tests are that answer — the gap is tolerated
 * by the check and still reported by the run, which is the same pair of
 * promises `unmeasured.ts`'s row makes.
 */
describe("a wave the baseline has no row for", () => {
  const saved = baseline as Run;
  // A *weighed* row, so what is being read is the absence itself. Dropping an
  // unmeasured one proves nothing: `compareRuns` answers "unmeasured" off the
  // row still present in the run being compared, before it ever looks for a
  // `before` — which is the shipped file's last row, THE LEAK's.
  const dropped = saved.waves.findIndex((w: WaveCost) => !isUnmeasured(w));
  const missing = saved.waves[dropped] as WaveCost;
  const short = { ...saved, waves: saved.waves.filter((_, i) => i !== dropped) };

  it("does not fail the check, so a lane that adds a wave can land", () => {
    const indexOf = new Map(WAVES.map((_, index) => [waveId(index), index]));
    for (const cost of short.waves) {
      const index = indexOf.get(keyOf(cost));
      expect(index, `${cost.name} is a wave the game still ships`).toBeDefined();
      expect(cost.wave).toBe((index ?? 0) + 1);
    }
    const numbers = short.waves.map((w: WaveCost) => w.wave);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  it("is reported as a wave with no figure yet, not passed over in silence", () => {
    const mine = compareRuns(short, saved).find((d) => d.name === missing.name);
    expect(mine?.verdict).toBe("new");
  });

  it("moves no verdict on a wave that was weighed", () => {
    const deltas = compareRuns(short, saved);
    for (const d of compareRuns(saved, saved)) {
      if (d.name === missing.name) continue;
      expect(deltas.find((x) => x.name === d.name)?.verdict, d.name).toBe(d.verdict);
    }
  });
});
