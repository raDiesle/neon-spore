import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { WAVES } from "../src/index.js";

/**
 * **Every FLUE level runs on the shot grid's beat** (`sim/flue-lead.ts`
 * `flueEmberWait`): a level's speed divides four spans of the slot, so the
 * ember's run end to end and back is a whole number of half beats and every
 * crossing of the middle falls on a bolt laid on a half beat — none of them
 * between two, where no call could meet it. And THE SLOW's strength is a
 * slowing, never a speeding up. There is a level for every lobe of the flue,
 * one a column (the owner, 7 October 2026), and each asks the ember once at
 * least.
 */

const LEVELS = WAVES.flatMap((w) => (w.boss?.kind === "flue" ? w.boss.levels : []));
const LAP = 4 * DEFAULT_CONFIG.flueSpanMilli;

describe("THE FLUE's levels", () => {
  it("are authored at all", () => {
    expect(LEVELS.length).toBeGreaterThan(0);
  });

  it("each run a whole number of half beats end to end and back", () => {
    const off = LEVELS.filter((l) => l.speedMilli <= 0 || LAP % l.speedMilli !== 0);
    expect(off).toEqual([]);
  });

  it("are one for every lobe of the flue, which is one a column", () => {
    const waves = WAVES.flatMap((w) => (w.boss?.kind === "flue" ? [w.boss.levels] : []));
    for (const levels of waves) expect(levels.length).toBe(DEFAULT_CONFIG.cols);
  });

  it("each ask the ember once at least", () => {
    expect(LEVELS.filter((l) => !Number.isInteger(l.needs) || l.needs < 1)).toEqual([]);
  });

  it("each slow the field or leave it alone", () => {
    expect(LEVELS.filter((l) => l.slowMilli <= 0 || l.slowMilli > 1000)).toEqual([]);
  });
});
