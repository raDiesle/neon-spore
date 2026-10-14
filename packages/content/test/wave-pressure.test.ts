import { describe, expect, it } from "bun:test";
import { entriesPressure, WAVES, wavePressure } from "../src/index.js";

/**
 * The curriculum's pressure score (`docs/spec/wave-curriculum.md` §5). Waves
 * by id, never by index.
 */
const wave = (id: string) => {
  const w = WAVES.find((x) => x.id === id);
  if (!w) throw new Error(`no wave ${id}`);
  return w;
};

describe("wave pressure", () => {
  it("ranks the shipped waves the way the plan reads them", () => {
    const rocks = wavePressure(wave("twoRocks")) ?? 0;
    const wall = wavePressure(wave("theWall")) ?? 0;
    const finale = wavePressure(wave("finale")) ?? 0;
    expect(rocks).toBeLessThan(wall);
    expect(wall).toBeLessThan(finale);
  });

  it("gives a boss wave none", () => {
    expect(wavePressure(wave("theInstar"))).toBeUndefined();
  });

  it("costs one slick in the centre exactly one", () => {
    expect(entriesPressure([{ beat: 0, col: 5, color: "red" }])).toBe(1);
  });

  it("costs a switch of job and a jump across the field", () => {
    const same = entriesPressure([
      { beat: 0, col: 5, color: "red" },
      { beat: 4, col: 5, color: "red" },
    ]);
    const switched = entriesPressure([
      { beat: 0, col: 5, color: "red" },
      { beat: 4, col: 5, color: "cyan" },
    ]);
    const far = entriesPressure([
      { beat: 0, col: 5, color: "red" },
      { beat: 4, col: 10, color: "red" },
    ]);
    expect(same).toBe(2);
    expect(switched).toBe(3);
    expect(far).toBe(3);
  });

  it("forgets what fell more than eight beats before", () => {
    const apart = entriesPressure([
      { beat: 0, col: 5, color: "red" },
      { beat: 8, col: 5, color: "red" },
    ]);
    expect(apart).toBe(1);
  });

  it("adds two for every fault", () => {
    expect(entriesPressure([{ beat: 0, col: 5, color: "red" }], 11, 2)).toBe(5);
  });
});
