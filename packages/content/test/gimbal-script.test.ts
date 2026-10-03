import { describe, expect, it } from "bun:test";
import { BEARING_TURN, DEFAULT_CONFIG, gimbalShownMilli, INNER, OUTER } from "@neon-spore/sim";
import { GIMBAL_SCRIPT } from "../src/gimbal-script.js";

/**
 * THE GIMBAL's six alignments are bearings a pair can actually reach, and
 * they are the curve of the fight: still marks with the window closing, then
 * creeping ones to chase.
 *
 * Every figure is on the **true** wheel, and every one of these is a thing
 * the simulation will not refuse on its own — a bearing outside a turn folds
 * silently, a mark nearer rest than its tolerance is a ring true before
 * anybody touches it, two marks within the tolerance of each other leave the
 * navigator nothing to turn once the outer ring has carried hers, and a creep
 * faster than the drift would make an alignment nobody can hold. A wave's
 * script is checked here, once, rather than on every beat.
 */
const marks = GIMBAL_SCRIPT;
const near = (a: number, b: number): number => {
  const d = (((a - b) % BEARING_TURN) + BEARING_TURN) % BEARING_TURN;
  return Math.min(d, BEARING_TURN - d);
};

describe("THE GIMBAL's script", () => {
  it("hangs six alignments, which is twelve latch-teeth", () => {
    expect(marks.length).toBe(6);
  });

  it("puts every bearing inside one turn, so nothing folds on its way in", () => {
    for (const m of marks) {
      for (const b of [m.outerMilli, m.innerMilli]) {
        expect(b).toBeGreaterThanOrEqual(0);
        expect(b).toBeLessThan(BEARING_TURN);
      }
    }
  });

  it("closes the window alignment by alignment, and never shut", () => {
    for (let i = 1; i < marks.length; i++) {
      expect(marks[i]?.trueMilli ?? 0).toBeLessThan(marks[i - 1]?.trueMilli ?? 0);
    }
    expect(marks[marks.length - 1]?.trueMilli ?? 0).toBeGreaterThan(0);
  });

  it("starts nowhere near rest, so every alignment is a turn and not a gift", () => {
    for (const m of marks) {
      expect(near(m.outerMilli, 0)).toBeGreaterThan(m.trueMilli);
      expect(near(m.innerMilli, 0)).toBeGreaterThan(m.trueMilli);
    }
  });

  it("and leaves the navigator a turn of her own once his has carried her ring", () => {
    for (const m of marks) expect(near(m.innerMilli, m.outerMilli)).toBeGreaterThan(m.trueMilli);
  });

  it("teaches the mirror first: his mark moves between the faces, hers does not", () => {
    const first = marks[0];
    expect(first?.creepMilli).toBe(0);
    const his = first?.outerMilli ?? 0;
    const hers = first?.innerMilli ?? 0;
    expect(gimbalShownMilli(his, INNER)).not.toBe(gimbalShownMilli(his, OUTER));
    expect(gimbalShownMilli(hers, INNER)).toBe(gimbalShownMilli(hers, OUTER));
  });

  it("and only the last two creep, slower than a let-go ring falls back", () => {
    const creeping = marks.filter((m) => m.creepMilli > 0);
    expect(creeping).toEqual(marks.slice(-2));
    for (const m of creeping) expect(m.creepMilli).toBeLessThan(DEFAULT_CONFIG.gimbalDriftMilli);
  });
});
