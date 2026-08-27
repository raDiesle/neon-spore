import { describe, expect, it } from "bun:test";
import {
  DEFAULT_CONFIG,
  type SimConfig,
  VANE_CYCLE,
  VANE_CYCLE_BEATS,
  VANE_PHASES,
  vaneColor,
  vaneCycle,
  vaneCycleBeat,
  vaneFold,
  vaneOpening,
  vanePhase,
  vanePivotCol,
  vaneReach,
  vaneStageStart,
  vaneTipCol,
  vaneWeakCol,
} from "../src/index.js";

/**
 * THE VANE's cycle, held to the promises `docs/spec/transfers-bosses.md` makes
 * about it — the ones a pair has to be able to learn on their first turn.
 *
 * Everything here is arithmetic on a beat count, so it needs no world at all.
 * `vane.test.ts` next door is the fight; this is the clock, and the clock is
 * the half a wave author reads out of the director.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const PIVOT = vanePivotCol(CFG);

/** Every beat of one cycle, from the wave's first beat. */
const BEATS = Array.from({ length: VANE_CYCLE_BEATS }, (_, i) => i + 1);

describe("the cycle", () => {
  it("is the table and nothing beside it", () => {
    expect(VANE_CYCLE_BEATS).toBe(VANE_CYCLE.reduce((n, s) => n + s.beats, 0));
    expect(vaneStageStart(VANE_CYCLE.length)).toBe(VANE_CYCLE_BEATS);
  });

  it("starts a wave at the beginning of a cycle and comes round again", () => {
    expect(vaneCycleBeat(1)).toBe(0);
    expect(vaneCycle(1)).toBe(0);
    expect(vaneCycleBeat(1 + VANE_CYCLE_BEATS)).toBe(0);
    expect(vaneCycle(1 + VANE_CYCLE_BEATS)).toBe(1);
  });

  /**
   * The picture the whole fight hangs on: held at one end, across, held at the
   * other, back. Written out here rather than derived, because this is the one
   * place a second copy is the point — if the table is retuned into something
   * that no longer holds still at its ends, the encounter is gone and this
   * should say so out loud.
   */
  it("holds at each end, sweeps between them, and does both the same way round", () => {
    const tips = BEATS.map((b) => vaneTipCol(CFG, CFG.vanePins, b));
    const reach = vaneReach(CFG, CFG.vanePins);
    expect(tips).toEqual([
      PIVOT - reach,
      PIVOT - reach,
      PIVOT - reach,
      PIVOT - 1,
      PIVOT + 1,
      PIVOT + reach,
      PIVOT + reach,
      PIVOT + reach,
      PIVOT + reach,
      PIVOT + 1,
      PIVOT - 1,
      PIVOT - reach,
    ]);
  });

  it("reaches the end of its travel a beat before the housing splits", () => {
    // Beat 6 of the cycle opens; beat 5 is already at the far end. That beat is
    // the pair's tell, and a window with no tell in front of it cannot be
    // called across a voice delay.
    const at = (cycleBeat: number) => vaneTipCol(CFG, CFG.vanePins, cycleBeat + 1);
    expect(at(5)).toBe(at(6));
    expect(vaneOpening(6)).toBe(-1);
    expect(vaneOpening(7)).not.toBe(-1);
  });

  it("opens twice a cycle, in alternating colours, on alternating sides", () => {
    const open = BEATS.filter((b) => vaneOpening(b) !== -1);
    expect(open.length).toBe(6);
    const openings = [...new Set(open.map((b) => vaneOpening(b)))];
    expect(openings).toEqual([0, 1]);
    expect(vaneColor(0)).not.toBe(vaneColor(1));
    // The housing splits away from the load: arm hard left, split on its right.
    expect(vaneWeakCol(CFG, 1)).toBe(PIVOT + 1);
    expect(vaneWeakCol(CFG, 7)).toBe(PIVOT - 1);
    expect(vaneWeakCol(CFG, 4)).toBe(-1);
  });

  it("numbers its openings straight on into the next cycle", () => {
    expect(vaneOpening(1)).toBe(0);
    expect(vaneOpening(7)).toBe(1);
    expect(vaneOpening(1 + VANE_CYCLE_BEATS)).toBe(2);
    expect(vaneColor(vaneOpening(1 + VANE_CYCLE_BEATS))).toBe(vaneColor(0));
  });

  it("never points the arm off the field, however far the phase reaches", () => {
    for (const pins of [0, 1, 2, 3, 4, 5, 9]) {
      for (const b of BEATS) {
        const tip = vaneTipCol(CFG, pins, b);
        expect(tip).toBeGreaterThanOrEqual(0);
        expect(tip).toBeLessThanOrEqual(CFG.cols - 1);
      }
    }
  });
});

describe("the phases", () => {
  it("follow the pins and reach further as they go", () => {
    expect(vanePhase(CFG.vanePins).name).toBe(VANE_PHASES[0]!.name);
    expect(vanePhase(0).name).toBe(VANE_PHASES[VANE_PHASES.length - 1]!.name);
    const reaches = VANE_PHASES.map((p) => p.reach);
    for (let i = 1; i < reaches.length; i++) {
      expect(reaches[i]!).toBeGreaterThan(reaches[i - 1]!);
    }
  });

  it("changes nothing about the timing", () => {
    // Whatever the pins, the arm stands still on the same beats and is out at
    // an end on the same beats. Only how far out it has gone by then moves —
    // which is why the openings are a beat count and take no pins at all.
    const shape = (pins: number): string => {
      const reach = vaneReach(CFG, pins);
      return BEATS.map((b) => {
        const out = vaneTipCol(CFG, pins, b) - PIVOT;
        return out === -reach ? "L" : out === reach ? "R" : ".";
      }).join("");
    };
    expect(shape(5)).toBe(shape(3));
    expect(shape(5)).toBe(shape(1));
    expect(shape(5)).toBe("LLL..RRRR..L");
  });
});

describe("the fold", () => {
  it("puts a body as far the other side of the arm as it came in", () => {
    expect(vaneFold(CFG, 5, 2, "meteor")).toBe(8);
    expect(vaneFold(CFG, 5, 8, "meteor")).toBe(2);
    expect(vaneFold(CFG, 3, 1, "slick")).toBe(5);
  });

  it("leaves a body that comes in under the tip exactly where it is", () => {
    for (let col = 0; col < CFG.cols; col++) {
      expect(vaneFold(CFG, col, col, "meteor")).toBe(col);
    }
  });

  it("is its own undoing, which is what makes it a sentence and not a shuffle", () => {
    for (let tip = 2; tip <= CFG.cols - 3; tip++) {
      for (let col = 2; col <= CFG.cols - 3; col++) {
        const there = vaneFold(CFG, tip, col, "meteor");
        // Only where the throw stayed on the field: a body pinned against the
        // edge has lost the distance the fold would need to send it back.
        if (there === 2 * tip - col) expect(vaneFold(CFG, tip, there, "meteor")).toBe(col);
      }
    }
  });

  it("pins a body against the edge rather than losing it off the field", () => {
    expect(vaneFold(CFG, 1, 9, "meteor")).toBe(0);
    expect(vaneFold(CFG, 9, 1, "meteor")).toBe(CFG.cols - 1);
    // A torch is two columns wide and its whole span has to stay on the grid.
    expect(vaneFold(CFG, 9, 1, "torch")).toBe(CFG.cols - 2);
  });
});
