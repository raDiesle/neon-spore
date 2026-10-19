import { describe, expect, it } from "bun:test";
import { isRegularWave, WAVES, waveIntroduces } from "../src/index.js";

/**
 * The rule the director's ≡ press filters by (`wave-regular.ts`). Waves are
 * found by id, never by index: an act gaining a wave moves every number after
 * it.
 */
const at = (id: string): number => {
  const i = WAVES.findIndex((w) => w.id === id);
  if (i === -1) throw new Error(`no wave ${id}`);
  return i;
};

describe("regular waves", () => {
  it("calls a wave of two known colours regular", () => {
    expect(isRegularWave(WAVES, at("alternating"))).toBe(true);
    expect(waveIntroduces(WAVES, at("alternating"))).toEqual([]);
  });

  it("refuses the wave that introduces a body, and names what it introduces", () => {
    expect(isRegularWave(WAVES, at("cyan"))).toBe(false);
    expect(waveIntroduces(WAVES, at("cyan"))).toContain("bulb");
  });

  it("refuses a boss wave and the first wave on a panel", () => {
    expect(isRegularWave(WAVES, at("theInstar"))).toBe(false);
    expect(waveIntroduces(WAVES, at("firstStep"))).toContain("panel");
  });

  it("never calls a wave with a guide regular", () => {
    for (const [i, w] of WAVES.entries()) {
      if (w.guide) expect(isRegularWave(WAVES, i), w.name).toBe(false);
    }
  });
});
