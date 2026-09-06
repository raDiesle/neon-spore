import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { waveName } from "../measure.js";
import { DRIFT_MIN_WAVES } from "../noise.js";
import { REFERENCE_WAVE_IDS, referenceWaves, wavesAsked, withReferences } from "../waves.js";

/**
 * Which waves a run covers. Pure, so it is held here rather than behind a
 * browser: everything else about a run needs a real Chrome, and this is the
 * half that decides what that Chrome is asked to do.
 */

describe("the waves a run was asked for", () => {
  it("is every wave when nothing was asked", () => {
    expect(wavesAsked([])).toHaveLength(WAVES.length);
  });

  it("takes the number the HUD prints, which is 1-based", () => {
    expect(wavesAsked(["1"])).toEqual([0]);
    expect(wavesAsked([String(WAVES.length)])).toEqual([WAVES.length - 1]);
  });

  it("takes the name the way a person would say it", () => {
    const name = waveName(0);
    expect(wavesAsked([name])).toEqual([0]);
    expect(wavesAsked([`  ${name.toLowerCase()}  `])).toEqual([0]);
  });

  it("keeps them in play order and never twice", () => {
    expect(wavesAsked(["3", "1", "3"])).toEqual([0, 2]);
  });

  it("refuses a wave that does not exist rather than measuring none", () => {
    // A mistyped name that quietly measured nothing would come back as a clean
    // run of zero waves, which reads exactly like a pass.
    expect(() => wavesAsked(["THE NOTHING"])).toThrow();
    expect(() => wavesAsked(["0"])).toThrow();
    expect(() => wavesAsked([String(WAVES.length + 1)])).toThrow();
  });
});

describe("the reference waves a narrow run carries", () => {
  it("all still exist, so a run can always reach the floor", () => {
    expect(referenceWaves()).toHaveLength(REFERENCE_WAVE_IDS.length);
  });

  it("is at least the floor, or a narrow run could not earn a verdict", () => {
    expect(REFERENCE_WAVE_IDS.length).toBeGreaterThanOrEqual(DRIFT_MIN_WAVES);
  });

  it("brings a one-wave run up to the floor, keeping the wave that was asked for", () => {
    const one = wavesAsked([waveName(WAVES.length - 1)]);
    const run = withReferences(one, DRIFT_MIN_WAVES);
    expect(run.length).toBeGreaterThanOrEqual(DRIFT_MIN_WAVES);
    expect(run).toContain(WAVES.length - 1);
    expect(run).toEqual([...run].sort((a, b) => a - b));
  });

  it("carries nothing extra once the run has enough of its own", () => {
    const enough = Array.from({ length: DRIFT_MIN_WAVES }, (_, i) => i);
    expect(withReferences(enough, DRIFT_MIN_WAVES)).toEqual(enough);
  });

  it("does not measure a wave twice when the one asked for is a reference", () => {
    const [first] = referenceWaves();
    const run = withReferences([first as number], DRIFT_MIN_WAVES);
    expect(new Set(run).size).toBe(run.length);
  });

  it("leaves out the one wave with no field, which no median should be built on", () => {
    // THE GAUGE's round draws neither hull nor field and costs a fifth of any
    // other wave; a median of five containing it sits where no real frame does.
    const names = referenceWaves().map((i) => waveName(i));
    expect(names).not.toContain("THE GAUGE");
  });
});
