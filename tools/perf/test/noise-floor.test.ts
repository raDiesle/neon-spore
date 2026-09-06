import { describe, expect, it } from "bun:test";
import { compareRuns, type Run, type WaveCost } from "../compare.js";
import { JITTER_FLOOR_MUL, JITTER_UNUSABLE, NOISE_PCT, noiseFloorFor } from "../noise.js";
import quiet from "./two-quiet-runs.json" with { type: "json" };

/**
 * WHAT THE TOOL MUST NOT SAY.
 *
 * A verdict naming a wave the lane never went near is the failure this whole
 * comparison exists to prevent: a session that reads one learns to stop reading
 * them. `two-quiet-runs.json` is two full sweeps of the *same commit*, taken
 * back to back on an idle desk on 6 September 2026 — every difference in it is
 * the machine, and the right answer over all forty-seven waves is silence.
 *
 * Under the flat 20% floor this pair named waves nobody had touched, which is
 * what `JITTER_FLOOR_MUL` was measured to fix. The fixture is here so the number
 * cannot be lowered again without the evidence coming back.
 */

/** The fixture carries what a verdict is taken on and nothing else. */
function fixture(side: { measuredAt: string; calibration: number; waves: unknown[] }): Run {
  const waves = side.waves.map((row) => {
    const [wave, name, typical, jitter] = row as [number, string, number, number];
    return { wave, name, bodies: 1, typical, mean: typical, p90: typical, jitter } as WaveCost;
  });
  return {
    measuredAt: side.measuredAt,
    commit: "0".repeat(40),
    throttle: 4,
    viewport: { width: 390, height: 844, dpr: 2 },
    calibration: side.calibration,
    waves,
  };
}

const first = fixture(quiet.first);
const second = fixture(quiet.second);

describe("the floor one wave has to clear", () => {
  it("is the flat one for a steady wave, and a row with no jitter is steady", () => {
    expect(noiseFloorFor(undefined)).toBe(NOISE_PCT);
    expect(noiseFloorFor(0)).toBe(NOISE_PCT);
    expect(noiseFloorFor(0.05)).toBe(NOISE_PCT);
  });

  it("rises with how unsteady the wave's own sample was", () => {
    expect(noiseFloorFor(0.3)).toBeCloseTo(30 * JITTER_FLOOR_MUL, 5);
    expect(noiseFloorFor(0.3)).toBeGreaterThan(NOISE_PCT);
  });
});

describe("two sweeps of one commit, taken back to back", () => {
  it("names no wave at all — every difference in them is the desk", () => {
    const said = compareRuns(first, second)
      .filter((d) => d.verdict === "worse" || d.verdict === "better")
      .map((d) => `${d.name} ${d.changePct.toFixed(0)}% over a floor of ${d.floorPct.toFixed(0)}%`);
    expect(said).toEqual([]);
    // And the other way round: which run is called the baseline changes nothing.
    expect(
      compareRuns(second, first).filter((d) => d.verdict === "worse" || d.verdict === "better"),
    ).toEqual([]);
  });

  it("still hears a real regression on a wave that measures steadily", () => {
    // THE MIRROR's own sample is one of the tightest in the game, so it keeps
    // the flat floor and a quarter more work on it is heard — which is the
    // sensitivity the tool would have lost to a flat floor raised to silence
    // the unsteady waves. On an unsteady wave the floor is genuinely higher,
    // and that is the truth about the measurement rather than a fault in it.
    const at = second.waves.findIndex((w) => w.name === "THE MIRROR");
    const worsened = {
      ...second,
      waves: second.waves.map((w, i) => (i === at ? { ...w, typical: w.typical * 1.25 } : w)),
    };
    const said = compareRuns(first, worsened).filter((d) => d.verdict === "worse");
    expect(said.map((d) => d.name)).toEqual(["THE MIRROR"]);
  });

  it("says a wave was too unsteady to compare rather than calling it unchanged", () => {
    // PINBALL's thirty batches spread over sixteen times their own median. A
    // floor honouring that would be 2400%, so the wave gets no verdict and says
    // so — `same` would read as a fact about the game.
    const noisy = compareRuns(first, second).filter((d) => d.verdict === "noisy");
    expect(noisy.length).toBeGreaterThan(0);
    for (const d of noisy) {
      const jitter = Math.max(
        first.waves.find((w) => w.wave === d.wave)?.jitter ?? 0,
        second.waves.find((w) => w.wave === d.wave)?.jitter ?? 0,
      );
      expect(jitter).toBeGreaterThan(JITTER_UNUSABLE);
    }
    // Its milliseconds are still carried, because that is all a reader can use.
    const one = noisy[0];
    expect(one?.before).toBeGreaterThan(0);
    expect(one?.after).toBeGreaterThan(0);
  });
});
