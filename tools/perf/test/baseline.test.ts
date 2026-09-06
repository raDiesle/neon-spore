import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { arrivalsOf } from "../arrivals.js";
import baseline from "../baseline.json" with { type: "json" };
import { FRAME_MS, medianMs, type Run, verdictFor, type WaveCost } from "../compare.js";
import { waveName } from "../measure.js";

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
    }
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
            .map((s) => `bun run perf --wave ${s.slice(s.indexOf(" ") + 1)}`)
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
