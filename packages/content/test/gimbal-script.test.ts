import { describe, expect, it } from "bun:test";
import { BEARING_TURN, DEFAULT_CONFIG, gimbalShownMilli, INNER, OUTER } from "@neon-spore/sim";
import { GIMBAL_SCRIPT } from "../src/gimbal-script.js";

/**
 * THE GIMBAL's three alignments are bearings a pair can actually reach, and
 * they are the curve of the fight: two still ones to find the mirror in, and
 * a creeping one to chase.
 *
 * Every figure is on the **true** wheel, and every one of these is a thing
 * the simulation will not refuse on its own — a bearing outside a turn folds
 * silently, a pair of marks closer together than the tolerance would shear on
 * the first ring anybody moved, and a creep faster than the drift would make
 * an alignment nobody can hold. A wave's script is checked here, once, rather
 * than on every beat.
 */
describe("THE GIMBAL's script", () => {
  it("hangs three alignments, which is six latch-teeth", () => {
    expect(GIMBAL_SCRIPT.length).toBe(3);
  });

  it("puts every bearing inside one turn, so nothing folds on its way in", () => {
    for (const m of GIMBAL_SCRIPT) {
      expect(m.outerMilli).toBeGreaterThanOrEqual(0);
      expect(m.outerMilli).toBeLessThan(BEARING_TURN);
      expect(m.innerMilli).toBeGreaterThanOrEqual(0);
      expect(m.innerMilli).toBeLessThan(BEARING_TURN);
    }
  });

  it("starts nowhere near rest, so the first alignment is a turn and not a gift", () => {
    for (const m of GIMBAL_SCRIPT) {
      expect(Math.min(m.outerMilli, BEARING_TURN - m.outerMilli)).toBeGreaterThan(
        DEFAULT_CONFIG.gimbalTrueMilli,
      );
      expect(Math.min(m.innerMilli, BEARING_TURN - m.innerMilli)).toBeGreaterThan(
        DEFAULT_CONFIG.gimbalTrueMilli,
      );
    }
  });

  it("teaches the mirror first: the same true bearing, drawn on two faces apart", () => {
    const first = GIMBAL_SCRIPT[0];
    expect(first?.outerMilli).toBe(first?.innerMilli);
    expect(first?.creepMilli).toBe(0);
    const his = gimbalShownMilli(first?.outerMilli ?? 0, OUTER);
    const hers = gimbalShownMilli(first?.innerMilli ?? 0, INNER);
    expect(hers).not.toBe(his);
  });

  it("then breaks the offset a pair would have guessed from it", () => {
    const first = GIMBAL_SCRIPT[0];
    const second = GIMBAL_SCRIPT[1];
    const apart = (m: { outerMilli: number; innerMilli: number }): number =>
      (m.innerMilli - m.outerMilli + BEARING_TURN) % BEARING_TURN;
    expect(apart(second ?? { outerMilli: 0, innerMilli: 0 })).not.toBe(
      apart(first ?? { outerMilli: 0, innerMilli: 0 }),
    );
    expect(second?.creepMilli).toBe(0);
  });

  it("and only the last one creeps, slower than a let-go ring falls back", () => {
    const creeping = GIMBAL_SCRIPT.filter((m) => m.creepMilli > 0);
    expect(creeping.length).toBe(1);
    expect(GIMBAL_SCRIPT[GIMBAL_SCRIPT.length - 1]?.creepMilli).toBeGreaterThan(0);
    for (const m of creeping) {
      expect(m.creepMilli).toBeLessThan(DEFAULT_CONFIG.gimbalDriftMilli);
    }
  });
});
