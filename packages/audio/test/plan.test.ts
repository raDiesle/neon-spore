import { describe, expect, it } from "bun:test";
import { endOf, planSound } from "../src/plan.js";
import type { SoundDef } from "../src/types.js";

const one: SoundDef = {
  id: "test.one",
  family: "ui",
  blurb: "a layer",
  status: "spare",
  use: "the test",
  level: 0.5,
  layers: [{ source: "sine", freq: 440, gain: 0.4, attack: 0.01, hold: 0.02, release: 0.1 }],
};

describe("planSound", () => {
  it("multiplies the layer's gain by the sound's level", () => {
    const [v] = planSound(one).voices;
    expect(v?.gain).toBeCloseTo(0.2, 6);
  });

  it("scales gain and pitch with the play's options", () => {
    const [v] = planSound(one, { pitch: 2, gain: 0.5 }).voices;
    expect(v?.freq).toBe(880);
    expect(v?.gain).toBeCloseTo(0.1, 6);
  });

  it("flattens a repeat into one voice per hit, decaying", () => {
    const plan = planSound({
      ...one,
      layers: [{ ...one.layers[0]!, repeat: { times: 4, every: 0.1, decay: 0.5 } }],
    });
    expect(plan.voices).toHaveLength(4);
    expect(plan.voices.map((v) => v.start)).toEqual([0, 0.1, 0.2, 0.30000000000000004]);
    expect(plan.voices[3]?.gain).toBeCloseTo(0.2 * 0.125, 6);
  });

  it("stops a repeat once it has decayed below hearing", () => {
    const plan = planSound({
      ...one,
      layers: [{ ...one.layers[0]!, repeat: { times: 200, every: 0.01, decay: 0.5 } }],
    });
    expect(plan.voices.length).toBeLessThan(20);
  });

  it("detunes each repeat by the given percent", () => {
    const plan = planSound({
      ...one,
      layers: [{ ...one.layers[0]!, repeat: { times: 2, every: 0.1, decay: 1, detune: 100 } }],
    });
    expect(plan.voices[1]?.freq).toBeCloseTo(880, 6);
  });

  it("clamps a frequency into the audible range rather than handing the engine a zero", () => {
    const plan = planSound({ ...one, layers: [{ ...one.layers[0]!, freq: 4, toFreq: 90_000 }] });
    expect(plan.voices[0]?.freq).toBe(20);
    expect(plan.voices[0]?.toFreq).toBe(20_000);
  });

  it("measures its duration from the last voice's tail", () => {
    const plan = planSound({
      ...one,
      layers: [one.layers[0]!, { ...one.layers[0]!, at: 0.5 }],
    });
    expect(plan.duration).toBeCloseTo(0.63, 6);
    expect(endOf(plan.voices[1]!)).toBeCloseTo(0.63, 6);
  });

  it("lets the play's pan override the layer's own", () => {
    const withPan: SoundDef = { ...one, layers: [{ ...one.layers[0]!, pan: -0.9 }] };
    expect(planSound(withPan).voices[0]?.pan).toBe(-0.9);
    expect(planSound(withPan, { pan: 0.3 }).voices[0]?.pan).toBe(0.3);
  });
});
